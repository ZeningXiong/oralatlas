// 牙位记录法：FDI（ISO 3950）、通用编号法（Universal / ADA）、Palmer 记录法
import type { ArchId, ToothTypeId } from "../content/types";

export type Numbering = "fdi" | "uni" | "pal";

export const ALL_FDI: number[] = [1, 2, 3, 4].flatMap((q) => [1, 2, 3, 4, 5, 6, 7, 8].map((p) => q * 10 + p));

export const TYPE_BY_POSITION: ToothTypeId[] = [
  "central-incisor",
  "lateral-incisor",
  "canine",
  "first-premolar",
  "second-premolar",
  "first-molar",
  "second-molar",
  "third-molar",
];

export const quadrantOf = (fdi: number) => Math.floor(fdi / 10) as 1 | 2 | 3 | 4;
export const positionOf = (fdi: number) => fdi % 10;
export const archOf = (fdi: number): ArchId => (quadrantOf(fdi) <= 2 ? "maxillary" : "mandibular");
/** 患者左右 */
export const sideOf = (fdi: number): "left" | "right" => (quadrantOf(fdi) === 1 || quadrantOf(fdi) === 4 ? "right" : "left");
export const typeOf = (fdi: number): ToothTypeId => TYPE_BY_POSITION[positionOf(fdi) - 1];

export function toUniversal(fdi: number): number {
  const q = quadrantOf(fdi);
  const p = positionOf(fdi);
  if (q === 1) return 9 - p; // 18→1 … 11→8
  if (q === 2) return 8 + p; // 21→9 … 28→16
  if (q === 3) return 25 - p; // 38→17 … 31→24
  return 24 + p; // 41→25 … 48→32
}

export function fromUniversal(n: number): number | null {
  if (n < 1 || n > 32) return null;
  if (n <= 8) return 10 + (9 - n);
  if (n <= 16) return 20 + (n - 8);
  if (n <= 24) return 30 + (25 - n);
  return 40 + (n - 24);
}

const PALMER_Q = { 1: "UR", 2: "UL", 3: "LL", 4: "LR" } as const;
const PALMER_Q_ZH = { 1: "右上", 2: "左上", 3: "左下", 4: "右下" } as const;

export const toPalmer = (fdi: number) => `${PALMER_Q[quadrantOf(fdi)]}${positionOf(fdi)}`;
export const toPalmerZh = (fdi: number) => `${PALMER_Q_ZH[quadrantOf(fdi)]}${positionOf(fdi)}`;

export function fromPalmer(code: string): number | null {
  const m = code.trim().toUpperCase().match(/^(UR|UL|LL|LR)\s*([1-8])$/);
  if (!m) return null;
  const q = { UR: 1, UL: 2, LL: 3, LR: 4 }[m[1] as "UR"]!;
  return q * 10 + Number(m[2]);
}

export function formatTooth(fdi: number, n: Numbering): string {
  if (n === "uni") return `#${toUniversal(fdi)}`;
  if (n === "pal") return toPalmer(fdi);
  return String(fdi);
}

export const NUMBERING_LABEL: Record<Numbering, string> = {
  fdi: "FDI",
  uni: "通用",
  pal: "Palmer",
};
export const NUMBERING_LABEL_EN: Record<Numbering, string> = {
  fdi: "FDI",
  uni: "Universal",
  pal: "Palmer",
};

const QUADRANT_ZH = { 1: "上颌右侧", 2: "上颌左侧", 3: "下颌左侧", 4: "下颌右侧" } as const;
const TYPE_ZH: Record<ToothTypeId, string> = {
  "central-incisor": "中切牙",
  "lateral-incisor": "侧切牙",
  canine: "尖牙",
  "first-premolar": "第一前磨牙",
  "second-premolar": "第二前磨牙",
  "first-molar": "第一磨牙",
  "second-molar": "第二磨牙",
  "third-molar": "第三磨牙",
};
const TYPE_EN: Record<ToothTypeId, string> = {
  "central-incisor": "central incisor",
  "lateral-incisor": "lateral incisor",
  canine: "canine",
  "first-premolar": "first premolar",
  "second-premolar": "second premolar",
  "first-molar": "first molar",
  "second-molar": "second molar",
  "third-molar": "third molar",
};

export const toothTypeZh = (t: ToothTypeId) => TYPE_ZH[t];
export const toothTypeEn = (t: ToothTypeId) => TYPE_EN[t].replace(/^./, (c) => c.toUpperCase());
export const toothNameZh = (fdi: number) => QUADRANT_ZH[quadrantOf(fdi)] + TYPE_ZH[typeOf(fdi)];
export const toothNameEn = (fdi: number) =>
  `${archOf(fdi) === "maxillary" ? "Maxillary" : "Mandibular"} ${sideOf(fdi)} ${TYPE_EN[typeOf(fdi)]}`;
export const guideKeyOf = (fdi: number) => `${archOf(fdi)}-${typeOf(fdi)}` as const;

/** 解析用户输入的牙位：支持 “36” “#19” “19号” “LL6” “左下6” “uni 19” 等 */
export function parseToothQuery(raw: string): number[] {
  const s = raw.trim().toUpperCase();
  const out = new Set<number>();
  const fdi = s.match(/^([1-4][1-8])$/);
  if (fdi) out.add(Number(fdi[1]));
  const uni = s.match(/^(?:#|UNI\s*|通用\s*)(\d{1,2})号?$/) ?? s.match(/^(\d{1,2})号$/);
  if (uni) {
    const f = fromUniversal(Number(uni[1]));
    if (f) out.add(f);
  }
  const pal = fromPalmer(s);
  if (pal) out.add(pal);
  const zh = raw.trim().match(/^(右上|左上|左下|右下)\s*([1-8])$/);
  if (zh) out.add({ 右上: 1, 左上: 2, 左下: 3, 右下: 4 }[zh[1] as "右上"]! * 10 + Number(zh[2]));
  return [...out];
}
