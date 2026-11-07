// 全局状态（zustand）。3D 引擎通过 subscribe 响应变化，React 只渲染面板 —— 不按帧渲染。
import { create } from "zustand";
import type { CategoryId, SceneSpec, ViewPreset } from "../content/types";
import type { Numbering } from "../anatomy/notation";

export type Vis = "on" | "ghost" | "off";
export type Mode = "explore" | "learn" | "disease" | "chart" | "quiz" | "glossary";
export type ExplorePanel = "layers" | "odontogram" | "tree";
export type SectionAxis = "sagittal" | "coronal" | "axial";

export const DEFAULT_CATEGORIES: Record<CategoryId, Vis> = {
  teeth: "on",
  enamel: "on",
  dentin: "on",
  cementum: "on",
  pulp: "on",
  canals: "on",
  pdl: "on",
  gingiva: "on",
  alveolar: "on",
  maxilla: "on",
  mandible: "on",
  tmj: "off",
  sinus: "off",
  nerves: "off",
  arteries: "off",
  veins: "off",
  muscles: "off",
  skull: "off",
};
/** 总览模式下，牙体内部组织默认不显示（显示牙齿外形即可） */
export const OVERVIEW_INTERNAL_DEFAULT: Partial<Record<CategoryId, Vis>> = {
  enamel: "off",
  dentin: "off",
  cementum: "off",
  pulp: "off",
  canals: "off",
  pdl: "off",
};

export interface Progress {
  viewedTeeth: number[];
  viewedStructures: string[];
  lessonsDone: string[];
  lessonsRead: Record<string, number>; // lessonId → 已读节数
  quiz: { id: string; correct: boolean; ts: number }[];
}

const PROGRESS_KEY = "oralatlas.progress.v1";
const PREFS_KEY = "oralatlas.prefs.v1";

function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null");
    if (p) return { viewedTeeth: [], viewedStructures: [], lessonsDone: [], lessonsRead: {}, quiz: [], ...p };
  } catch {
    /* 忽略损坏的存档 */
  }
  return { viewedTeeth: [], viewedStructures: [], lessonsDone: [], lessonsRead: {}, quiz: [] };
}
export type Quality = "auto" | "smooth" | "high";
export type Lang = "zh" | "en";
function loadPrefs(): { numbering: Numbering; theme: "light" | "dark"; quality?: Quality; lang?: Lang } {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null");
    if (p) return p;
  } catch {
    /* ignore */
  }
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return { numbering: "fdi", theme: dark ? "dark" : "light" };
}

export interface AppState {
  // 加载
  ready: boolean;
  loadingStage: string | null;
  loadingProgress: number;
  teethLoading: { done: number; total: number } | null;
  teethError: string | null;
  loadError: string | null;

  // 偏好
  numbering: Numbering;
  theme: "light" | "dark";
  quality: Quality;
  /** 界面语言 */
  lang: Lang;

  // 场景
  categories: Record<CategoryId, Vis>;
  hidden: string[];
  ghosted: string[];
  isolate: string | null;
  selected: string | null;
  dissectFdi: number | null;
  toothExplode: number;
  showContext: boolean;
  explode: number;
  jawOpen: number;
  section: { enabled: boolean; axis: SectionAxis; offset: number; flip: boolean };
  labels: boolean;
  autoRotate: boolean;
  view: ViewPreset | null;
  /** 只显示一个牙弓（咬合面视图时自动设置） */
  archFilter: "upper" | "lower" | null;
  /** 每次请求相机动作都递增，引擎据此执行一次 */
  cameraRequest: { kind: "view" | "focus" | "reset"; target?: string; preset?: ViewPreset; n: number } | null;

  // 界面
  mode: Mode;
  explorePanel: ExplorePanel;
  searchOpen: boolean;
  aboutOpen: boolean;
  lessonId: string | null;
  lessonSection: number;
  /** 测验模式：在 3D 中点选时交给测验处理，而不是普通选择 */
  pickInterceptor: ((key: string) => void) | null;
  quizHighlight: string | null;
  /** 术语表中需要滚动定位的词条 */
  glossaryFocus: string | null;
  /** 首次访问的欢迎页 */
  welcomeOpen: boolean;
  /** 从课程页发起的测验 */
  quizLaunch: { lessonId?: string; n: number } | null;
  sidebarCollapsed: boolean;

  progress: Progress;
}

const initialPrefs = loadPrefs();
const initialLang: Lang = initialPrefs.lang ?? (navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en");

export const useStore = create<AppState>(() => ({
  ready: false,
  loadingStage: initialLang === "en" ? "Reading model manifest" : "正在读取模型清单",
  loadingProgress: 0,
  teethLoading: null,
  teethError: null,
  loadError: null,

  numbering: initialPrefs.numbering,
  quality: initialPrefs.quality ?? "auto",
  lang: initialLang,
  theme: initialPrefs.theme,

  categories: { ...DEFAULT_CATEGORIES, ...OVERVIEW_INTERNAL_DEFAULT } as Record<CategoryId, Vis>,
  hidden: [],
  ghosted: [],
  isolate: null,
  selected: null,
  dissectFdi: null,
  toothExplode: 0,
  showContext: false,
  explode: 0,
  jawOpen: 0,
  section: { enabled: false, axis: "sagittal", offset: 0, flip: false },
  labels: false,
  autoRotate: false,
  view: "three-quarter",
  archFilter: null,
  cameraRequest: null,

  mode: "explore",
  explorePanel: "layers",
  searchOpen: false,
  aboutOpen: false,
  lessonId: null,
  lessonSection: 0,
  pickInterceptor: null,
  quizHighlight: null,
  glossaryFocus: null,
  welcomeOpen: !localStorage.getItem("oralatlas.welcomed"),
  quizLaunch: null,
  sidebarCollapsed: window.innerWidth < 900,

  progress: loadProgress(),
}));

const set = useStore.setState;
const get = useStore.getState;

// 持久化
useStore.subscribe((s, prev) => {
  if (s.progress !== prev.progress) localStorage.setItem(PROGRESS_KEY, JSON.stringify(s.progress));
  if (s.numbering !== prev.numbering || s.theme !== prev.theme || s.quality !== prev.quality || s.lang !== prev.lang)
    localStorage.setItem(PREFS_KEY, JSON.stringify({ numbering: s.numbering, theme: s.theme, quality: s.quality, lang: s.lang }));
});

let cameraN = 0;

// ---------------------------------------------------------------- actions

export const actions = {
  select(key: string | null, opts: { focus?: boolean } = {}) {
    set({ selected: key });
    if (key) {
      actions.recordView(key);
      if (opts.focus) actions.focus(key);
    }
  },
  /** 选中并确保可见：打开所属类别、取消隐藏/仅显示，必要时退出单牙解剖，然后聚焦 */
  reveal(key: string, category: CategoryId | null, opts: { focus?: boolean } = { focus: true }) {
    const s = get();
    const patch: Partial<AppState> = {};
    const fdi = key.match(/-(\d\d)$/) ? Number(key.slice(-2)) : null;
    if (s.dissectFdi !== null && fdi !== s.dissectFdi) {
      patch.dissectFdi = null;
      patch.toothExplode = 0;
      patch.categories = { ...s.categories, ...OVERVIEW_INTERNAL_DEFAULT } as Record<CategoryId, Vis>;
    }
    const cats = { ...(patch.categories ?? s.categories) };
    if (category && cats[category] === "off") cats[category] = "on";
    if (category === "teeth" && cats.teeth === "off") cats.teeth = "on";
    patch.categories = cats;
    if (s.hidden.includes(key)) patch.hidden = s.hidden.filter((k) => k !== key);
    if (s.isolate && s.isolate !== key) patch.isolate = null;
    if (s.archFilter) patch.archFilter = null;
    set(patch);
    actions.select(key, opts);
  },
  recordView(key: string) {
    const p = get().progress;
    const fdiMatch = key.match(/^tooth-(\d\d)$/);
    if (fdiMatch) {
      const fdi = Number(fdiMatch[1]);
      if (!p.viewedTeeth.includes(fdi)) set({ progress: { ...p, viewedTeeth: [...p.viewedTeeth, fdi] } });
      return;
    }
    const base = key.replace(/-\d\d$/, "").replace(/-(left|right)$/, "");
    if (!p.viewedStructures.includes(base)) set({ progress: { ...p, viewedStructures: [...p.viewedStructures, base] } });
  },
  focus(key: string) {
    set({ cameraRequest: { kind: "focus", target: key, n: ++cameraN } });
  },
  setView(preset: ViewPreset) {
    const archFilter = preset === "occlusal-upper" ? "upper" : preset === "occlusal-lower" ? "lower" : null;
    set({ view: preset, archFilter, cameraRequest: { kind: "view", preset, n: ++cameraN } });
  },
  resetCamera() {
    set({ view: "three-quarter", archFilter: null, cameraRequest: { kind: "reset", n: ++cameraN } });
  },
  setCategory(id: CategoryId, vis: Vis) {
    set({ categories: { ...get().categories, [id]: vis } });
  },
  soloCategory(id: CategoryId) {
    const cats = { ...get().categories };
    for (const k of Object.keys(cats) as CategoryId[]) cats[k] = k === id ? "on" : "off";
    set({ categories: cats });
  },
  toggleHidden(key: string) {
    const h = get().hidden;
    set({ hidden: h.includes(key) ? h.filter((k) => k !== key) : [...h, key] });
  },
  toggleGhosted(key: string) {
    const g = get().ghosted;
    set({ ghosted: g.includes(key) ? g.filter((k) => k !== key) : [...g, key] });
  },
  setIsolate(key: string | null) {
    set({ isolate: key });
  },
  enterDissect(fdi: number) {
    set({
      dissectFdi: fdi,
      toothExplode: 0,
      isolate: null,
      explode: 0,
      jawOpen: 0,
      archFilter: null,
      section: { ...get().section, enabled: false, offset: 0 },
      categories: { ...get().categories, enamel: "on", dentin: "on", cementum: "on", pulp: "on", canals: "on", pdl: "off" },
      selected: `tooth-${fdi}`,
    });
    actions.recordView(`tooth-${fdi}`);
  },
  exitDissect() {
    const fdi = get().dissectFdi;
    set({
      dissectFdi: null,
      toothExplode: 0,
      section: { ...get().section, enabled: false },
      categories: { ...get().categories, ...OVERVIEW_INTERNAL_DEFAULT } as Record<CategoryId, Vis>,
    });
    if (fdi) actions.focus(`tooth-${fdi}`);
  },
  resetAll() {
    set({
      categories: { ...DEFAULT_CATEGORIES, ...OVERVIEW_INTERNAL_DEFAULT } as Record<CategoryId, Vis>,
      hidden: [],
      ghosted: [],
      isolate: null,
      selected: null,
      dissectFdi: null,
      toothExplode: 0,
      explode: 0,
      jawOpen: 0,
      section: { enabled: false, axis: "sagittal", offset: 0, flip: false },
      labels: false,
      archFilter: null,
    });
    actions.resetCamera();
  },
  /** 应用课程/题目的场景描述：先回到默认，再叠加 spec */
  applyScene(spec: SceneSpec | undefined) {
    if (!spec) return;
    const cats = { ...DEFAULT_CATEGORIES, ...(spec.focusTooth ? { pdl: "off" } : OVERVIEW_INTERNAL_DEFAULT) } as Record<CategoryId, Vis>;
    if (spec.layers) {
      for (const k of Object.keys(cats) as CategoryId[]) cats[k] = spec.layers.includes(k) ? "on" : "off";
      // 单牙解剖中若只列出了部分牙体组织，其余牙体组织隐藏；未提及 teeth 时不影响
    }
    for (const g of spec.ghost ?? []) cats[g] = "ghost";
    set({
      categories: cats,
      hidden: [],
      ghosted: [],
      isolate: null,
      dissectFdi: spec.focusTooth ?? null,
      toothExplode: 0,
      explode: spec.explode ?? 0,
      jawOpen: spec.jawOpen ?? 0,
      section: spec.section
        ? { enabled: true, axis: spec.section.axis, offset: spec.section.offset, flip: false }
        : { ...get().section, enabled: false },
      labels: spec.labels ?? false,
      selected: spec.select ?? (spec.focusTooth ? `tooth-${spec.focusTooth}` : null),
      archFilter: null,
    });
    if (spec.view) actions.setView(spec.view);
    else if (spec.select && !spec.focusTooth) actions.focus(spec.select);
    else if (spec.focusTooth) set({ cameraRequest: { kind: "focus", target: `tooth-${spec.focusTooth}`, n: ++cameraN } });
    if (spec.select) actions.recordView(spec.select);
  },
  recordQuiz(id: string, correct: boolean) {
    const p = get().progress;
    set({ progress: { ...p, quiz: [...p.quiz, { id, correct, ts: Date.now() }].slice(-2000) } });
  },
  markLessonRead(lessonId: string, sectionCount: number) {
    const p = get().progress;
    set({ progress: { ...p, lessonsRead: { ...p.lessonsRead, [lessonId]: Math.max(p.lessonsRead[lessonId] ?? 0, sectionCount) } } });
  },
  completeLesson(lessonId: string) {
    const p = get().progress;
    if (!p.lessonsDone.includes(lessonId)) set({ progress: { ...p, lessonsDone: [...p.lessonsDone, lessonId] } });
  },
  resetProgress() {
    set({ progress: { viewedTeeth: [], viewedStructures: [], lessonsDone: [], lessonsRead: {}, quiz: [] } });
  },
};

export { set as setState, get as getState };
