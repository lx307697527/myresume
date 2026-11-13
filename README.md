# myresume · 刘星个人简历网站

纯静态单页简历网站,无框架、无构建依赖,开箱即用。
设计与内容基于本人简历重新设计:纸墨编辑风(米白纸感 + 墨色衬线 + 朱砂印章),真实数据驱动。

## ✨ 功能

- 🎬 **AllyOS 旗舰案例放映厅**:用 [Remotion](https://www.remotion.dev/) 渲染的 40 秒短片,讲清「一个需求如何走完 AI 研发流水线」—— 进入视口自动静音播放、章节跳转、时间码;深浅主题下都是暗场
- 单页滚动式布局:首页 / 关于 / 技能栈 / 职业经历 / 项目经验 / 教育 / FAQ / 联系
- 🎨 纸墨编辑风:米白纸感底 · 墨色衬线大标题 · 朱砂印章 · 发丝分隔线;🌗 深浅色切换(默认跟随系统,记忆选择,刷新不闪烁)
- 🖥️ 首屏 TypeScript 代码风格个人档案卡 + 打字机轮播头衔
- 📊 关键数字滚动动画(12 年经验 / 3 年 AI Agent / 30+ 团队 / 6500+ 门店)
- 🏆 重点项目 TeacherCopilot 渐变高亮卡(已上线 · 已盈利)
- 📱 完整响应式,适配手机 / 平板 / 桌面
- ♿ `prefers-reduced-motion` 动效降级
- ⚡ 酷炫增强层(见下文)
- 🔍 SEO + GEO 友好(见下文)

## ⚡ 酷炫增强层(Three.js / GSAP / Lenis)

通过 jsDelivr CDN 加载,**任何一环加载失败或设备不支持时自动降级**为纯 CSS 版本,内容永远可见:

- 🌊 **Three.js 墨浪粒子场**:首屏背景墨色粒子随正弦波流动,鼠标靠近会推开粒子,含稀疏朱砂色粒子;主题切换自动换色
- 🖼️ **可拖拽 3D 朱砂印章**:首屏印章升级为真实 3D 物体,可拖拽旋转、带惯性与自转浮动,盖章式入场动画;移动端 / 无 WebGL 自动回退 SVG 印章
- ✍️ **GSAP + ScrollTrigger**:主标题与各区块标题逐字升起,滚动编排入场,朱砂底纹随滚动展开
- 🧲 **磁性按钮**:主按钮跟随鼠标轻微位移
- 🌐 **Lenis 惯性滚动**:全站顺滑滚动,锚点平滑跳转
- 🎞️ **无限滚动词条**:技能关键词跑马灯(悬停暂停)
- 📊 **顶部阅读进度条** + 关键数字滚动 + 打字机头衔
- ♿ `prefers-reduced-motion` 时全部增强自动禁用;移动端不加载 3D,保证性能

## 🎬 AllyOS 短片(Remotion)

短片源码在 `video/`(React + Remotion),渲染产物提交在 `assets/`,网站本身仍是**零构建**的静态页:

```bash
cd video
npm install
npm run studio     # 浏览器里逐帧预览、调动画
npm run render     # 输出 assets/allyos-film.mp4、assets/allyos-poster.jpg、og-image.png
```

- 片中所有数字集中在 `video/src/data.ts`(2026-11-13 AllyOS 仓库实测),改完重新 render 即可
- 7 个章节的起点(帧)在 `data.ts` 的 `CHAPTERS`;改了时长要同步 `index.html` 里 `#reelChapters` 的 `data-t`(秒 = 帧 / 30)
- 分享卡片 `og-image.png` 由同一工程的 `OgCard` 静帧生成,视觉语言与短片一致
- 渲染时优先用本机 Chromium(`REMOTION_BROWSER` 环境变量可指定),没有则由 Remotion 自动下载

## 📁 目录结构

```
├── index.html      # 页面结构(个人信息都在这里改,✏️ 注释标记了可编辑处)
├── assets/         # Remotion 渲染产物:allyos-film.mp4 + allyos-poster.jpg
├── video/          # 短片源码(Remotion 工程,不参与网站运行)
├── css/style.css   # 样式(主题色在 :root 与 html[data-theme="light"] 变量中)
├── js/main.js      # 交互脚本(轮播头衔在 TITLES 数组中)
├── resume.pdf      # 可下载的简历 PDF(首屏「下载简历」按钮指向它)
├── robots.txt      # 爬虫规则(已明确放行 GPTBot / ClaudeBot / PerplexityBot 等 AI 爬虫)
├── sitemap.xml     # 站点地图
├── llms.txt        # 面向大语言引擎的站点摘要(GEO)
├── og-image.png    # 社交分享卡片图(1200×630)
└── favicon.svg     # 网站图标
```

## 🔍 SEO / GEO 说明

**SEO(面向 Google / Bing / 百度等搜索引擎)**

- `title` / `description` / `keywords` / `canonical` / `robots` meta 完整
- Open Graph + Twitter Card:分享到微信 / Telegram / X 等平台会显示 `og-image.png` 卡片
- JSON-LD 结构化数据:`Person`(实体档案)、`WebSite`、`FAQPage`(与页面可见 FAQ 内容一致)
- 地理 meta(`geo.region CN-51`、`geo.placename 成都`)与语义化 HTML(单一 h1、层级化 h2/h3)
- 静态直出内容:全部正文都在 HTML 里,不依赖 JS 渲染,爬虫可完整抓取

**GEO(面向 ChatGPT / Perplexity / AI 搜索等生成式引擎)**

- `robots.txt` 明确放行 GPTBot、OAI-SearchBot、ChatGPT-User、ClaudeBot、anthropic-ai、PerplexityBot、Google-Extended、Applebot-Extended
- `llms.txt`:站点级机器可读摘要(行业新标准),把"是谁 / 技术栈 / 项目 / 关键数字"写成事实清单
- FAQ 问答区块:AI 引擎最偏好引用的事实型问答(`是谁 / 技术栈 / TeacherCopilot 是什么 / 成果 / 联系方式`),带数字证据
- JSON-LD 实体数据 + `sameAs` 关联 GitHub 与产品站,帮助 AI 引擎做实体消歧("刘星 = 这个 GitHub 账号 = TeacherCopilot 作者")

**后续可做(需要你的账号,建议部署后执行)**

1. [Google Search Console](https://search.google.com/search-console) 添加资源并提交 `sitemap.xml`
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) 同步提交(GPT 检索来源)
3. 在 GitHub Profile、LinkedIn、脉脉等页面加指向本站的链接,提升实体关联度
4. 换自定义域名时,全局替换 `index.html` / `sitemap.xml` / `robots.txt` / `llms.txt` 中的 `lx307697527.github.io/myresume`

## ✏️ 常用自定义

1. **个人信息 / 经历 / 项目**:编辑 `index.html`,所有可改位置都有 `<!-- ✏️ -->` 注释。
2. **轮播头衔**:编辑 `js/main.js` 顶部的 `TITLES` 数组。
3. **主题配色**:编辑 `css/style.css` 顶部 `:root`(纸墨浅色)与 `html[data-theme="dark"]`(暖炭深色)中的 `--accent`(朱砂强调色)/ `--ink`(墨色)/ `--paper`(纸色)变量。
4. **简历 PDF**:替换 `resume.pdf` 即可(文件名不变则无需改代码)。
5. **联系方式**:搜索 `307697527@qq.com` 与 `github.com/lx307697527` 全局替换。

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
3. 稍等片刻,访问 `https://lx307697527.github.io/myresume/` 即可看到网站。

## 📄 License

## 🧩 第三方依赖(可选增强,均走 jsDelivr CDN)

| 库 | 用途 | 失败降级 |
|---|---|---|
| three@0.128 | 墨浪粒子场 + 3D 印章 | 隐藏粒子层,印章回退 SVG |
| gsap@3.12 + ScrollTrigger | 滚动编排 / 逐字动画 / 磁性按钮 | 回退 IntersectionObserver 入场 |
| lenis@1.1 | 惯性顺滑滚动 | 回退原生滚动 |
| Remotion 4(仅构建期) | 渲染 AllyOS 短片与分享卡片 | 网站只引用渲染好的 mp4 / jpg,运行时零依赖 |

## 📄 License

Apache-2.0(见 [LICENSE](LICENSE))
