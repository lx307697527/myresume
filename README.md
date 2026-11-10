# myresume · 刘星个人简历网站

纯静态单页简历网站,无框架、无构建依赖,开箱即用。
设计与内容基于本人简历重新设计:深色优先的"工程师 × AI"视觉风格,真实数据驱动。

## ✨ 功能

- 单页滚动式布局:首页 / 关于 / 技能栈 / 职业经历 / 项目经验 / 教育 / FAQ / 联系
- 🌗 深色 / 浅色模式切换(默认跟随系统,手动选择会被记忆,刷新不闪烁)
- 🖥️ 首屏 TypeScript 代码风格个人档案卡 + 打字机轮播头衔
- 📊 关键数字滚动动画(12 年经验 / 3 年 AI Agent / 30+ 团队 / 6500+ 门店)
- 🏆 重点项目 TeacherCopilot 渐变高亮卡(已上线 · 已盈利)
- 📱 完整响应式,适配手机 / 平板 / 桌面
- ♿ `prefers-reduced-motion` 动效降级
- 🔍 SEO + GEO 友好(见下文)
- 无外部依赖(字体、图标均为本地 / 内联),离线可用

## 📁 目录结构

```
├── index.html      # 页面结构(个人信息都在这里改,✏️ 注释标记了可编辑处)
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
3. **主题配色**:编辑 `css/style.css` 顶部的 `--accent` / `--accent-2` / `--grad` 变量。
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

Apache-2.0(见 [LICENSE](LICENSE))
