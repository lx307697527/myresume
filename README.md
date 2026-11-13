# myresume · 刘星个人简历网站

纯静态单页简历网站,无框架、无构建依赖,开箱即用。
设计与内容基于本人简历重新设计:纸墨编辑风(米白纸感 + 墨色衬线 + 朱砂印章),真实数据驱动。

## ✨ 设计原则(v4 · 营销站结构)

页面按"问题 → 方案 → 成果 → 经历 → 合作 → 联系"组织,首屏只讲一个主张、只有一个主按钮,每个数字都写明出处。

硬性约束(改页面前先看,`css/style.css` 顶部也写着):

- **原生滚动**:不用 Lenis / 视差 / pin;脚本里没有任何 `scroll` 监听,和滚动有关的都用 `IntersectionObserver`
- **零框架**:无 Three.js / GSAP,`js/main.js` 约 5KB;系统字体,无网络字体
- **颜色纪律**:朱砂色只给能点的东西(按钮、链接、当前导航、焦点框),装饰一律用墨色
- **动效**:只有入场淡入(≤ 0.5s,不循环);`prefers-reduced-motion` 时全部关闭,短片也不自动播放
- **固定导航不用 `backdrop-filter`**;点击区域 ≥ 44px;390px 宽无横向滚动
- **短片**:进入视口才加载并静音播放,离开就暂停

交付前自检(2026-11-13 实测):Lighthouse 移动端 性能 99 / 无障碍 100 / 最佳实践 100 / SEO 100,LCP 1.8s;
滚轮滚 600px,50ms 内到位;桌面浅色 / 深色、手机 390px 截图无溢出。

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
├── js/main.js      # 交互脚本(约 5KB,零依赖,无 scroll 监听)
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
2. **主题配色**:编辑 `css/style.css` 顶部 `:root`(纸墨浅色)与 `html[data-theme="dark"]`(暖炭深色)中的 `--accent`(朱砂强调色)/ `--ink`(墨色)/ `--paper`(纸色)变量。
3. **简历 PDF**:替换 `resume.pdf` 即可(文件名不变则无需改代码)。
4. **联系方式**:搜索 `307697527@qq.com` 与 `github.com/lx307697527` 全局替换。

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

Apache-2.0(见 [LICENSE](LICENSE))
