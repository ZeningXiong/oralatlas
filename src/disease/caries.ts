// ============================================================================
// 龋病进展演示：窝沟龋（下颌左侧第一磨牙 36 咬合面中央窝）→ 牙髓炎 → 牙髓坏死 → 根尖周炎
//
// 依据见 references.ts。重要说明（同时显示在界面上）：
//   - 病损形状、颜色、扩展速度均为示意；各阶段深度按 Ekstrand 1997 的组织学深度分级
//     设定相对比例，并以本模型中实测的釉质厚度、到髓室顶的距离换算。
//   - 真实龋病进展通常需数月至数年，可在任一阶段停止或（早期）逆转；动画把时间大幅压缩。
//   - 牙髓/根尖周诊断采用 AAE 2009 术语；国内教材的牙髓病分类（如急性、慢性牙髓炎）与之不完全对应。
// ============================================================================

export interface LesionFrame {
  /** 病损起点（咬合面）与指向牙体内部的方向（世界坐标） */
  center: [number, number, number];
  dir: [number, number, number];
  /** 釉质厚度、起点到髓室顶的距离（cm，沿病损轴实测） */
  enamel: number;
  toPulp: number;
}

export interface LesionParams {
  depth: number; // 病损前沿深度（cm）
  r0: number; // 表面半径
  r1: number; // 最大半径
  demin: number; // 脱矿/变色程度 0–1
  brown: number; // 褐变 0–1
  cavity: number; // 龋洞深度（cm）
  pulpInflam: number; // 牙髓充血 0–1
  pulpNecrosis: number; // 牙髓坏死 0–1
  periapical: number; // 根尖周病变半径（cm）
  bacteria: number; // 细菌前沿沿路径的距离（cm）；路径 = 病损起点 → 髓腔 → 根尖
}

/** 用相对单位描述的阶段终点：e = 釉质厚度，p = 到髓室顶的距离 */
interface StageTarget {
  depth: (f: LesionFrame) => number;
  r0: number;
  r1: number;
  demin: number;
  brown: number;
  cavity: (f: LesionFrame) => number;
  pulpInflam: number;
  pulpNecrosis: number;
  periapical: number;
  bacteria: (f: LesionFrame, apex: number) => number;
}

export interface Stage {
  id: string;
  title: string;
  titleEn: string;
  /** 分级标签，如 “ICDAS 1”“AAE：不可复性牙髓炎” */
  code: string;
  codeEn: string;
  body: string;
  bodyEn: string;
  /** 本阶段描述引用的文献 id */
  refs: string[];
  target: StageTarget;
  /** 本阶段在演示中被突出的结构 */
  focus?: "enamel" | "dentin" | "pulp" | "apex";
}

const dentinAt = (k: number) => (f: LesionFrame) => f.enamel + k * (f.toPulp - f.enamel);
const zero = () => 0;

export const CARIES_STAGES: Stage[] = [
  {
    id: "sound",
    title: "健康牙面",
    code: "ICDAS 0",
    body: "牙面无龋损。咬合面窝沟形态复杂、自洁作用差，是菌斑生物膜最易滞留的部位，也是窝沟龋的好发部位。龋病是由菌斑生物膜介导、受糖摄入驱动的动态疾病。",
    titleEn: "Sound surface",
    codeEn: "ICDAS 0",
    bodyEn: "No carious change. The complex pits and fissures of the occlusal surface clean themselves poorly, so dental plaque biofilm is most easily retained there, making it a predilection site for pit-and-fissure caries. Caries is a dynamic disease mediated by the plaque biofilm and driven by dietary sugar intake.",
    refs: ["Pitts2017", "ICDAS"],
    target: { depth: zero, r0: 0.05, r1: 0.08, demin: 0, brown: 0, cavity: zero, pulpInflam: 0, pulpNecrosis: 0, periapical: 0, bacteria: zero },
    focus: "enamel",
  },
  {
    id: "white-spot-dry",
    title: "釉质早期脱矿（白垩斑）",
    code: "ICDAS 1",
    body: "进食糖后，菌斑中的细菌产酸，菌斑 pH 迅速下降；pH 低于临界值（釉质约 5.5，为教材常用值）时釉质羟基磷灰石溶解。早期病损为“表层下脱矿”，表层相对完整，吹干后才可见白垩色改变。此期唾液缓冲与氟化物可促进再矿化，病损可停止甚至逆转。",
    titleEn: "Early enamel demineralization (white spot)",
    codeEn: "ICDAS 1",
    bodyEn: "After sugar intake, plaque bacteria produce acid and plaque pH falls rapidly; below the critical pH (about 5.5 for enamel, a commonly cited textbook value) enamel hydroxyapatite dissolves. The early lesion is a subsurface demineralization with a relatively intact surface layer; the chalky white change is visible only after air-drying. At this stage salivary buffering and fluoride can promote remineralization, and the lesion can arrest or even reverse.",
    refs: ["ICDAS", "Featherstone2008", "Stephan1944"],
    target: {
      depth: (f) => f.enamel * 0.45,
      r0: 0.05,
      r1: 0.09,
      demin: 0.55,
      brown: 0,
      cavity: zero,
      pulpInflam: 0,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: zero,
    },
    focus: "enamel",
  },
  {
    id: "white-spot-wet",
    title: "明显的釉质变色",
    code: "ICDAS 2",
    body: "脱矿持续加深，湿润状态下即可见白垩色或褐色改变。组织学上病损可达釉质内半甚至牙本质外层，但釉质表面仍无缺损。",
    titleEn: "Distinct visual change in enamel",
    codeEn: "ICDAS 2",
    bodyEn: "Demineralization deepens; a white or brown change is visible even when the surface is wet. Histologically the lesion may reach the inner half of the enamel or even the outer dentin, but the enamel surface is still intact.",
    refs: ["ICDAS", "Ekstrand1997"],
    target: {
      depth: (f) => f.enamel * 0.9,
      r0: 0.055,
      r1: 0.1,
      demin: 0.85,
      brown: 0.35,
      cavity: zero,
      pulpInflam: 0,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: zero,
    },
    focus: "enamel",
  },
  {
    id: "enamel-breakdown",
    title: "局限性釉质崩解",
    code: "ICDAS 3",
    body: "脱矿釉质的表层崩解，形成局限于釉质的微小龋洞，洞底未见牙本质。病损前沿此时已接近或到达釉牙本质界。",
    titleEn: "Localized enamel breakdown",
    codeEn: "ICDAS 3",
    bodyEn: "The surface of the demineralized enamel breaks down, forming a small cavity confined to enamel with no dentin visible at its floor. The lesion front is now close to or at the dentin–enamel junction.",
    refs: ["ICDAS", "Ekstrand1997"],
    target: {
      depth: (f) => f.enamel * 1.12,
      r0: 0.06,
      r1: 0.11,
      demin: 0.95,
      brown: 0.5,
      cavity: (f) => f.enamel * 0.45,
      pulpInflam: 0,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: (f) => f.enamel * 0.4,
    },
    focus: "enamel",
  },
  {
    id: "dentin-shadow",
    title: "牙本质暗影",
    code: "ICDAS 4",
    body: "病损进入牙本质，并沿釉牙本质界向侧方扩展，透过尚完整的釉质可见其下方的灰暗色阴影。细菌及其产物沿牙本质小管向牙髓方向推进，牙髓可开始出现防御性反应。",
    titleEn: "Underlying dentin shadow",
    codeEn: "ICDAS 4",
    bodyEn: "The lesion enters dentin and spreads laterally along the dentin–enamel junction; a grey shadow is visible through the still-intact enamel. Bacteria and their products advance toward the pulp along the dentinal tubules, and the pulp may begin to mount defensive responses.",
    refs: ["ICDAS", "Ekstrand1997"],
    target: {
      depth: dentinAt(0.35),
      r0: 0.06,
      r1: 0.13,
      demin: 1,
      brown: 0.62,
      cavity: (f) => f.enamel * 0.5,
      pulpInflam: 0.05,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: dentinAt(0.18),
    },
    focus: "dentin",
  },
  {
    id: "distinct-cavity",
    title: "可见牙本质的明显龋洞",
    code: "ICDAS 5",
    body: "失去支持的釉质崩塌，形成可见牙本质的明显龋洞。病损在牙本质中继续向牙髓方向扩展。",
    titleEn: "Distinct cavity with visible dentin",
    codeEn: "ICDAS 5",
    bodyEn: "Unsupported enamel collapses, forming a distinct cavity with visible dentin. The lesion continues to spread through dentin toward the pulp.",
    refs: ["ICDAS", "Ekstrand1997"],
    target: {
      depth: dentinAt(0.65),
      r0: 0.07,
      r1: 0.16,
      demin: 1,
      brown: 0.75,
      cavity: dentinAt(0.25),
      pulpInflam: 0.15,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: dentinAt(0.45),
    },
    focus: "dentin",
  },
  {
    id: "extensive-cavity",
    title: "广泛龋洞（深龋）· 可复性牙髓炎",
    code: "ICDAS 6 · AAE：可复性牙髓炎",
    body: "龋洞广泛，深达牙本质深层，病损前沿接近牙髓。牙髓对细菌刺激产生炎症；若及时去除龋坏组织并修复，炎症可以消退——临床上称为可复性牙髓炎。",
    titleEn: "Extensive cavity (deep caries) · reversible pulpitis",
    codeEn: "ICDAS 6 · AAE: reversible pulpitis",
    bodyEn: "The cavity is extensive and reaches deep dentin, with the lesion front close to the pulp. The pulp becomes inflamed in response to bacterial irritation; if the carious tissue is removed and the tooth restored in time, the inflammation can resolve — clinically termed reversible pulpitis.",
    refs: ["ICDAS", "Glickman2009", "Ricucci2014"],
    target: {
      depth: (f) => f.toPulp * 0.97,
      r0: 0.08,
      r1: 0.2,
      demin: 1,
      brown: 0.85,
      cavity: dentinAt(0.6),
      pulpInflam: 0.4,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: dentinAt(0.75),
    },
    focus: "pulp",
  },
  {
    id: "irreversible-pulpitis",
    title: "不可复性牙髓炎",
    code: "AAE：不可复性牙髓炎",
    body: "龋损累及牙髓，细菌侵入髓腔，牙髓炎症已不能自行恢复，需要做根管治疗等牙髓治疗。组织学上炎症常先局限于龋损下方的牙髓，再逐渐扩展。",
    titleEn: "Irreversible pulpitis",
    codeEn: "AAE: irreversible pulpitis",
    bodyEn: "The carious lesion involves the pulp and bacteria invade the pulp chamber; the pulpal inflammation can no longer resolve on its own, and endodontic treatment such as root canal therapy is needed. Histologically the inflammation is often first confined to the pulp beneath the lesion and then spreads gradually.",
    refs: ["Glickman2009", "Ricucci2014"],
    target: {
      depth: (f) => f.toPulp * 1.03,
      r0: 0.08,
      r1: 0.21,
      demin: 1,
      brown: 0.9,
      cavity: (f) => f.toPulp * 0.88,
      pulpInflam: 1,
      pulpNecrosis: 0,
      periapical: 0,
      bacteria: (f) => f.toPulp + 0.08,
    },
    focus: "pulp",
  },
  {
    id: "pulp-necrosis",
    title: "牙髓坏死",
    code: "AAE：牙髓坏死",
    body: "未经治疗的牙髓炎最终导致牙髓坏死，牙髓失去活力。坏死并感染的根管系统成为细菌的“储存所”，细菌沿根管向根尖方向扩散。动物实验显示，细菌的存在是牙髓坏死与根尖周病变发生的必要条件。",
    titleEn: "Pulp necrosis",
    codeEn: "AAE: pulp necrosis",
    bodyEn: "Untreated pulpitis eventually leads to pulp necrosis and loss of pulp vitality. The necrotic, infected root canal system becomes a reservoir of bacteria, which spread along the canals toward the apex. Animal experiments showed that the presence of bacteria is necessary for pulp necrosis and periapical lesions to develop.",
    refs: ["Glickman2009", "Kakehashi1965", "Nair2004"],
    target: {
      depth: (f) => f.toPulp * 1.03,
      r0: 0.08,
      r1: 0.21,
      demin: 1,
      brown: 0.92,
      cavity: (f) => f.toPulp * 0.9,
      pulpInflam: 0,
      pulpNecrosis: 1,
      periapical: 0.04,
      bacteria: (_f, apex) => apex * 0.9,
    },
    focus: "pulp",
  },
  {
    id: "apical-periodontitis",
    title: "根尖周炎",
    code: "AAE：根尖周炎",
    body: "根管内的细菌及其产物经根尖孔刺激根尖周组织，引起炎症和根尖周骨质吸收，X 线片上表现为根尖周透射影。可表现为有症状或无症状的根尖周炎，进一步可形成根尖周脓肿。",
    titleEn: "Apical periodontitis",
    codeEn: "AAE: apical periodontitis",
    bodyEn: "Bacteria in the root canals and their products irritate the periapical tissues through the apical foramen, causing inflammation and periapical bone resorption, which appears as a periapical radiolucency on radiographs. It may be symptomatic or asymptomatic apical periodontitis and can progress to a periapical abscess.",
    refs: ["Nair2004", "Kakehashi1965", "Glickman2009"],
    target: {
      depth: (f) => f.toPulp * 1.03,
      r0: 0.08,
      r1: 0.21,
      demin: 1,
      brown: 0.95,
      cavity: (f) => f.toPulp * 0.9,
      pulpInflam: 0,
      pulpNecrosis: 1,
      periapical: 0.24,
      bacteria: (_f, apex) => apex,
    },
    focus: "apex",
  },
];

export const CARIES_NOTES = [
  "病损的形状、颜色和扩展速度为示意。各阶段深度参照 Ekstrand 等（1997）的组织学深度分级设定相对比例，并按本模型实测的釉质厚度和到髓室顶的距离换算。",
  "真实的龋病进展通常需要数月至数年，可以在任一阶段停止（静止龋）；早期釉质病损还可以再矿化。动画把时间大幅压缩，只演示“未加干预”时的典型进程。",
  "牙髓与根尖周诊断采用 AAE 2009 共识术语，国内教材的牙髓病分类（如急性、慢性牙髓炎）与之不完全对应。",
  "细菌粒子和根尖周病变区只示意位置与扩散方向，不代表数量或真实形态；本站模型没有牙槽骨的内部结构，根尖周骨质吸收以半透明球体示意。",
  "“临界 pH 约 5.5”为教材常用值，本站未能在线核实其原始出处，因此没有列为引用文献。",
];

export const CARIES_NOTES_EN = [
  "The shape, colour and rate of spread of the lesion are schematic. The depth of each stage is set in relative proportions following the histological depth scale of Ekstrand et al. (1997), scaled by the enamel thickness and the distance to the pulp-chamber roof measured on this model.",
  "Real caries progression usually takes months to years and can stop at any stage (arrested caries); early enamel lesions can also remineralize. The animation greatly compresses time and only shows the typical course without intervention.",
  "Pulpal and periapical diagnoses use the AAE 2009 consensus terminology; the pulp-disease classification in Chinese textbooks (e.g. acute and chronic pulpitis) does not map onto it exactly.",
  "Bacterial particles and the periapical lesion only indicate location and direction of spread, not quantity or true morphology; the models on this site have no internal alveolar-bone structure, so periapical bone resorption is shown as a translucent sphere.",
  "“Critical pH ≈ 5.5” is a commonly cited textbook value; this site could not verify its original source online, so it is not listed as a reference.",
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/** 进度 t ∈ [0, 1] → 当前阶段下标与病损参数（相邻阶段之间平滑插值） */
export function cariesAt(t: number, f: LesionFrame, apexDist: number): { stage: number; local: number; params: LesionParams } {
  const n = CARIES_STAGES.length;
  const x = Math.min(Math.max(t, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const k = ease(x - i);
  const a = CARIES_STAGES[i].target;
  const b = CARIES_STAGES[i + 1].target;
  const stage = Math.min(Math.round(x), n - 1);
  return {
    stage,
    local: x - i,
    params: {
      depth: lerp(a.depth(f), b.depth(f), k),
      r0: lerp(a.r0, b.r0, k),
      r1: lerp(a.r1, b.r1, k),
      demin: lerp(a.demin, b.demin, k),
      brown: lerp(a.brown, b.brown, k),
      cavity: lerp(a.cavity(f), b.cavity(f), k),
      pulpInflam: lerp(a.pulpInflam, b.pulpInflam, k),
      pulpNecrosis: lerp(a.pulpNecrosis, b.pulpNecrosis, k),
      periapical: lerp(a.periapical, b.periapical, k),
      bacteria: lerp(a.bacteria(f, apexDist), b.bacteria(f, apexDist), k),
    },
  };
}
