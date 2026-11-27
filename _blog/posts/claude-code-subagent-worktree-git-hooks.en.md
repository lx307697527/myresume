---
title: Why Claude Code Subagent Worktrees Silently Break Your Git Hooks
description: Claude Code rewrites core.hooksPath to an absolute path whenever it creates a worktree, subagents included. The repro, the SubagentStart fix, a 68 ms recovery.
answer: When Claude Code creates a worktree, including a subagent's isolated worktree, it rewrites the relative `core.hooksPath` in the shared `.git/config` to an absolute path, so every unpinned worktree runs the main checkout's hooks. Run one idempotent repair script from SessionStart, PostToolUse (EnterWorktree) and SubagentStart; we measured recovery in 68 ms.
date: 2026-11-27
updated: 2026-11-27
pillar: incident
keyword: claude code worktree git hooks
tags: Claude Code, subagents, git worktree, git hooks, core.hooksPath, incident review
source: c93877854072
---

## Background: what worktrees and git hooks are doing for you

[AllyOS](https://myaiwebdev.com/#allyos) is the business system I built with Claude Code and a team of AI agents. Every task runs in its own working directory, and before anything is pushed, a git hook runs over a hundred automated checks. Nothing goes out unless they are all green. This incident sat right where those two ideas meet.

Three terms, in plain words:

- **Worktree**: one git repository checked out at several "workbenches" at once, so parallel tasks never step on each other. When a Claude Code subagent is configured with `isolation: worktree`, it gets a workbench of its own.
- **Git hook**: a script git runs automatically before a commit or push. Think of it as a security guard at the door.
- **`core.hooksPath`**: the setting that tells git where the guard lives. A relative value such as `.githooks` means each workbench uses the guard from **its own branch**. An absolute value sends every workbench to the guard in the **main checkout**.

An analogy: every workshop used to have its own guard, checking people against that workshop's latest rules. An absolute path is like sending everyone to the head-office gate instead, where the notice on the wall may still be last week's.

## The symptom: pushes rejected out of nowhere, then fixed by themselves

On the afternoon of 2026-11-25, the same thing happened twice on one developer machine. Pushes from a task's worktree were rejected by a guard whose only job is to verify that the right hooks are running. The next time a Claude Code session started on that machine, the problem quietly disappeared.

That guard rejects on purpose. Without it, the wrong version of the checks would run, pass, and let the push through, and nobody would ever know the change had not been checked properly. **Block loudly rather than pass silently** is the rule every AllyOS guard follows.

## Reproducing it: watch the config every 0.2 seconds

To catch who changes the setting and when, the dumbest and most reliable tool is polling: read the shared value every 0.2 seconds and log a timestamp whenever it changes.

```bash
# Print a timestamp whenever the shared core.hooksPath changes (GNU date)
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

Then start a subagent with worktree isolation. Measured on 2026-11-26 with Claude Code 2.1.332 on macOS (paths genericized):

```text
17:46:11.119 .githooks
17:46:14.931 /Users/…/repo/.githooks   ← the subagent's worktree was just created
17:47:26.988 .githooks                  ← restored only after a manual repair
```

The absolute path stayed for 72 seconds and nothing tried to fix it. Left alone, it would have stayed until the next session started on that machine.

## Root cause: the right rule, one missing entry point

Claude Code creates a worktree, and rewrites this setting to an absolute path, in three situations:

1. switching to a new worktree mid-session with EnterWorktree;
2. starting with `claude --worktree`;
3. a subagent configured with worktree isolation.

AllyOS had hit the same problem once before, and the rule written down then was correct: "every time Claude Code creates a worktree, run the repair script that puts the relative path back." But the repair was only wired to two events: SessionStart, and PostToolUse after the EnterWorktree tool. That covered the first two situations. The third, a subagent creating its own worktree, goes through neither event.

**The rule was right; the wiring was incomplete.** Our incident log has a category for exactly this, a "missed sibling entry point": one mechanism with several triggers, and the earlier fix only patched the trigger in front of it. This was the second time the same root cause showed up.

## The fix: why SubagentStart and not PostToolUse on Agent

There were two candidate events. Instead of guessing, I added two throwaway probe hooks that only log the time and their input, and started a subagent:

- **SubagentStart** fires right after the subagent's worktree has been created and the absolute path written, and its working directory is the subagent's new worktree, which is exactly where the repair should run.
- **PostToolUse on Agent** fires at the same moment for background subagents, but for foreground (synchronous) subagents it only fires after the **whole subagent finishes**. The config is wrong for that entire time.

So the repair goes on SubagentStart, with no matcher, so every subagent type triggers it. The final settings look like this (script name genericized):

```json
{
  "hooks": {
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }],
    "PostToolUse": [{ "matcher": "EnterWorktree", "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }],
    "SubagentStart": [{ "hooks": [{ "type": "command", "command": "python3 tools/repair_hooks_path.py" }] }]
  }
}
```

The repair itself is short. What matters is three properties: it is **idempotent**, it **always exits 0** so it can never block a subagent from starting, and it **only touches one kind of value**, an absolute path to this repository's own hooks directory. A generic version:

```python
# Put an absolute hooks path pointing at the main checkout back to relative; idempotent, always exits 0
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

The cost, stated plainly: every subagent start now runs one Python process and a few git calls, and the subagent's context begins with two extra lines of hook output. Known gap: a few internal subagents do not emit SubagentStart (found by reading the code, not measured).

## Measured numbers

| Metric | Value | How we measured |
|---|---|---|
| Wrong path persisted, before the fix | 72 s (until the next session start if left alone) | 2026-11-26, polling every 0.2 s |
| Time to restore, after the fix | 68 ms | 2026-11-26, polling every 10 ms |
| Two more runs | restored within 0.213 s; restored between two polls | 2026-11-26, polling every 0.2 s |
| Entry points that rewrite the setting | 3 | Claude Code 2.1.332 behavior check |
| Occurrences of this root cause | 2nd | AllyOS incident log |
| AllyOS incident reviews to date | 1,056 | counted in the repository on 2026-11-27 |

## A checklist you can copy

1. Keep `core.hooksPath` relative so each worktree runs the hooks from its own branch.
2. Add a check that refuses to push when the wrong hooks are running. Block loudly; never pass silently.
3. Wire the repair to all three entry points: SessionStart, PostToolUse (EnterWorktree) and SubagentStart.
4. Make the repair idempotent and always exit 0, so it never blocks a subagent.
5. Re-run the same polling script after the fix and record "time to restore" as a number, not "should be fine now".
6. When you fix any bug, search for sibling entry points by mechanism, not by symptom.

The full list of hook events is in Claude Code's [hooks reference](https://code.claude.com/docs/en/hooks). Worktree and hooks-path behavior is documented in git's [git-worktree](https://git-scm.com/docs/git-worktree) and [githooks](https://git-scm.com/docs/githooks) pages.

## FAQ

### Does this affect me if I never use subagent worktree isolation?

Any path that creates a worktree can trigger it: switching worktrees mid-session, starting with `claude --worktree`, or a subagent with worktree isolation. Projects that work in a single directory and never create worktrees are not affected. This is based on measurements with Claude Code 2.1.332.

### Can't I just set core.hooksPath per worktree?

You can, and AllyOS does: enable git's `extensions.worktreeConfig`, then pin each worktree's value with `git config --worktree`. But Claude Code writes the **shared** config, so any worktree without a pin is still affected. You want both the pin and the after-the-fact repair.

### Who should ultimately fix this?

Ideally the writer keeps the relative value, or does not write it at all. Until that changes upstream, a local hook is the cheapest safety net: one Python process and a few git calls per subagent. If your team uses Claude Code and wants guards like this in its own repository, see my [services page (in Chinese)](https://myaiwebdev.com/services.html) or email me.
