// 结构注册表：从 manifest 推导每个网格的类别、所属颌、名称等。
// 原则（沿用 anatomy 项目的做法）：界面组件不硬编码结构 ID，一切从这里查询。
import type { CategoryId, StructureInfo } from "../content/types";
import { STRUCTURES, SKULL_LANDMARKS } from "../content/structures";
import { TOOTH_LANDMARKS, ROOT_LABELS, SURFACE_FEATURES } from "../content/toothParts";
import { archOf, toothNameEn, toothNameZh } from "./notation";

export type Provenance = "source" | "derived" | "modeled" | "atlas" | "schematic";

export interface ManifestMesh {
  stage: number;
  file: string;
  bounds: [[number, number, number], [number, number, number]];
  triangles: number;
  provenance: Provenance;
  sourceRef?: string;
}
export interface ToothFrame {
  origin: [number, number, number];
  axis: [number, number, number]; // 指向咬合面/切端
  mesial: [number, number, number];
  buccal: [number, number, number];
}
export interface ManifestTooth {
  arch: "maxillary" | "mandibular";
  side: "left" | "right";
  type: string;
  provenance: Provenance;
  frame: ToothFrame;
  roots: { label: string; canals: string[] }[];
  landmarks: Record<string, [number, number, number]>;
  layers: string[];
  asset: string;
  extract: number;
  collar: number;
  surfaceFeatures?: { key: string; anchor: [number, number, number]; path: [number, number, number][] | null }[];
}
export interface Manifest {
  units: string;
  source: string;
  meshes: Record<string, ManifestMesh>;
  teeth: Record<string, ManifestTooth>;
  landmarks: Record<string, [number, number, number]>;
  explode: { jaw: number; upper: { gingiva: number; teeth: number }; lower: { gingiva: number; teeth: number } };
  jawMotion: { pivot: [number, number, number]; translation: [number, number, number]; rotation: number };
  bounds: [[number, number, number], [number, number, number]];
  files: Record<string, number>;
}

// ---------------------------------------------------------------- 类别

export interface CategoryDef {
  id: CategoryId;
  label: string;
  group: "牙体" | "牙周" | "骨与关节" | "神经血管" | "软组织与背景";
  labelEn: string;
  color: string;
  /** 牙体内部组织：需要加载单牙资源才可见 */
  internal?: boolean;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "teeth", label: "牙齿", labelEn: "Teeth", group: "牙体", color: "#f3eee3" },
  { id: "enamel", label: "牙釉质", labelEn: "Enamel", group: "牙体", color: "#e8ebe6", internal: true },
  { id: "dentin", label: "牙本质", labelEn: "Dentin", group: "牙体", color: "#eec777", internal: true },
  { id: "cementum", label: "牙骨质", labelEn: "Cementum", group: "牙体", color: "#b98a62", internal: true },
  { id: "pulp", label: "牙髓腔", labelEn: "Pulp cavity", group: "牙体", color: "#e0605a", internal: true },
  { id: "canals", label: "根管", labelEn: "Root canals", group: "牙体", color: "#b8323a", internal: true },
  { id: "gingiva", label: "牙龈", labelEn: "Gingiva", group: "牙周", color: "#e48b92" },
  { id: "pdl", label: "牙周膜", labelEn: "Periodontal ligament", group: "牙周", color: "#d77fb0", internal: true },
  { id: "alveolar", label: "牙槽骨", labelEn: "Alveolar bone", group: "牙周", color: "#eadfc9" },
  { id: "maxilla", label: "上颌骨", labelEn: "Maxilla", group: "骨与关节", color: "#e5dccb" },
  { id: "mandible", label: "下颌骨", labelEn: "Mandible", group: "骨与关节", color: "#e2d8c6" },
  { id: "tmj", label: "颞下颌关节", labelEn: "Temporomandibular joint", group: "骨与关节", color: "#a9c6de" },
  { id: "sinus", label: "鼻旁窦", labelEn: "Paranasal sinuses", group: "骨与关节", color: "#6fb7e6" },
  { id: "nerves", label: "神经", labelEn: "Nerves", group: "神经血管", color: "#f1c232" },
  { id: "arteries", label: "动脉", labelEn: "Arteries", group: "神经血管", color: "#d9423c" },
  { id: "veins", label: "静脉", labelEn: "Veins", group: "神经血管", color: "#3d6fd6" },
  { id: "muscles", label: "肌肉", labelEn: "Muscles", group: "软组织与背景", color: "#c0574f" },
  { id: "skull", label: "颅骨（背景）", labelEn: "Skull (context)", group: "软组织与背景", color: "#ddd4c4" },
];
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryDef>;
export const INTERNAL_CATEGORIES: CategoryId[] = CATEGORIES.filter((c) => c.internal).map((c) => c.id);

const SKULL_BONES = new Set([
  "ethmoid-bone",
  "frontal-bone",
  "hyoid-bone",
  "inferior-nasal-concha",
  "lacrimal-bone",
  "nasal-bone",
  "occipital-bone",
  "palatine-bone",
  "parietal-bone",
  "sphenoid-bone",
  "temporal-bone",
  "vomer",
  "zygomatic-bone",
]);
const MUSCLES = new Set([
  "buccinator",
  "lateral-pterygoid-upper",
  "lateral-pterygoid-lower",
  "masseter-superficial",
  "masseter-deep",
  "medial-pterygoid",
  "mentalis",
  "orbicularis-oris",
  "temporalis",
]);

/** 网格键 → 基础 ID：去掉 -left/-right 与牙位号 */
export function baseIdOf(key: string): string {
  return key.replace(/-\d\d$/, "").replace(/-(left|right)$/, "");
}
export function fdiOfKey(key: string): number | null {
  const m = key.match(/-(\d\d)$/);
  return m ? Number(m[1]) : null;
}
export function sideOfKey(key: string): "left" | "right" | null {
  const m = key.replace(/-\d\d$/, "").match(/-(left|right)$/);
  return m ? (m[1] as "left" | "right") : null;
}

export function categoryOf(key: string): CategoryId {
  const b = baseIdOf(key);
  if (b === "tooth") return "teeth";
  if (b === "enamel") return "enamel";
  if (b.startsWith("dentin")) return "dentin";
  if (b === "cementum") return "cementum";
  if (b === "pulp-chamber") return "pulp";
  if (b.startsWith("canal")) return "canals";
  if (b === "pdl") return "pdl";
  if (b.startsWith("gingiva")) return "gingiva";
  if (b.endsWith("alveolar-process")) return "alveolar";
  if (b === "maxilla") return "maxilla";
  if (b === "mandible-body" || b === "mandibular-condyle" || b === "mandibular-canal") return "mandible";
  if (b.startsWith("articular-")) return "tmj";
  if (b.endsWith("-sinus")) return "sinus";
  if (b.endsWith("-artery")) return "arteries";
  if (b.endsWith("-vein") || b === "pterygoid-plexus") return "veins";
  if (b.endsWith("-nerve") || b.endsWith("-branch")) return "nerves";
  if (MUSCLES.has(b)) return "muscles";
  if (SKULL_BONES.has(b)) return "skull";
  return "skull";
}

/** 张口/分离时网格跟随哪一部分 */
export type Rig = "upperBone" | "upperGum" | "upperTeeth" | "lowerBone" | "lowerGum" | "lowerTeeth" | "hyoid" | "disc" | "blend";

export function rigOf(key: string): Rig {
  const fdi = fdiOfKey(key);
  const cat = categoryOf(key);
  if (fdi) return archOf(fdi) === "maxillary" ? "upperTeeth" : "lowerTeeth";
  if (key === "gingiva-upper") return "upperGum";
  if (key === "gingiva-lower") return "lowerGum";
  if (cat === "nerves" || cat === "arteries" || cat === "veins" || cat === "muscles") {
    return key.startsWith("mandibular-canal") ? "lowerBone" : "blend";
  }
  if (key.startsWith("mandibular-canal")) return "lowerBone";
  if (key === "hyoid-bone") return "hyoid";
  if (key.startsWith("articular-disc")) return "disc";
  if (cat === "mandible" || key === "mandibular-alveolar-process") return "lowerBone";
  return "upperBone";
}

/** 类别分组的英文名 */
export const GROUP_EN: Record<CategoryDef["group"], string> = {
  牙体: "Tooth tissues",
  牙周: "Periodontium",
  骨与关节: "Bones & joints",
  神经血管: "Nerves & vessels",
  软组织与背景: "Soft tissue & context",
};

// ---------------------------------------------------------------- 名称与信息

const SIDE_ZH = { left: "左侧", right: "右侧" } as const;

export interface StructureView {
  key: string;
  baseId: string;
  category: CategoryId;
  fdi: number | null;
  side: "left" | "right" | null;
  nameZh: string;
  nameEn: string;
  info: StructureInfo | null;
}

/** 牙体组织在名称中显示所属牙齿 */
export function describe(key: string): StructureView {
  const baseId = baseIdOf(key);
  const fdi = fdiOfKey(key);
  const side = sideOfKey(key);
  const category = categoryOf(key);
  const info = STRUCTURES[baseId] ?? (baseId.startsWith("canal") ? STRUCTURES["canal"] : null) ?? null;
  let nameZh = info?.nameZh ?? baseId;
  let nameEn = info?.nameEn ?? baseId;
  if (baseId === "tooth" && fdi) {
    nameZh = toothNameZh(fdi);
    nameEn = toothNameEn(fdi);
  } else if (fdi) {
    nameZh = `${nameZh} · ${fdi}`;
    nameEn = `${nameEn} · ${fdi}`;
  } else if (side) {
    nameZh = `${SIDE_ZH[side]}${nameZh}`;
    nameEn = `${nameEn} (${side})`;
  }
  return { key, baseId, category, fdi, side, nameZh, nameEn, info };
}

/** 标志点：颅骨标志点 + 牙体标志点（键如 "mental-foramen-left"、"pulp-horn-2"） */
export function describeLandmark(key: string): { nameZh: string; nameEn: string; description: string; clinical?: string } | null {
  const side = sideOfKey(key);
  const base = key.replace(/-(left|right)$/, "");
  const skull = SKULL_LANDMARKS[base];
  if (skull) {
    return {
      nameZh: (side ? SIDE_ZH[side] : "") + skull.nameZh,
      nameEn: skull.nameEn,
      description: skull.description,
      clinical: skull.clinical,
    };
  }
  const toothBase = key.replace(/-\d+$/, "");
  if (toothBase.startsWith("apical-foramen")) {
    const root = toothBase.replace("apical-foramen-", "");
    const lm = TOOTH_LANDMARKS["apical-foramen"];
    const rootName = ROOT_LABELS[root.replace(/-\d$/, "")]?.nameZh ?? "";
    return lm ? { ...lm, nameZh: `${rootName}${lm.nameZh}`.replace(/^单根/, "") } : null;
  }
  const lm = TOOTH_LANDMARKS[toothBase];
  if (lm) return lm;
  const sf = SURFACE_FEATURES[key];
  if (sf) return { nameZh: sf.nameZh, nameEn: sf.nameEn, description: sf.description };
  return null;
}

export const PROVENANCE_ORDER: Provenance[] = ["source", "derived", "modeled", "atlas", "schematic"];
