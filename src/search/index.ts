// 搜索索引：牙位（任一记录法）、结构、标志点、课程、术语
import { ALL_FDI, formatTooth, guideKeyOf, parseToothQuery, toothNameEn, toothNameZh, toPalmer, toUniversal } from "../anatomy/notation";
import { categoryOf, describe, describeLandmark, type Manifest } from "../anatomy/registry";
import { TOOTH_GUIDES } from "../content/teeth";
import { LESSONS } from "../content/lessons";
import { GLOSSARY } from "../content/glossary";
import type { Numbering } from "../anatomy/notation";
import type { Lang } from "../state/store";

export type HitKind = "tooth" | "structure" | "tissue" | "landmark" | "lesson" | "term";
export interface Hit {
  kind: HitKind;
  id: string;
  title: string;
  sub: string;
  score: number;
  /** lesson: [lessonId, sectionIndex]；term: 术语 zh */
  payload?: unknown;
}

interface Doc {
  kind: HitKind;
  id: string;
  title: string;
  sub: string;
  fields: string[];
  payload?: unknown;
}

/** 索引按语言缓存：标题与副标题随界面语言变化，可匹配字段两种语言都有 */
const docsByLang: Partial<Record<Lang, Doc[]>> = {};

/** 代表牙排序：上颌第一磨牙、下颌第一磨牙优先（根管种类最全） */
function rankTooth(key: string) {
  const m = key.match(/-(\d\d)$/);
  if (!m) return 0;
  const order = ["16", "36", "14", "46", "26", "11", "13", "31", "34", "37"];
  const i = order.indexOf(m[1]);
  return i < 0 ? 50 : i + 1;
}

function build(manifest: Manifest, lang: Lang) {
  const out: Doc[] = [];
  const en = lang === "en";
  const L = (zh: string, e: string) => (en ? e : zh);
  for (const fdi of ALL_FDI) {
    const g = TOOTH_GUIDES[guideKeyOf(fdi)];
    out.push({
      kind: "tooth",
      id: `tooth-${fdi}`,
      title: L(toothNameZh(fdi), toothNameEn(fdi)),
      sub: `FDI ${fdi} · ${L("通用", "Universal")} #${toUniversal(fdi)} · Palmer ${toPalmer(fdi)}`,
      fields: [toothNameZh(fdi), toothNameEn(fdi), g?.nameZh ?? "", ...(g?.aliasZh ?? [])],
    });
  }
  // 牙体组织与根管：每种取一个代表牙（优先 16 / 36），在单牙解剖中展示
  const seen = new Set<string>();
  const keys = Object.keys(manifest.meshes).sort((a, b) => rankTooth(a) - rankTooth(b));
  for (const key of keys) {
    if (/-\d\d$/.test(key)) {
      const base = key.replace(/-\d\d$/, "");
      if (base === "tooth" || seen.has(base)) continue;
      seen.add(base);
      const d = describe(key);
      const fdi = Number(key.slice(-2));
      out.push({
        kind: "tissue",
        id: key,
        title: (en ? d.info?.nameEn || d.info?.nameZh : d.info?.nameZh) ?? base,
        sub: en
          ? `${base.startsWith("canal") ? "Root canal" : "Tooth tissue"} · view in dissection (e.g. ${toothNameEn(fdi)})`
          : `${base.startsWith("canal") ? "根管" : "牙体组织"} · 在单牙解剖中查看（示例：${toothNameZh(fdi)}）`,
        fields: [d.info?.nameZh ?? "", d.info?.nameEn ?? "", d.info?.nameLatin ?? "", base],
      });
      continue;
    }
    const d = describe(key);
    out.push({
      kind: "structure",
      id: key,
      title: en ? d.nameEn || d.nameZh : d.nameZh,
      sub: [en ? d.info?.nameZh : d.info?.nameEn, d.info?.nameLatin].filter(Boolean).join(" · "),
      fields: [d.nameZh, d.nameEn, d.info?.nameZh ?? "", d.info?.nameEn ?? "", d.info?.nameLatin ?? "", key],
    });
  }
  for (const key of Object.keys(manifest.landmarks)) {
    const d = describeLandmark(key);
    if (!d) continue;
    out.push({ kind: "landmark", id: key, title: L(d.nameZh, d.nameEn), sub: L(`骨性标志 · ${d.nameEn}`, `Landmark · ${d.nameZh}`), fields: [d.nameZh, d.nameEn] });
  }
  for (const l of LESSONS) {
    out.push({ kind: "lesson", id: l.id, title: l.title, sub: `${L("课程", "Lesson")} ${l.order} · ${l.subtitle}`, fields: [l.title, l.subtitle], payload: [l.id, 0] });
    l.sections.forEach((s, i) =>
      out.push({ kind: "lesson", id: `${l.id}#${i}`, title: s.heading, sub: `${L("课程", "Lesson")} ${l.order} · ${l.title}`, fields: [s.heading], payload: [l.id, i] }),
    );
  }
  for (const t of GLOSSARY) {
    out.push({
      kind: "term",
      id: `term-${t.zh}`,
      title: en ? t.en || t.zh : t.zh,
      sub: `${en ? t.zh : t.en}${t.latin ? ` · ${t.latin}` : ""} — ${t.definition.slice(0, 48)}${t.definition.length > 48 ? "…" : ""}`,
      fields: [t.zh, t.en, t.latin ?? ""],
      payload: t.zh,
    });
  }
  return out;
}

const KIND_WEIGHT: Record<HitKind, number> = { tooth: 6, structure: 5, tissue: 5, landmark: 4, lesson: 3, term: 2 };

export function search(manifest: Manifest, q: string, numbering: Numbering, lang: Lang = "zh"): Hit[] {
  const docs = (docsByLang[lang] ??= build(manifest, lang));
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const hits: Hit[] = [];
  // 牙位号直达
  for (const fdi of parseToothQuery(q)) {
    const en = lang === "en";
    hits.push({
      kind: "tooth",
      id: `tooth-${fdi}`,
      title: en ? toothNameEn(fdi) : toothNameZh(fdi),
      sub: `${formatTooth(fdi, numbering)} · FDI ${fdi} · ${en ? "Universal" : "通用"} #${toUniversal(fdi)} · ${toPalmer(fdi)}`,
      score: 100,
    });
  }
  for (const d of docs) {
    let best = 0;
    for (const f of d.fields) {
      const v = f.toLowerCase();
      if (!v) continue;
      if (v === query) best = Math.max(best, 40);
      else if (v.startsWith(query)) best = Math.max(best, 28);
      else if (v.includes(query)) best = Math.max(best, 16);
    }
    if (best) hits.push({ kind: d.kind, id: d.id, title: d.title, sub: d.sub, score: best + KIND_WEIGHT[d.kind] - d.title.length * 0.05, payload: d.payload });
  }
  const uniq = new Map<string, Hit>();
  for (const h of hits.sort((a, b) => b.score - a.score)) if (!uniq.has(h.kind + h.id)) uniq.set(h.kind + h.id, h);
  return [...uniq.values()].slice(0, 40);
}

export { categoryOf };
