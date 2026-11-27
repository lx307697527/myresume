---
title: Claude Code 子 Agent 一开 worktree,Git 钩子为什么就跑错了?
description: 用了 Claude Code 子 Agent 的工作树隔离后,推送前检查突然跑成了主目录那一份、推送被拒?AllyOS 的一次真实复盘:怎么复现、根因在哪、为什么把修复挂在 SubagentStart 钩子上,以及 68 毫秒复原的实测。
answer: Claude Code 每次新建 worktree(包括子 Agent 的工作树隔离),都会把共享 `.git/config` 里相对写法的 `core.hooksPath` 改成主目录的绝对路径,之后没单独钉住配置的工作目录都会去跑主目录那份 Git 钩子。解法是把同一个"改回相对路径"的修复脚本同时挂到 SessionStart、PostToolUse(EnterWorktree)和 SubagentStart 三个入口,实测 68 毫秒内复原。
date: 2026-11-27
updated: 2026-11-27
pillar: incident
keyword: Claude Code worktree Git 钩子失效
tags: Claude Code, 子 Agent, Git worktree, Git hooks, 研发守卫, 事故复盘
source: c93877854072
---

## 先说背景:worktree 和 Git 钩子各管什么

[AllyOS](https://myaiwebdev.com/#allyos) 是我用 Claude Code 和一组 AI Agent 搭起来的业务系统。它的研发方式是:每个任务在自己的工作目录里做,做完推送前,由一道 Git 钩子跑上百道自动检查,不全绿就不许推送。这次出问题的,正是这两样东西的交界处。

先用大白话把三个概念讲清楚:

- **worktree(工作树)**:同一个 Git 仓库同时开出好几张"工作台",每个任务在自己的工作台上改,互不打扰。Claude Code 的子 Agent 设了 `isolation: worktree` 时,就会给它单独开一张。
- **Git 钩子**:提交或推送前自动运行的检查脚本,相当于门卫。
- **`core.hooksPath`**:告诉 Git"门卫脚本放在哪"的配置。写成相对路径(比如 `.githooks`)时,每张工作台用的是**自己分支里**那一版门卫;一旦写成绝对路径,所有工作台都去用**主目录**那一版。

打个比方:每个车间本来各有一个门卫,按本车间最新的规定检查;改成绝对路径,就等于所有车间都把人送到总部大门去查,而总部大门上贴的,可能还是上周的旧规定。

## 症状:推送突然被拒,过一阵又自己好了

2026-11-25 下午,一台开发机上连着出现两次:从任务的工作台推送,被一道专门核对"钩子路径对不对"的守卫拒绝;等到这台机器下一次启动 Claude Code 会话,问题又自己消失了。

这道守卫是故意设计成"跑错就拒推"的。如果没有它,错误版本的检查会悄悄跑完、悄悄放行,你根本不会知道这次推送其实没被正确检查过。**宁可拦下,也不静默放行**,是 AllyOS 所有守卫的共同原则。

## 怎么复现:每 0.2 秒盯一次配置

想抓住"谁、在什么时候改了配置",最笨也最可靠的办法是轮询:每 0.2 秒读一次共享配置里的值,一变就记一行时间。

```bash
# 每 0.2 秒读一次共享配置里的 core.hooksPath,值一变就打印时间戳(GNU date)
common=$(git rev-parse --path-format=absolute --git-common-dir)
prev=""
while true; do
  cur=$(git config --file "$common/config" --get core.hooksPath)
  if [ "$cur" != "$prev" ]; then
    echo "$(date +%T.%3N) $cur"
    prev="$cur"
  fi
  sleep 0.2
done
```

然后在会话里起一个带工作树隔离的子 Agent。2026-11-26 用 Claude Code 2.1.332 在 macOS 上实测,记录如下(路径已做通用化处理):

```text
17:46:11.119 .githooks
17:46:14.931 /Users/…/repo/.githooks   ← 子 Agent 的工作台刚建好
17:47:26.988 .githooks                  ← 手动跑修复后才改回
```

绝对路径保持了 72 秒,期间没有任何东西去修它;如果不手动处理,会一直保持到这台机器下次启动会话。

## 根因:修复规则早就有,只是少接了一个入口

Claude Code 在三种情况下会新建 worktree,并顺手把这个配置改成绝对路径:

1. 会话中途用 EnterWorktree 切到新的工作台;
2. 用 `claude --worktree` 启动;
3. 子 Agent 设了工作树隔离。

AllyOS 之前遇到过一次同样的问题,当时写下的规则是对的:"Claude Code 每次建完工作台,都跑一次修复脚本,把路径改回相对值。"但修复脚本只挂在了两个时机上:会话启动(SessionStart)和 EnterWorktree 工具调用之后(PostToolUse)。前两种情况都被覆盖了,第三种——子 Agent 建工作台——不经过这两个事件里的任何一个。

**规则是对的,入口没接全。** 这类问题在我们的事故库里有个专门的分类,叫"兄弟入口遗漏":同一个机制有好几个触发入口,修的时候只补了眼前那一个。这次是同一根因第二次出现。

## 修法:为什么挂在 SubagentStart,而不是 PostToolUse(Agent)

能接住子 Agent 的时机有两个候选。为了不靠猜,我临时加了两个只记录时间和输入的"探针"钩子,再起一个子 Agent 实测:

- **SubagentStart**:在子 Agent 的工作台建好、绝对路径写进去之后立刻触发,而且它的当前目录就是子 Agent 的新工作台,正好在现场修。
- **PostToolUse(Agent)**:后台运行的子 Agent 在同一时刻触发;但前台(同步)运行的子 Agent,要等它**整个跑完**才触发——这段时间配置一直是错的。

所以选 SubagentStart,而且不设 matcher,所有类型的子 Agent 都触发。最终配置长这样(脚本名已改为通用写法):

```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }],
    "PostToolUse": [{ "matcher": "EnterWorktree", "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }],
    "SubagentStart": [{ "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }]
  }
}
```

修复脚本本身很短,关键是三个性质:**幂等**(跑多少次结果都一样)、**永远退出 0**(绝不挡住子 Agent 启动)、**只动"指向本仓库钩子目录的绝对路径"这一种值**。一个通用的写法:

```python
# 把共享配置里"指向主目录钩子的绝对路径"改回相对路径;幂等,永远退出 0
import os, subprocess
def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True).stdout.strip()
common = git("rev-parse", "--path-format=absolute", "--git-common-dir")
config = os.path.join(common, "config")
main_root = os.path.dirname(common)
cur = git("config", "--file", config, "--get", "core.hooksPath")
if cur and os.path.isabs(cur) and os.path.relpath(cur, main_root) == ".githooks":
    git("config", "--file", config, "core.hooksPath", ".githooks")
```

代价也要说清楚:之后每次启动子 Agent,都会多跑一个 Python 进程和几次 git 调用;子 Agent 的上下文开头会多两行钩子输出。已知盲区:少数内部子 Agent 不发 SubagentStart 事件(读代码得出,未实测)。

## 实测数字

| 指标 | 数值 | 怎么测的 |
|---|---|---|
| 修复前,错误路径保持时间 | 72 秒(不手动修会一直保持到下次会话启动) | 2026-11-26,每 0.2 秒轮询 |
| 修复后,自动改回用时 | 68 毫秒 | 2026-11-26,每 10 毫秒轮询 |
| 另外两轮复测 | 一轮 0.213 秒内改回;一轮在两次轮询之间就已改回 | 2026-11-26,每 0.2 秒轮询 |
| 会改写这个配置的入口 | 3 个 | Claude Code 2.1.332 行为核对 |
| 同一根因出现次数 | 第 2 次 | AllyOS 事故库 |
| AllyOS 累计事故复盘 | 1,056 份 | 2026-11-27 仓库实测 |

## 可以照做的清单

1. `core.hooksPath` 用相对路径,让每个 worktree 跑自己分支里的钩子。
2. 加一道"钩子跑错就拒推"的检查——宁可拦下,也不静默放行。
3. 修复脚本同时挂在 SessionStart、PostToolUse(EnterWorktree)、SubagentStart 三个入口。
4. 修复脚本必须幂等、永远退出 0,不能挡住子 Agent 启动。
5. 修完用同一个轮询脚本复测,把"多久复原"写成一个数字,而不是"应该好了"。
6. 修任何 bug,都按"机制"而不是按"症状"搜一遍兄弟入口。

钩子事件的完整说明见 Claude Code 官方文档的 [Hooks 参考](https://code.claude.com/docs/en/hooks);worktree 与钩子路径的行为见 Git 官方文档 [git-worktree](https://git-scm.com/docs/git-worktree) 与 [githooks](https://git-scm.com/docs/githooks)。

## 常见问题

### 不用子 Agent 的工作树隔离,会遇到这个问题吗?

只要用了会新建 worktree 的方式就可能遇到:会话中途切换 worktree、用 `claude --worktree` 启动、子 Agent 工作树隔离,三者任一都会触发。只在一个目录里工作、从不建 worktree 的项目不受影响。以上基于 Claude Code 2.1.332 的实测。

### 给每个 worktree 单独设置 core.hooksPath 不就行了?

可以,AllyOS 也这么做了:打开 Git 的 `extensions.worktreeConfig` 后,用 `git config --worktree` 把每张工作台的值钉住。但 Claude Code 改的是**共享**配置,没钉住的工作台仍然会被影响,所以"钉住"和"事后改回"两手都要。

### 这个问题最终应该由谁来修?

理想情况是写入方保留相对写法,或者干脆不写。在上游行为改变之前,用钩子在本地兜底是成本最低的办法:每次只多一个 Python 进程和几次 git 调用。如果你的团队也在用 Claude Code,想把这类守卫装进自己的仓库,可以看看[服务与流程](https://myaiwebdev.com/services.html)。
