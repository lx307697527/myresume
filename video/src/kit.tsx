import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme";
import { CHAPTERS, COPY, TOTAL } from "./data";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 场景整体淡入淡出 */
export const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10, dur - 12, dur], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** 逐字升起 */
export const Rise: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  charStyle?: (i: number, ch: string) => React.CSSProperties | undefined;
}> = ({ text, delay = 0, stagger = 2, style, charStyle }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {Array.from(text).map((ch, i) => {
        const s = spring({ frame: f - delay - i * stagger, fps, config: { damping: 18, stiffness: 120, mass: 0.7 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              opacity: s,
              transform: `translateY(${(1 - s) * 0.55}em)`,
              filter: `blur(${(1 - s) * 6}px)`,
              ...charStyle?.(i, ch),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** 数字滚动 */
export const Count: React.FC<{ to: number; from?: number; start: number; dur?: number; style?: React.CSSProperties }> = ({
  to,
  from = 0,
  start,
  dur = 40,
  style,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [start, start + dur], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(v).toLocaleString("en-US")}</span>;
};

/** 横向发丝线绘制 */
export const Hair: React.FC<{ start: number; dur?: number; w: number | string; color?: string; style?: React.CSSProperties }> = ({
  start,
  dur = 30,
  w,
  color = C.line2,
  style,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: ease });
  return <div style={{ width: w, height: 1, background: color, transformOrigin: "left", transform: `scaleX(${p})`, ...style }} />;
};

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: "0.14em", color: C.faint, textTransform: "uppercase", ...style }}>
    {children}
  </div>
);

/** 纸纹颗粒 + 暗角 —— 让画面像印刷品而不是幻灯片 */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.55) 100%)` }}
      />
      {/* 预烘焙的噪点贴图,每帧随机平移 —— 观感同 feTurbulence,渲染快得多 */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("grain.png")})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${(f * 137) % 512}px ${(f * 263) % 512}px`,
          mixBlendMode: "overlay",
          opacity: 0.16,
        }}
      />
    </AbsoluteFill>
  );
};

const pad = (n: number) => String(n).padStart(2, "0");

/** 常驻的「控制台」框:套准角标、章节、时间码、进度刻度 */
export const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ch = [...CHAPTERS].reverse().find((c) => f >= c.from) ?? CHAPTERS[0];
  const sec = Math.floor(f / fps);
  const tc = `00:${pad(Math.floor(sec / 60))}:${pad(sec % 60)}:${pad(f % fps)}`;
  const intro = interpolate(f, [0, 20], [0, 1], clamp);
  const corner = (pos: React.CSSProperties, rot: number) => (
    <div style={{ position: "absolute", width: 26, height: 26, ...pos, transform: `rotate(${rot}deg)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 26, height: 1.5, background: C.faint }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1.5, height: 26, background: C.faint }} />
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: intro, pointerEvents: "none" }}>
      {corner({ left: 48, top: 48 }, 0)}
      {corner({ right: 48, top: 48 }, 90)}
      {corner({ right: 48, bottom: 48 }, 180)}
      {corner({ left: 48, bottom: 48 }, 270)}
      <Mono style={{ position: "absolute", left: 92, top: 50, fontSize: 15 }}>{COPY.chrome}</Mono>
      <Mono style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontSize: 15 }}>
        <span style={{ color: C.accent }}>●</span>&nbsp;&nbsp;{ch.id} / 07 · {ch.name}
      </Mono>
      <Mono style={{ position: "absolute", right: 92, top: 50, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>{tc}</Mono>
      {/* 底部章节刻度 */}
      <div style={{ position: "absolute", left: 92, right: 92, bottom: 58, height: 14 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 1, background: C.line2 }} />
        <div
          style={{ position: "absolute", left: 0, top: 5, height: 3, width: `${(f / TOTAL) * 100}%`, background: C.accent }}
        />
        {CHAPTERS.map((c) => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: `${(c.from / TOTAL) * 100}%`,
              top: 0,
              width: 1,
              height: 14,
              background: f >= c.from ? C.accent : C.faint,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
