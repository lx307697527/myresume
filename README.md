# myresume · 晨星·路西法个人简历网站

**在线地址:https://myaiwebdev.com**(品牌域名,唯一权威地址)· [GitHub Pages 镜像](https://lx307697527.github.io/myresume/)

纯静态简历网站,无框架、无构建依赖,开箱即用。
首页是滚动叙事:讲一座自动化代码开发工厂(claude-dev-harness)怎么造出 AllyOS,以及怎么买;真实数据驱动。

## ✨ 设计原则(v5 · 自动化代码开发工厂 · 滚动叙事首页)

首页围绕一个比方讲:**AllyNutra 是一家营养品代工厂,原料进去、按工序、过质检,胶囊出来;我给它的软件也建了一座工厂
(claude-dev-harness),需求进去、按规格、按工序、过质检,上线的代码出来。** 这座工厂现在单独出售。

首页十个章节:开场 → 问题(混乱到秩序)→ 代码工厂(七层)→ 工序 → 出厂质检 → 证据 → 买一座工厂 → 经历 → 笔记 → 合作 / 联系 / 问答。
三条路径分流:

- **求职路径(HR / 技术负责人)**:「代码工厂」「证据」两章,AllyOS / TeacherCopilot 案例卡数字前置。
- **买工厂路径(有研发团队的公司)**:首页「买一座工厂」章 + 服务页 `services.html#factory`,三种买法:工厂授权 / 装机交付 / 驻厂改进。
- **获客路径(中小企业老板)**:服务页 `services.html`,用非技术语言写清接什么、怎么交付、怎么计费。

### 首页 v5 的动效约定(`css/home.css`、`js/home.js` 顶部也写着)

首页从 v5 起**有意推翻** v4 的"不做视差 / pin、没有 scroll 监听"。做法照搬 AllyOS 官网首页的滚动叙事,用下面几条守住性能:

- **只有一个滚动监听**,用 `requestAnimationFrame` 合并;每帧只读一次滚动位置,只写变化了的 CSS 变量和属性
- **被钉住的章节只读一个 `--p`(0→1)**,位移、透明度、3D 叠层、圆形展开都由它算;只动 transform / opacity / clip-path
- **量尺寸只在加载和改窗口时**;手机地址栏伸缩不算改窗口
- **静态版就是完整版**:所有文字和数字的默认值都是最终值。没有 JS、宽度 ≤ 760px、窗口高度 < 640px、
  系统开了"减少动态效果",看到的都是完整静态版(不钉住、不回放、canvas 和 3D 叠层换成文字版)
- **canvas 只在它那一章在屏幕上时逐帧画**;传送带离开屏幕就暂停
- **零框架**,系统字体,无网络字体;颜色纪律不变:强调靠实心近黑,不靠色相;点击区域 ≥ 44px;390px 宽无横向滚动

服务页、笔记、博客仍然用 `css/style.css` + `js/main.js`,那边的 v4 约定不变(原生滚动、只有入场淡入)。

### 数字口径(2026-11-28 在 AllyOS `develop` 分支实测)

| 数字 | 口径 |
|---|---|
| 连续运行天数 | 2026-07-18 起,页面每天自动计算(`data-days`) |
| 1,280 个需求 | 已分配到的最大 FEAT 编号 |
| 118 道守卫 | `scripts/check_*.py` 个数;133 = 守卫自测文件个数 |
| 1,630 次迁移 / 1,348 个数据库测试 | `supabase/migrations/*.sql` / `supabase/tests/**/*.sql` 个数 |
| 1,057 份事故记录 → 19 条规则 | `ops/incidents/BUG-*` / `ops/rules/RULE-*` 个数 |
| 25 个模块 / 89 个边缘函数 / 7 个子 Agent / 14 个技能 | 根地图模块表行数 / `supabase/functions` 目录数 / `.claude/agents` / `.claude/skills` |

改数字时 `index.html`(正文 + JSON-LD)、`services.html`、`llms.txt` 三处一起改。

交付前自检:桌面浅色 / 深色、手机 390px 截图无溢出;控制台无报错。v5 上线后需要重新跑一次 Lighthouse 移动端
(v4 在 2026-11-13 实测为 性能 99 / 无障碍 100 / 最佳实践 100 / SEO 100,LCP 1.8s)。

## 🎬 AllyOS 短片(Remotion)

短片源码在 `video/`(React + Remotion),渲染产物提交在 `assets/`,网站本身仍是**零构建**的静态页:

```bash
cd video
npm install
npm run studio     # 浏览器里逐帧预览、调动画
npm run render     # 输出 assets/allyos-film.mp4、assets/allyos-poster.jpg、og-image.png
```

- 片中所有数字集中在 `video/src/data.ts`(2026-11-13 AllyOS 仓库实测),改完重新 render 即可
- v5 首页不再内嵌短片(数字还是 2026-11-13 快照);`assets/` 里的成片和海报保留,更新 `data.ts` 重新 render 后可以再放回首页
- 分享卡片 `og-image.png` 由同一工程的 `OgCard` 静帧生成,视觉语言与短片一致
- 渲染时优先用本机 Chromium(`REMOTION_BROWSER` 环境变量可指定),没有则由 Remotion 自动下载

## 📝 博客(每日一篇,中英双版)

每天从 AllyOS 的一个真实问题出发写一篇,讲清问题、解法和实测数字。规则全部写在
[`_blog/EDITORIAL.md`](_blog/EDITORIAL.md)(定时任务每次运行前先读它;改策略只改这份文件)。

```bash
python3 scripts/blog.py new <英文短链> --pillar incident   # 生成中英两份骨架
python3 scripts/blog.py build                             # 源稿 → 文章页、博客首页、RSS、sitemap、llms.txt、首页"最新文章"
python3 scripts/blog.py check --strict --denylist <私有词表> # 质量门槛 + 信息安全红线 + 产物同步,不过就不发
python3 scripts/test_blog.py                              # 证明红线规则真的会拦
```

- **网站仍是零构建**:脚本只在写文章时运行,产物提交进仓库,和 `video/` 渲染短片同一个思路;脚本只用 Python 标准库。
- **源稿在 `_blog/`**:下划线开头,GitHub Pages 不会发布它,避免重复页面。
- **信息安全**:公开仓库里只放"形状类"规则(邮箱、金额、密钥、内部编号、内部路径……);客户 / 供应商 / 真名等具体词条
  只在运行时通过 `--denylist` 或环境变量 `BLOG_DENYLIST` 传入,**绝不提交**。`--strict` 模式下没有词表直接失败。
- **GitHub Action**(`.github/workflows/blog.yml`):PR 与 main 上跑检查;合并进 main 后等线上部署完成,再用
  IndexNow 通知 Bing(ChatGPT 搜索很大程度依赖 Bing 索引)。密钥文件是根目录的 `2d090988…txt`(按协议必须公开)。
- **每篇的 SEO / GEO**:问题式标题 + 一句话答案置顶;`BlogPosting`(作者指向首页 `#person` 实体)+ 面包屑 + `FAQPage`
  结构化数据;中英互为 `hreflang`;sitemap 带多语言互链;RSS;`llms.txt` 自动追加最新文章清单。

## 📁 目录结构

```
├── index.html      # 首页(求职路径:6 秒测试 + 深度工程证据,个人信息都在这里改,✏️ 注释标记了可编辑处)
├── services.html   # 服务与流程页(获客路径:接什么 / 怎么交付 / 怎么计费,老板向非技术语言)
├── blog/  en/blog/ # 博客产物(scripts/blog.py 生成,勿手改):中文 / 英文文章页、列表页、RSS
├── _blog/          # 博客源稿(posts/*.zh.md + *.en.md)、编辑手册 EDITORIAL.md、外链白名单
├── scripts/        # blog.py(生成 + 检查,零依赖)与 test_blog.py(自测)
├── assets/         # Remotion 渲染产物:allyos-film.mp4 + allyos-poster.jpg
├── video/          # 短片源码(Remotion 工程,不参与网站运行)
├── css/style.css   # 样式(主题色在 :root 与 html[data-theme="light"] 变量中)
├── js/main.js      # 交互脚本(约 5KB,零依赖,无 scroll 监听)
├── robots.txt      # 爬虫规则(已明确放行 GPTBot / ClaudeBot / PerplexityBot 等 AI 爬虫)
├── sitemap.xml     # 站点地图(首页 + services.html + 博客,博客部分由 scripts/blog.py 生成)
├── llms.txt        # 面向大语言引擎的站点摘要(GEO,含服务页事实清单)
├── og-image.png    # 社交分享卡片图(1200×630)
└── favicon.svg     # 网站图标
```

## 🔍 SEO / GEO 说明

**SEO(面向 Google / Bing / 百度等搜索引擎)**

- `title` / `description` / `keywords` / `canonical` / `robots` meta 完整
- Open Graph + Twitter Card:分享到微信 / Telegram / X 等平台会显示 `og-image.png` 卡片
- JSON-LD 结构化数据:`Person`(实体档案 + sameAs)、`WebSite`、`FAQPage`(与页面可见 FAQ 内容一致)、`HowTo`(七步流水线)、`SoftwareApplication`(AllyOS / TeacherCopilot)、`ProfessionalService`(服务页)
- 域名统一:canonical、`sitemap.xml`、`robots.txt`、`llms.txt`、og:image 全部指向品牌域名 **https://myaiwebdev.com**;GitHub Pages 镜像的 canonical 跨域指回品牌域名,消除信号分裂
- 地理 meta(`geo.region CN-51`、`geo.placename 成都`)与语义化 HTML(单一 h1、层级化 h2/h3)
- 静态直出内容:全部正文都在 HTML 里,不依赖 JS 渲染,爬虫可完整抓取

**GEO(面向 ChatGPT / Perplexity / AI 搜索等生成式引擎)**

- `robots.txt` 明确放行 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、anthropic-ai、PerplexityBot、Google-Extended、Applebot-Extended
- `llms.txt`:站点级机器可读摘要(行业新标准),把"是谁 / 技术栈 / 项目 / 关键数字"写成事实清单
- FAQ 问答区块:AI 引擎最偏好引用的事实型问答(`是谁 / 技术栈 / TeacherCopilot 是什么 / 成果 / 联系方式`),带数字证据
- JSON-LD 实体数据 + `sameAs` 关联 GitHub 与产品站,帮助 AI 引擎做实体消歧("晨星·路西法 = 这个 GitHub 账号 = TeacherCopilot 作者")

**域名与收录入口(2026-11-16 域名统一已完成,以下需你的账号手动执行)**

1. [Google Search Console](https://search.google.com/search-console) 添加 `https://myaiwebdev.com` 资源并提交 `sitemap.xml`
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) 同步提交(GPT 检索来源)
3. [百度搜索资源平台](https://ziyuan.baidu.com) 用"HTML 标签"验证品牌域名(占位注释已备在 `index.html` head 里)

**站外引用清单(P2:让品牌域名被外部语境"提起"——SEO 反链 + GEO 实体锚点)**

按优先级从高到低,每处引用 `https://myaiwebdev.com`:

1. **GitHub Profile README**(建 `lx307697527/lx307697527` 仓库):github.com 权重高,是"晨星·路西法 = 这个 GitHub 账号"实体消歧的第一锚点
2. **GitHub 各仓库**:TeacherCopilot、UniInsight 等产品仓库的 README、About 描述、Topics 链回品牌域名
3. **TeacherCopilot 产品站**(teachercopilot.pages.dev):页脚 / 关于页互链,自有站点形成引用网络
4. **知乎**:个人简介 + 围绕"AI 写代码如何把关"写深度回答与专栏(中文 AI 引擎引用率最高的来源)
5. **掘金 / CSDN / V2EX / SegmentFault**:技术长文 + 个人主页资料页
6. **LinkedIn / 脉脉**:职业档案的"网站"字段
7. **Stack Overflow**:profile About me + 高质量技术回答
8. **日常触点**:邮件签名、X / 即刻等社交简介、协作文档署名

## ✏️ 常用自定义

1. **个人信息 / 经历 / 项目**:编辑 `index.html`,所有可改位置都有 `<!-- ✏️ -->` 注释。
2. **主题配色**:编辑 `css/style.css` 顶部 `:root`(冷白浅色)与 `html[data-theme="dark"]`(冷炭深色)中的 `--accent`(强调色)/ `--ink`(墨色)/ `--paper`(底色)变量。
3. **联系方式**:搜索 `307697527@qq.com` 与 `github.com/lx307697527` 全局替换。

## 🚀 本地预览

直接双击 `index.html` 即可打开;或启动一个本地服务:

```bash
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 🌍 部署到 GitHub Pages

1. 把代码推送到仓库 `main` 分支:

   ```bash
   git add .
   git commit -m "feat: 重新设计的个人简历网站"
   git push origin main
   ```

2. 打开仓库 **Settings → Pages**,Source 选择 `main` 分支 `/ (root)`,保存。
3. 稍等片刻,GitHub Pages 镜像在 `https://lx307697527.github.io/myresume/`;品牌域名 **https://myaiwebdev.com**(Vercel)随后自动部署。两个地址服务同一份内容,品牌域名是唯一权威地址——所有 canonical / sitemap / llms.txt 都指向它。

## 📄 License

Apache-2.0(见 [LICENSE](LICENSE))
