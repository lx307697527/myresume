import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile } from "remotion";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import { C, F } from "./theme";
import { CHAPTERS, CHAIN, COPY, FACTS, GUARDS, PIPELINE, SURFACES } from "./data";
import { Chrome, Grain, SceneFade } from "./kit";
import { Chain, End, Guards, Open, Pipeline, Release, Title } from "./scenes";

// 片中出现过的全部字符:中文字体按 unicode-range 分片,先把要用的分片全部拉下来再开拍
const ALL_TEXT = Array.from(
  new Set(Array.from(JSON.stringify({ CHAIN, COPY, FACTS, GUARDS, PIPELINE, SURFACES }) + "0123456789,·→※↺■●✓⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏▍›:"))
).join("");

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const specs = ["400 40px 'Noto Serif SC'", "700 40px 'Noto Serif SC'", "400 40px 'JetBrains Mono'", "600 40px 'JetBrains Mono'"];
    const grain = new Image();
    grain.src = staticFile("grain.png");
    Promise.all([...specs.map((s) => document.fonts.load(s, ALL_TEXT)), grain.decode()])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const SCENES = [Open, Title, Pipeline, Guards, Release, Chain, End];

export const Film: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: F.serif }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 60% at 78% 18%, rgba(224,96,63,.07), transparent 70%), radial-gradient(60% 60% at 10% 90%, rgba(239,232,219,.04), transparent 70%)`,
        }}
      />
      {CHAPTERS.map((c, i) => {
        const S = SCENES[i];
        return (
          <Sequence key={c.id} from={c.from} durationInFrames={c.dur} name={c.name}>
            <SceneFade dur={c.dur}>
              <S />
            </SceneFade>
          </Sequence>
        );
      })}
      <Chrome />
      <Grain />
    </AbsoluteFill>
  );
};

/** 社交分享卡片(og-image)—— 同一套视觉语言的静帧 */
export const Card: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: C.bg, padding: "70px 80px", fontFamily: F.serif, color: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(70% 70% at 85% 10%, rgba(224,96,63,.12), transparent 70%)` }} />
      <div style={{ fontFamily: F.mono, fontSize: 18, letterSpacing: ".14em", color: C.faint }}>
        <span style={{ color: C.accent }}>●</span>&nbsp; PORTFOLIO · AI-NATIVE ENGINEERING · CHENGDU
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 44, marginTop: 64 }}>
        <div style={{ width: 150, height: 150, borderRadius: 12, background: C.accentDeep, position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 10, border: `2px solid ${C.paper}`, borderRadius: 7, opacity: 0.85 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 54,
              lineHeight: 1.08,
              color: C.paper,
            }}
          >
            <span>刘</span>
            <span>星</span>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 96, lineHeight: 1 }}>刘星</div>
          <div style={{ fontSize: 34, color: C.muted, marginTop: 16 }}>AI 研发系统架构师 · AllyOS · 全栈</div>
        </div>
      </div>
      <div style={{ height: 1, background: C.line2, marginTop: 56 }} />
      <div style={{ display: "flex", gap: 0, marginTop: 30 }}>
        {[
          [String(FACTS.days), "天搭起 AllyOS"],
          [FACTS.specs.toLocaleString("en-US"), "个需求编号"],
          [String(FACTS.guards), "道机器守卫"],
          ["12", "年研发经验"],
        ].map(([n, l], i) => (
          <div key={l} style={{ flex: 1, borderLeft: i ? `1px solid ${C.line}` : "none", paddingLeft: i ? 28 : 0 }}>
            <div style={{ fontWeight: 700, fontSize: 58, color: i === 2 ? C.accent : C.ink, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 22, color: C.muted, marginTop: 10 }}>{l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
