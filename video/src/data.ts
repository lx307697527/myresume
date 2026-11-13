// 片中所有数字都来自 AllyOS 仓库实测(2026-11-13 快照),改数字只改这里。
export const FACTS = {
  start: "2026.07.18",
  days: 118,
  specs: 1200, // FEAT 编号已分配到 FEAT-1200
  migrations: 1527,
  pgtap: 1270,
  modules: 23,
  guards: 109,
  incidents: 986,
  rules: 18,
  edgeFns: 80,
  skills: 14,
  agents: 6,
};

export const PIPELINE = [
  { zh: "需求", en: "INTAKE", note: "先认领 issue 与规格编号,再动手" },
  { zh: "拷问", en: "GRILL", note: "产品经理 Agent 逐条追问,决定写回仓库" },
  { zh: "规格", en: "SPEC", note: "PRD · design · testplan 三件套" },
  { zh: "实现", en: "BUILD", note: "implementer ↔ test-runner ↔ reviewer 闭环" },
  { zh: "守卫", en: "GUARDS", note: "109 道机器守卫,推送前全绿" },
  { zh: "集成", en: "DEVELOP", note: "PR 自开自盯,CI 红了自己修" },
  { zh: "上线", en: "RELEASE", note: "每日 11:11 定格 · 15:00 上 main" },
];

// 真实守卫脚本名(scripts/check_*.py 的一部分)
export const GUARDS = [
  "dependency_direction", "doc_sync", "rls_enabled", "serial_reads",
  "money_format_single_source", "governed_rpc_pgtap_coverage", "definer_search_path", "spec_id_unique",
  "migration_spec_id", "test_amendments", "commit_signatures", "release_gate",
  "client_money_sums", "view_security_invoker", "fk_indexed", "dead_exports",
  "entry_bundle_budget", "map_budget", "guard_liveness", "full_suite_gate",
  "outbox_idempotency_evidence", "constant_time_compare", "anon_execute_grant", "rls_initplan",
  "schema_enum_mirrors", "staff_reads_real_jwt", "sql_lint", "typecheck_coverage",
  "shared_component_adoption", "colocated_tests", "pr_backlog_trailer", "stranded_phases",
  "pnpm_audit", "workflow_lockfile", "merged_migration_edit", "undefined_css_vars",
];

export const CHAIN = [
  { zh: "询盘", mod: "CRM" },
  { zh: "报价", mod: "PRICING" },
  { zh: "样品", mod: "SAMPLE" },
  { zh: "订单", mod: "SALES" },
  { zh: "采购", mod: "PROCUREMENT" },
  { zh: "生产", mod: "PRODUCTION" },
  { zh: "开票", mod: "BILLING" },
  { zh: "收款", mod: "PAYMENTS" },
];

export const SURFACES = ["客户门户 PORTAL", "员工系统 ALLYOS", "供应商协同 SRM", "官网 LANDING"];

export const CHAPTERS = [
  { id: "01", name: "COLD OPEN", from: 0, dur: 150 },
  { id: "02", name: "ALLYOS", from: 150, dur: 165 },
  { id: "03", name: "PIPELINE", from: 315, dur: 270 },
  { id: "04", name: "GUARDS", from: 585, dur: 150 },
  { id: "05", name: "RELEASE TRAIN", from: 735, dur: 150 },
  { id: "06", name: "VALUE CHAIN", from: 885, dur: 165 },
  { id: "07", name: "SIGNATURE", from: 1050, dur: 180 },
];
export const TOTAL = 1230;

// 片中出现的全部文案,集中在这里,便于字体子集预加载
export const COPY = {
  prompt: "新需求:样品确认后,自动开出定金发票",
  log: [
    ["task-intake", "认领 issue · 分配 FEAT 编号"],
    ["grill-with-docs", "7 个问题已裁决,写回规格"],
    ["orchestrator", "派发 implementer / test-runner / reviewer"],
    ["pre-push", "109 道守卫 · 全绿"],
    ["pull-request", "已开 · 已订阅 · 盯到合并"],
  ],
  open1: "一个人 + 一组 AI Agent,",
  open2: "撑起一家公司的业务系统。",
  title: "AllyOS",
  titleSub: "THE AI-NATIVE OPERATING SYSTEM BEHIND ALLYNUTRA",
  titleZh: "定制营养品制造 · 客户门户 + 供应商协同 + 内部运营,一个仓库",
  metrics: [
    ["天", "从第一行迁移到全链路运行"],
    ["个", "需求编号 FEAT · 每个都有 PRD / 设计 / 测试计划"],
    ["次", "数据库迁移 · 只走迁移,不碰控制台"],
    ["个", "pgTAP 数据库测试"],
  ],
  pipeH: "每个需求,走同一条流水线。",
  pipeS: "ONE REQUIREMENT → ONE SPEC → ONE PR → ONE RELEASE",
  guardH1: "规则写进机器,",
  guardH2: "而不是写进记忆。",
  guardS: "PRE-PUSH · FAIL-CLOSED · SELF-TESTED",
  guardUnit: "道守卫",
  relH: "每天定时上线,周末也不停。",
  relS: "DEVELOP → RELEASE @ 11:11 → MAIN @ 15:00 · BEIJING",
  relTracks: ["DEVELOP", "RELEASE", "MAIN"],
  relPRs: ["feat(platform) huddle attachments", "fix(crm) parseLabelAmount", "feat(portal) /portal/help guides", "fix(procurement) unit price as text", "feat(platform) 9:00 digest", "feat(sample) hourly tracker sync"],
  relFreeze: "11:11 定格 · 冒烟",
  relShip: "15:00 合并上线",
  relSmoke: "冒烟 ✓",
  chainH: "从第一封询盘,到最后一笔尾款。",
  chainS: "23 MODULES · 4 SURFACES · 1 DATABASE · RLS ON EVERY TABLE",
  chainNote: "前端从不直接写表 —— 每次写入都是带审计与事件的受治理 RPC",
  loopH: "系统会自己变好。",
  loopS: "INCIDENTS → RULES → GUARDS",
  loop: [["份", "事故复盘"], ["条", "沉淀为规则"], ["道", "变成机器守卫"]],
  endName: "刘星",
  endEn: "LIU XING",
  endTag: "让 AI 驾驭工程,让工程放大 AI。",
  endRole: "AI 研发系统架构师 · AI-NATIVE ENGINEERING · ALLYOS",
  endUrl: "lx307697527.github.io/myresume",
  chrome: "ALLYOS — FIELD REEL",
};
