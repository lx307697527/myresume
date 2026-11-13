// 渲染 AllyOS 短片 + 海报帧 + 分享卡片到网站的 assets/ 目录。
//   node render.mjs            全部
//   node render.mjs stills     只出静帧(调试用,快)
// 浏览器:优先用环境变量 REMOTION_BROWSER,其次本机已装的 Chromium,都没有则让 Remotion 自行下载。
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../assets");
fs.mkdirSync(out, { recursive: true });

const candidates = [
  process.env.REMOTION_BROWSER,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].filter(Boolean);
const browserExecutable = candidates.find((p) => fs.existsSync(p)) ?? null;
const chromiumOptions = { gl: "swangle" };

const mode = process.argv[2] ?? "all";
const serveUrl = await bundle({ entryPoint: path.join(here, "src/index.tsx") });
const film = await selectComposition({ serveUrl, id: "AllyOSFilm", browserExecutable, chromiumOptions });

const frames = (process.argv[3] ?? "").split(",").filter(Boolean).map(Number);
if (mode === "stills") {
  for (const frame of frames.length ? frames : [130, 280, 470, 690, 860, 1010, 1220]) {
    await renderStill({
      serveUrl, composition: film, frame, browserExecutable, chromiumOptions,
      output: path.join(here, `out/frame-${frame}.png`),
    });
    console.log("still", frame);
  }
  process.exit(0);
}

// 海报帧:落款画面,视频加载前和 reduced-motion 下展示
await renderStill({
  serveUrl, composition: film, frame: 1196, browserExecutable, chromiumOptions,
  imageFormat: "jpeg", jpegQuality: 86, output: path.join(out, "allyos-poster.jpg"),
});
const card = await selectComposition({ serveUrl, id: "OgCard", browserExecutable, chromiumOptions });
await renderStill({ serveUrl, composition: card, browserExecutable, chromiumOptions, output: path.resolve(here, "../og-image.png") });

await renderMedia({
  serveUrl, composition: film, codec: "h264", crf: 24, pixelFormat: "yuv420p",
  browserExecutable, chromiumOptions, concurrency: 4, muted: true,
  output: path.join(out, "allyos-film.mp4"),
  onProgress: ({ progress }) => process.stdout.write(`\rfilm ${(progress * 100).toFixed(0)}%`),
});
console.log("\ndone →", out);
