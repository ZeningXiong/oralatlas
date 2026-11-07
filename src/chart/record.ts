// 病历（教学用）：数据结构、ICDAS 龋病编码、浏览器本地存储。
// 说明：本功能用于教学演示与练习记录，不是临床病历系统；数据只保存在本机浏览器（localStorage），不会上传。
import { create } from "zustand";

/** 牙面：O 咬合面 / M 近中 / D 远中 / B 颊（唇）面 / L 舌（腭）面 */
export type Surface = "O" | "M" | "D" | "B" | "L";
export type IcdasCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** 病损活跃性（ICDAS 体系中的 Lesion Activity Assessment，可选） */
export type Activity = "active" | "arrested";

export interface SurfaceFinding {
  code: IcdasCode;
  activity?: Activity;
  note?: string;
}
export interface ToothEntry {
  surfaces: Partial<Record<Surface, SurfaceFinding>>;
  note?: string;
}
export interface PatientInfo {
  name: string;
  recordNo: string;
  sex: "" | "male" | "female" | "other";
  birthDate: string;
  examDate: string;
  examiner: string;
  chiefComplaint: string;
  notes: string;
}
export interface PatientRecord {
  id: string;
  version: 1;
  patient: PatientInfo;
  /** 键为 FDI 牙位号字符串 */
  teeth: Record<string, ToothEntry>;
  createdAt: string;
  updatedAt: string;
}

/**
 * ICDAS II 龋病编码（0–6）判定标准，依据 Ismail AI 等 2007（见 disease/references.ts 中的 ICDAS 条目）。
 * 文字为对原标准的概括（AI 辅助编写），判读时请以原文与临床培训为准。
 */
export const ICDAS: { code: IcdasCode; zh: string; en: string; descZh: string; descEn: string; color: string }[] = [
  { code: 0, zh: "健康牙面", en: "Sound", descZh: "牙面吹干约 5 秒后无龋性变化（发育缺陷、氟斑、磨耗等非龋性改变也记为 0）。", descEn: "No evidence of caries after ~5 s of air drying (non-carious changes such as hypoplasia, fluorosis or wear are also coded 0).", color: "#94a3b8" },
  { code: 1, zh: "釉质早期视觉改变", en: "First visual change in enamel", descZh: "湿润时看不到，吹干后才可见的白垩或褐色改变；或仅局限于窝沟范围内的改变。", descEn: "Opacity or discoloration not visible on the wet surface but seen after air drying, or a change confined to the pit/fissure.", color: "#fcd34d" },
  { code: 2, zh: "釉质明显视觉改变", en: "Distinct visual change in enamel", descZh: "牙面湿润时即可见的白垩斑或褐色变色，范围超出窝沟。", descEn: "Opacity or discoloration clearly visible when the surface is wet, wider than the fissure.", color: "#f59e0b" },
  { code: 3, zh: "局限性釉质崩解", en: "Localized enamel breakdown", descZh: "釉质表面出现龋性缺损（微洞），但看不到牙本质，也无牙本质暗影。", descEn: "Carious loss of enamel surface integrity (micro-cavity) with no visible dentin or underlying shadow.", color: "#f97316" },
  { code: 4, zh: "牙本质暗影", en: "Underlying dentin shadow", descZh: "透过完整或局部崩解的釉质可见牙本质的灰、蓝或褐色暗影。", descEn: "Grey, blue or brown shadow from the dentin seen through enamel, with or without localized breakdown.", color: "#ea580c" },
  { code: 5, zh: "可见牙本质的明显龋洞", en: "Distinct cavity with visible dentin", descZh: "明显龋洞，洞底或洞壁可见牙本质；累及范围不超过牙面的一半。", descEn: "Distinct cavity exposing dentin, involving less than half of the surface.", color: "#dc2626" },
  { code: 6, zh: "广泛的明显龋洞", en: "Extensive distinct cavity", descZh: "大而深的龋洞，可见牙本质，累及范围超过牙面的一半，可能接近牙髓。", descEn: "Large, deep cavity with visible dentin involving more than half of the surface; may approach the pulp.", color: "#7f1d1d" },
];
export const icdasOf = (c: IcdasCode) => ICDAS[c];

/** 前牙（切牙、尖牙）没有咬合面 */
export const isAnterior = (fdi: number) => fdi % 10 <= 3;
export const surfacesOf = (fdi: number): Surface[] => (isAnterior(fdi) ? ["M", "D", "B", "L"] : ["O", "M", "D", "B", "L"]);

/** 牙面名称：前牙颊面称唇面；上颌舌面称腭面 */
export function surfaceName(fdi: number, s: Surface, lang: "zh" | "en"): string {
  const upper = Math.floor(fdi / 10) <= 2;
  const ant = isAnterior(fdi);
  const zh: Record<Surface, string> = { O: "咬合面", M: "近中面", D: "远中面", B: ant ? "唇面" : "颊面", L: upper ? "腭面" : "舌面" };
  const en: Record<Surface, string> = { O: "Occlusal", M: "Mesial", D: "Distal", B: ant ? "Labial" : "Buccal", L: upper ? "Palatal" : "Lingual" };
  return lang === "en" ? en[s] : zh[s];
}
/** 牙面字母（病历通用缩写）：前牙唇面记 F（facial），上颌舌面记 P */
export function surfaceLetter(fdi: number, s: Surface): string {
  if (s === "B" && isAnterior(fdi)) return "F";
  if (s === "L" && Math.floor(fdi / 10) <= 2) return "P";
  return s;
}

/** 一颗牙的最高 ICDAS 分（无记录返回 null） */
export function worstCode(entry: ToothEntry | undefined): IcdasCode | null {
  if (!entry) return null;
  let w: IcdasCode | null = null;
  for (const f of Object.values(entry.surfaces)) if (f && (w === null || f.code > w)) w = f.code;
  return w;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// ------------------------------------------------------------------ 存储

const KEY = "oralatlas.records.v1";
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function emptyRecord(): PatientRecord {
  const now = new Date().toISOString();
  return {
    id: uid(),
    version: 1,
    patient: { name: "", recordNo: "", sex: "", birthDate: "", examDate: today(), examiner: "", chiefComplaint: "", notes: "" },
    teeth: {},
    createdAt: now,
    updatedAt: now,
  };
}

/** 校验并规整导入的数据；无法识别时返回 null */
export function normalizeRecord(x: unknown): PatientRecord | null {
  if (!x || typeof x !== "object") return null;
  const r = x as Partial<PatientRecord>;
  if (!r.patient || typeof r.patient !== "object" || !r.teeth || typeof r.teeth !== "object") return null;
  const base = emptyRecord();
  const teeth: Record<string, ToothEntry> = {};
  for (const [k, v] of Object.entries(r.teeth)) {
    if (!/^[1-4][1-8]$/.test(k) || !v || typeof v !== "object") continue;
    const surfaces: ToothEntry["surfaces"] = {};
    for (const s of surfacesOf(Number(k))) {
      const f = (v as ToothEntry).surfaces?.[s];
      if (f && Number.isInteger(f.code) && f.code >= 0 && f.code <= 6)
        surfaces[s] = { code: f.code, activity: f.activity === "active" || f.activity === "arrested" ? f.activity : undefined, note: typeof f.note === "string" ? f.note : undefined };
    }
    teeth[k] = { surfaces, note: typeof (v as ToothEntry).note === "string" ? (v as ToothEntry).note : undefined };
  }
  const p = r.patient as Partial<PatientInfo>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    ...base,
    id: typeof r.id === "string" && r.id ? r.id : base.id,
    patient: {
      name: str(p.name),
      recordNo: str(p.recordNo),
      sex: p.sex === "male" || p.sex === "female" || p.sex === "other" ? p.sex : "",
      birthDate: str(p.birthDate),
      examDate: str(p.examDate) || base.patient.examDate,
      examiner: str(p.examiner),
      chiefComplaint: str(p.chiefComplaint),
      notes: str(p.notes),
    },
    teeth,
    createdAt: str(r.createdAt) || base.createdAt,
    updatedAt: str(r.updatedAt) || base.updatedAt,
  };
}

function load(): { records: PatientRecord[]; activeId: string | null } {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (d && Array.isArray(d.records)) {
      const records = d.records.map(normalizeRecord).filter(Boolean) as PatientRecord[];
      return { records, activeId: records.some((r) => r.id === d.activeId) ? d.activeId : records[0]?.id ?? null };
    }
  } catch {
    /* 存档损坏时从空开始 */
  }
  return { records: [], activeId: null };
}

interface ChartState {
  records: PatientRecord[];
  activeId: string | null;
  /** 当前编辑的牙位与牙面 */
  tooth: number | null;
  surface: Surface | null;
  /** 最近一次保存时间（用于界面提示） */
  savedAt: number;
}

export const useChart = create<ChartState>(() => ({ ...load(), tooth: null, surface: null, savedAt: 0 }));
const set = useChart.setState;
const get = useChart.getState;

let saveTimer = 0;
useChart.subscribe((s, p) => {
  if (s.records === p.records && s.activeId === p.activeId) return;
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ records: get().records, activeId: get().activeId }));
      set({ savedAt: Date.now() });
    } catch (e) {
      console.warn("病历保存失败", e);
    }
  }, 300);
});

export const activeRecord = (s: ChartState = get()) => s.records.find((r) => r.id === s.activeId) ?? null;

function update(fn: (r: PatientRecord) => PatientRecord) {
  const { records, activeId } = get();
  set({ records: records.map((r) => (r.id === activeId ? { ...fn(r), updatedAt: new Date().toISOString() } : r)) });
}

export const chart = {
  create() {
    const r = emptyRecord();
    set({ records: [r, ...get().records], activeId: r.id, tooth: null, surface: null });
    return r;
  },
  open(id: string) {
    set({ activeId: id, tooth: null, surface: null });
  },
  remove(id: string) {
    const records = get().records.filter((r) => r.id !== id);
    set({ records, activeId: get().activeId === id ? records[0]?.id ?? null : get().activeId, tooth: null, surface: null });
  },
  duplicate(id: string) {
    const src = get().records.find((r) => r.id === id);
    if (!src) return;
    const r = { ...structuredClone(src), id: emptyRecord().id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    r.patient.examDate = today();
    set({ records: [r, ...get().records], activeId: r.id });
  },
  /** 导入：id 冲突时生成新 id，不覆盖已有病历 */
  importRecords(list: PatientRecord[]) {
    const have = new Set(get().records.map((r) => r.id));
    const fresh = list.map((r) => (have.has(r.id) ? { ...r, id: emptyRecord().id } : r));
    set({ records: [...fresh, ...get().records], activeId: fresh[0]?.id ?? get().activeId });
    return fresh.length;
  },
  setPatient(patch: Partial<PatientInfo>) {
    update((r) => ({ ...r, patient: { ...r.patient, ...patch } }));
  },
  select(tooth: number | null, surface: Surface | null = null) {
    set({ tooth, surface });
  },
  setSurface(fdi: number, s: Surface, f: SurfaceFinding | null) {
    update((r) => {
      const entry = r.teeth[fdi] ?? { surfaces: {} };
      const surfaces = { ...entry.surfaces };
      if (f) surfaces[s] = f;
      else delete surfaces[s];
      const teeth: Record<string, ToothEntry> = { ...r.teeth, [String(fdi)]: { ...entry, surfaces } };
      if (!Object.keys(surfaces).length && !entry.note) delete teeth[String(fdi)];
      return { ...r, teeth };
    });
  },
  setToothNote(fdi: number, note: string) {
    update((r) => {
      const entry = r.teeth[fdi] ?? { surfaces: {} };
      const teeth: Record<string, ToothEntry> = { ...r.teeth, [String(fdi)]: { ...entry, note: note || undefined } };
      if (!Object.keys(entry.surfaces).length && !note) delete teeth[String(fdi)];
      return { ...r, teeth };
    });
  },
  /** 整颗牙所有牙面记为同一编码（常用于“全部健康”） */
  setAllSurfaces(fdi: number, code: IcdasCode | null) {
    update((r) => {
      const entry = r.teeth[fdi] ?? { surfaces: {} };
      const surfaces: ToothEntry["surfaces"] = {};
      if (code !== null) for (const s of surfacesOf(fdi)) surfaces[s] = { ...entry.surfaces[s], code };
      const teeth: Record<string, ToothEntry> = { ...r.teeth, [String(fdi)]: { ...entry, surfaces } };
      if (code === null && !entry.note) delete teeth[String(fdi)];
      return { ...r, teeth };
    });
  },
};

/** 统计：有记录的牙数、各编码的牙面数、≥3（有龋洞或牙本质受累）的牙面数 */
export function summarize(r: PatientRecord) {
  const byCode = [0, 0, 0, 0, 0, 0, 0];
  let teeth = 0;
  let cavitated = 0;
  for (const e of Object.values(r.teeth)) {
    const fs = Object.values(e.surfaces);
    if (fs.length) teeth++;
    for (const f of fs) {
      if (!f) continue;
      byCode[f.code]++;
      if (f.code >= 3) cavitated++;
    }
  }
  return { teeth, byCode, cavitated };
}

