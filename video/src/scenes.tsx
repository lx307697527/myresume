import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme";
import { CHAIN, COPY, FACTS, GUARDS, PIPELINE, SURFACES } from "./data";
import { clamp, Count, ease, Hair, Mono, Rise } from "./kit";

const L = 160; // 左版心

/* ------------------------------------------------------------------ 01 冷开场 */
export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const typed = Math.floor(interpolate(f, [6, 40], [0, COPY.prompt.length], clamp));
  const lift = interpolate(f, [78, 100], [0, 1], { ...clamp, easing: ease });
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: L,
          top: 300 - lift * 110,
          opacity: 1 - lift * 0.72,
          fontFamily: F.mono,
          fontSize: 26,
          color: C.muted,
        }}
      >
        <div style={{ color: C.ink, marginBottom: 26 }}>
          <span style={{ color: C.accent }}>›</span>&nbsp; {COPY.prompt.slice(0, typed)}
          <span style={{ opacity: caret && f < 46 ? 1 : 0, color: C.accent }}>▍</span>
        </div>
        {COPY.log.map(([k, v], i) => {
          const s = interpolate(f, [44 + i * 6, 52 + i * 6], [0, 1], clamp);
          return (
            <div key={k} style={{ opacity: s, transform: `translateX(${(1 - s) * -14}px)`, lineHeight: "44px", fontSize: 22 }}>
              <span style={{ color: C.ok }}>[ok]</span>&nbsp;&nbsp;
              <span style={{ display: "inline-block", width: 270, color: C.ink }}>{k}</span>
              <span>{v}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: L, top: 560 }}>
        <Rise text={COPY.open1} delay={88} stagger={2} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 96, color: C.ink, lineHeight: 1.25 }} />
        <Rise
          text={COPY.open2}
          delay={104}
          stagger={2}
          style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 96, color: C.ink, lineHeight: 1.25 }}
          charStyle={(i) => (i >= 2 && i <= 5 ? { color: C.accent } : undefined)}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 02 片名 + 数字 */
export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const nums = [FACTS.days, FACTS.specs, FACTS.migrations, FACTS.pgtap];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L, top: 180 }}>
        <Mono style={{ marginBottom: 18 }}>
          <span style={{ color: C.accent }}>■</span>&nbsp; Case file · since {FACTS.start}
        </Mono>
        <Rise
          text={COPY.title}
          delay={4}
          stagger={3}
          style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 250, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1 }}
          charStyle={(i) => (i >= 4 ? { color: C.accent } : undefined)}
        />
        <div style={{ marginTop: 74, opacity: interpolate(f, [26, 44], [0, 1], clamp) }}>
          <Mono style={{ color: C.muted, fontSize: 20 }}>{COPY.titleSub}</Mono>
          <div style={{ fontFamily: F.serif, fontSize: 30, color: C.muted, marginTop: 10 }}>{COPY.titleZh}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: L, right: L, top: 700 }}>
        <Hair start={40} w="100%" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: 34 }}>
          {COPY.metrics.map(([unit, label], i) => {
            const s = interpolate(f, [48 + i * 7, 64 + i * 7], [0, 1], clamp);
            return (
              <div
                key={label}
                style={{ opacity: s, transform: `translateY(${(1 - s) * 18}px)`, borderLeft: i ? `1px solid ${C.line}` : "none", paddingLeft: i ? 34 : 0 }}
              >
                <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 104, color: C.ink, lineHeight: 1 }}>
                  <Count to={nums[i]} start={50 + i * 7} dur={46} />
                  <span style={{ fontSize: 34, color: C.accent, marginLeft: 8 }}>{unit}</span>
                </div>
                <div style={{ fontFamily: F.serif, fontSize: 22, color: C.muted, marginTop: 14, maxWidth: 340, lineHeight: 1.5 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 03 流水线 */
export const Pipeline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = PIPELINE.length;
  const x0 = 220;
  const x1 = 1700;
  const xs = PIPELINE.map((_, i) => x0 + ((x1 - x0) * i) / (n - 1));
  const y = 560;
  const step = 30;
  const t0 = 46;
  const inF: number[] = [];
  const outX: number[] = [];
  xs.forEach((x, i) => {
    const a = t0 + i * step;
    inF.push(a);
    outX.push(x);
    if (i < n - 1) {
      inF.push(a + 14);
      outX.push(x);
    }
  });
  const px = interpolate(f, inF, outX, { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const active = Math.max(-1, ...PIPELINE.map((_, i) => (f >= t0 + i * step ? i : -1)));
  const line = interpolate(f, [16, 50], [0, 1], { ...clamp, easing: ease });
  const done = Math.max(0, (px - x0) / (x1 - x0));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L, top: 160 }}>
        <Rise text={COPY.pipeH} delay={2} stagger={1.5} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 76, color: C.ink }} />
        <Mono style={{ marginTop: 18, opacity: interpolate(f, [14, 30], [0, 1], clamp) }}>{COPY.pipeS}</Mono>
      </div>

      {/* 轨道 */}
      <div style={{ position: "absolute", left: x0, top: y, width: x1 - x0, height: 2, background: C.line2, transformOrigin: "left", transform: `scaleX(${line})` }} />
      <div
        style={{ position: "absolute", left: x0, top: y, width: (x1 - x0) * done, height: 2, background: C.accent, boxShadow: `0 0 18px ${C.accent}` }}
      />

      {PIPELINE.map((p, i) => {
        const on = active >= i;
        const pop = spring({ frame: f - (t0 + i * step), fps, config: { damping: 12, stiffness: 160 } });
        const appear = interpolate(f, [18 + i * 4, 34 + i * 4], [0, 1], clamp);
        return (
          <div key={p.en} style={{ position: "absolute", left: xs[i], top: y, opacity: appear }}>
            <div
              style={{
                position: "absolute",
                width: 26,
                height: 26,
                left: -13,
                top: -12,
                borderRadius: 26,
                border: `2px solid ${on ? C.accent : C.faint}`,
                background: on ? C.accent : C.bg,
                transform: `scale(${on ? 1 + 0.35 * (1 - pop) + 0.0 : 1})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -120,
                width: 240,
                top: -108,
                textAlign: "center",
                fontFamily: F.serif,
                fontWeight: 700,
                fontSize: 46,
                color: on ? C.ink : C.faint,
              }}
            >
              {p.zh}
            </div>
            <Mono
              style={{ position: "absolute", left: -120, width: 240, top: 36, textAlign: "center", fontSize: 16, color: on ? C.accent : C.faint }}
            >
              {String(i + 1).padStart(2, "0")} · {p.en}
            </Mono>
          </div>
        );
      })}

      {/* 运行中的数据包 */}
      <div
        style={{
          position: "absolute",
          left: px - 9,
          top: y - 8,
          width: 18,
          height: 18,
          borderRadius: 18,
          background: C.paper,
          boxShadow: `0 0 0 6px rgba(224,96,63,.25), 0 0 34px 8px rgba(224,96,63,.55)`,
          opacity: interpolate(f, [t0 - 8, t0], [0, 1], clamp),
        }}
      />

      {/* 当前站点说明 */}
      <div style={{ position: "absolute", left: L, right: L, top: 720 }}>
        <Hair start={30} w="100%" color={C.line} />
        <div style={{ position: "relative", height: 150, marginTop: 34 }}>
          {PIPELINE.map((p, i) => {
            const a = t0 + i * step;
            const o =
              i === n - 1
                ? interpolate(f, [a, a + 8], [0, 1], clamp)
                : interpolate(f, [a, a + 8, a + step - 4, a + step + 2], [0, 1, 1, 0], clamp);
            return (
              <div key={p.en} style={{ position: "absolute", inset: 0, opacity: o, display: "flex", alignItems: "baseline", gap: 40 }}>
                <Mono style={{ color: C.accent, fontSize: 20, width: 220, flexShrink: 0 }}>
                  STEP {String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
                </Mono>
                <div style={{ fontFamily: F.serif, fontSize: 44, color: C.ink, transform: `translateY(${(1 - o) * 10}px)` }}>{p.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 04 守卫墙 */
export const Guards: React.FC = () => {
  const f = useCurrentFrame();
  const cols = 2;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L, top: 210, width: 640 }}>
        <Rise text={COPY.guardH1} delay={2} stagger={2} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1.3 }} />
        <Rise text={COPY.guardH2} delay={14} stagger={2} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1.3 }} />
        <div style={{ marginTop: 70, display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 200, color: C.accent, lineHeight: 1 }}>
            <Count to={FACTS.guards} start={16} dur={70} />
          </span>
          <span style={{ fontFamily: F.serif, fontSize: 44, color: C.ink }}>{COPY.guardUnit}</span>
        </div>
        <Mono style={{ marginTop: 26 }}>{COPY.guardS}</Mono>
      </div>

      <div
        style={{
          position: "absolute",
          left: 880,
          right: L,
          top: 170,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          columnGap: 44,
          fontFamily: F.mono,
          fontSize: 19,
        }}
      >
        {GUARDS.map((g, i) => {
          const row = Math.floor(i / cols);
          const appear = 8 + row * 3.4 + (i % cols) * 1.5;
          const pass = appear + 16 + ((i * 7) % 11);
          const o = interpolate(f, [appear, appear + 6], [0, 1], clamp);
          const ok = f >= pass;
          const spin = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[Math.floor(f / 2) % 10];
          return (
            <div
              key={g}
              style={{ opacity: o, display: "flex", justifyContent: "space-between", lineHeight: "36.5px", borderBottom: `1px solid ${C.line}` }}
            >
              <span style={{ color: ok ? C.muted : C.faint, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                check_{g}
              </span>
              <span style={{ color: ok ? C.ok : C.faint, width: 80, textAlign: "right", flexShrink: 0 }}>{ok ? "PASS" : `${spin} RUN`}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 05 上线列车 */
export const Release: React.FC = () => {
  const f = useCurrentFrame();
  const mins = interpolate(f, [10, 132], [8 * 60, 15 * 60 + 20], clamp);
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(Math.floor(mins % 60)).padStart(2, "0");
  const freezeF = 10 + ((11 * 60 + 11 - 480) / (920 - 480)) * 122;
  const shipF = 10 + ((15 * 60 - 480) / (920 - 480)) * 122;
  const tracks = [440, 610, 780];
  const tx0 = 380;
  const fx = 1640;
  const tx1 = 1760;
  const down = interpolate(f, [freezeF + 2, freezeF + 18], [0, 1], { ...clamp, easing: ease });
  const ship = interpolate(f, [shipF, shipF + 14], [0, 1], { ...clamp, easing: ease });
  const frozen = f >= freezeF;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L, top: 160 }}>
        <Rise text={COPY.relH} delay={2} stagger={1.5} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 72, color: C.ink }} />
        <Mono style={{ marginTop: 16 }}>{COPY.relS}</Mono>
      </div>
      <div
        style={{
          position: "absolute",
          right: L,
          top: 140,
          fontFamily: F.mono,
          fontSize: 92,
          fontWeight: 600,
          color: frozen && !ship ? C.accent : C.ink,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hh}
        <span style={{ opacity: Math.floor(f / 10) % 2 ? 0.25 : 1 }}>:</span>
        {mm}
      </div>

      {COPY.relTracks.map((t, i) => (
        <React.Fragment key={t}>
          <Mono style={{ position: "absolute", left: L, top: tracks[i] - 12, color: i === 2 && ship > 0.5 ? C.accent : C.muted }}>{t}</Mono>
          <div style={{ position: "absolute", left: tx0 - 60, right: L, top: tracks[i], height: 1, background: C.line2 }} />
        </React.Fragment>
      ))}

      {/* 11:11 定格线 */}
      <div
        style={{
          position: "absolute",
          left: fx,
          top: tracks[0] - 60,
          height: tracks[2] - tracks[0] + 120,
          width: 2,
          background: C.accent,
          transformOrigin: "top",
          transform: `scaleY(${interpolate(f, [freezeF - 4, freezeF + 6], [0, 1], clamp)})`,
          boxShadow: `0 0 16px ${C.accent}`,
        }}
      />
      <Mono style={{ position: "absolute", right: 1920 - fx + 18, top: tracks[0] - 64, color: C.accent, opacity: frozen ? 1 : 0, textAlign: "right" }}>{COPY.relFreeze}</Mono>
      <Mono style={{ position: "absolute", right: 1920 - fx + 18, top: tracks[2] + 40, color: C.accent, opacity: ship, textAlign: "right" }}>{COPY.relShip}</Mono>

      {COPY.relPRs.map((pr, i) => {
        const arrive = 12 + i * 8;
        const inX = interpolate(f, [arrive, arrive + 16], [-260, 0], { ...clamp, easing: ease });
        const o = interpolate(f, [arrive, arrive + 8], [0, 1], clamp);
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = tx0 + col * 412 + inX;
        const yy = tracks[0] + down * (tracks[1] - tracks[0]) + ship * (tracks[2] - tracks[1]);
        const smoke = interpolate(f, [freezeF + 20 + i * 3, freezeF + 26 + i * 3], [0, 1], clamp);
        return (
          <div
            key={pr}
            style={{
              position: "absolute",
              left: x,
              top: yy + (row ? 12 : -54),
              opacity: o,
              fontFamily: F.mono,
              fontSize: 16,
              color: ship > 0.5 ? C.bg : C.ink,
              background: ship > 0.5 ? C.accent : C.panel,
              border: `1px solid ${ship > 0.5 ? C.accent : C.line2}`,
              padding: "8px 14px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              display: "flex",
              justifyContent: "space-between",
              width: 396,
              gap: 12,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{pr}</span>
            <span style={{ color: ship > 0.5 ? C.bg : C.ok, opacity: smoke }}>{COPY.relSmoke}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 06 价值链 */
export const Chain: React.FC = () => {
  const f = useCurrentFrame();
  const n = CHAIN.length;
  const w = (1920 - L * 2) / n;
  const lit = interpolate(f, [30, 120], [0, n], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L, top: 160 }}>
        <Rise text={COPY.chainH} delay={2} stagger={1.5} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 76, color: C.ink }} />
        <Mono style={{ marginTop: 16 }}>{COPY.chainS}</Mono>
      </div>

      <div style={{ position: "absolute", left: L, right: L, top: 420, display: "flex" }}>
        {CHAIN.map((c, i) => {
          const on = Math.min(1, Math.max(0, lit - i));
          const appear = interpolate(f, [12 + i * 3, 26 + i * 3], [0, 1], clamp);
          return (
            <div key={c.mod} style={{ width: w, opacity: appear, position: "relative" }}>
              <div style={{ height: 4, marginRight: 10, background: C.line2, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: C.accent, transformOrigin: "left", transform: `scaleX(${on})` }} />
              </div>
              <Mono style={{ marginTop: 22, fontSize: 15, color: on > 0.5 ? C.accent : C.faint }}>
                {String(i + 1).padStart(2, "0")} {c.mod}
              </Mono>
              <div
                style={{
                  fontFamily: F.serif,
                  fontWeight: 700,
                  fontSize: 64,
                  marginTop: 8,
                  color: on > 0.5 ? C.ink : C.faint,
                  transform: `translateY(${(1 - on) * 6}px)`,
                }}
              >
                {c.zh}
              </div>
              {i < n - 1 && (
                <div style={{ position: "absolute", right: 22, top: 70, fontFamily: F.mono, fontSize: 30, color: on >= 1 ? C.accent : C.line2 }}>→</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: L, right: L, top: 700 }}>
        <Hair start={60} w="100%" color={C.line} />
        <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
          {SURFACES.map((s, i) => {
            const o = interpolate(f, [80 + i * 6, 92 + i * 6], [0, 1], clamp);
            return (
              <div
                key={s}
                style={{
                  opacity: o,
                  transform: `translateY(${(1 - o) * 12}px)`,
                  border: `1px solid ${C.line2}`,
                  padding: "14px 24px",
                  fontFamily: F.serif,
                  fontSize: 26,
                  color: C.ink,
                  borderRadius: 2,
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 28, color: C.muted, marginTop: 34, opacity: interpolate(f, [110, 126], [0, 1], clamp) }}>
          <span style={{ color: C.accent }}>※</span>&nbsp; {COPY.chainNote}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 07 自进化 + 落款 */
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loopOut = interpolate(f, [84, 98], [1, 0], clamp);
  const vals = [FACTS.incidents, FACTS.rules, FACTS.guards];
  const stamp = spring({ frame: f - 100, fps, config: { damping: 11, stiffness: 140, mass: 0.9 } });
  const endIn = interpolate(f, [98, 110], [0, 1], clamp);
  const ring = interpolate(f, [10, 80], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      {/* 自进化闭环 */}
      <AbsoluteFill style={{ opacity: loopOut }}>
        <div style={{ position: "absolute", left: L, top: 160 }}>
          <Rise text={COPY.loopH} delay={2} stagger={2} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 76, color: C.ink }} />
          <Mono style={{ marginTop: 16 }}>{COPY.loopS}</Mono>
        </div>
        <div style={{ position: "absolute", left: L, right: L, top: 460, display: "flex", alignItems: "flex-start" }}>
          {COPY.loop.map(([u, label], i) => {
            const o = interpolate(f, [14 + i * 14, 28 + i * 14], [0, 1], clamp);
            return (
              <React.Fragment key={label}>
                <div style={{ flex: 1, opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
                  <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 150, lineHeight: 1, color: i === 2 ? C.accent : C.ink }}>
                    <Count to={vals[i]} start={14 + i * 14} dur={36} />
                    <span style={{ fontSize: 40, marginLeft: 10, color: C.accent }}>{u}</span>
                  </div>
                  <div style={{ fontFamily: F.serif, fontSize: 34, color: C.muted, marginTop: 18 }}>{label}</div>
                </div>
                {i < 2 && (
                  <div style={{ fontFamily: F.mono, fontSize: 60, color: C.accent, marginTop: 40, width: 120, opacity: o }}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: L, right: L, top: 780 }}>
          <div style={{ height: 1, background: C.accent, width: `${ring * 100}%`, opacity: 0.6 }} />
          <Mono style={{ marginTop: 18, color: C.muted, opacity: ring }}>↺ reflect · weekly · recurring root cause ≥ 2 → rule proposal PR</Mono>
        </div>
      </AbsoluteFill>

      {/* 落款 */}
      <AbsoluteFill style={{ opacity: endIn, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
          <div
            style={{
              width: 230,
              height: 230,
              borderRadius: 18,
              background: C.accentDeep,
              transform: `scale(${1.6 - 0.6 * stamp}) rotate(${(1 - stamp) * -8}deg)`,
              opacity: Math.min(1, stamp * 1.4),
              position: "relative",
              boxShadow: "0 30px 80px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ position: "absolute", inset: 14, border: `3px solid ${C.paper}`, borderRadius: 10, opacity: 0.85 }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: F.serif,
                fontWeight: 700,
                fontSize: 82,
                lineHeight: 1.08,
                color: C.paper,
              }}
            >
              <span>刘</span>
              <span>星</span>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
              <Rise text={COPY.endName} delay={112} stagger={4} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 130, color: C.ink, lineHeight: 1 }} />
              <Mono style={{ fontSize: 24, color: C.muted, opacity: interpolate(f, [120, 132], [0, 1], clamp) }}>{COPY.endEn}</Mono>
            </div>
            <div style={{ fontFamily: F.serif, fontSize: 46, color: C.ink, marginTop: 28, opacity: interpolate(f, [124, 138], [0, 1], clamp) }}>
              {COPY.endTag}
            </div>
            <Hair start={132} w={760} color={C.accent} style={{ marginTop: 30 }} />
            <Mono style={{ marginTop: 20, color: C.muted, opacity: interpolate(f, [138, 150], [0, 1], clamp) }}>{COPY.endRole}</Mono>
            <Mono style={{ marginTop: 8, color: C.accent, opacity: interpolate(f, [142, 154], [0, 1], clamp) }}>{COPY.endUrl}</Mono>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
