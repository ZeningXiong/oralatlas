import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, baseIdOf, categoryOf, describe, sideOfKey, type Provenance } from "../../anatomy/registry";
import type { CategoryId } from "../../content/types";
import { useEngine } from "../../app/services";
import { actions, useStore } from "../../state/store";
import { highlight } from "../rich";
import { useT } from "../../i18n";

export const PROV_COLOR: Record<Provenance, string> = {
  source: "#16a34a",
  derived: "#0ea5e9",
  modeled: "#a855f7",
  atlas: "#f59e0b",
  schematic: "#ef4444",
};

interface Item {
  base: string;
  name: string;
  en: string;
  keys: { key: string; side: "left" | "right" | null }[];
  category: CategoryId;
  provenance: Provenance;
}

/** 结构树：按类别列出模型中的全部结构（双侧结构合并为一条，可分别选择左右） */
export function StructureTree() {
  const engine = useEngine();
  const ready = useStore((s) => s.ready);
  const selected = useStore((s) => s.selected);
  const [q, setQ] = useState("");
  const t = useT();
  const lang = useStore((s) => s.lang);

  const groups = useMemo(() => {
    const map = new Map<CategoryId, Map<string, Item>>();
    if (!engine?.manifest) return [];
    for (const [key, m] of Object.entries(engine.manifest.meshes)) {
      const cat = categoryOf(key);
      if (cat === "teeth" || /-\d\d$/.test(key)) continue; // 牙齿与牙体组织在牙位图中浏览
      const base = baseIdOf(key);
      const d = describe(key);
      let g = map.get(cat);
      if (!g) map.set(cat, (g = new Map()));
      let item = g.get(base);
      if (!item) {
        item = {
          base,
          name: (lang === "en" ? d.info?.nameEn || d.info?.nameZh : d.info?.nameZh) ?? base,
          en: (lang === "en" ? d.info?.nameZh : d.info?.nameEn) ?? "",
          keys: [],
          category: cat,
          provenance: m.provenance,
        };
        g.set(base, item);
      }
      item.keys.push({ key, side: sideOfKey(key) });
    }
    return CATEGORIES.filter((c) => map.has(c.id)).map((c) => ({
      cat: c,
      items: [...map.get(c.id)!.values()].sort((a, b) => a.name.localeCompare(b.name, lang === "en" ? "en" : "zh")),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, ready, lang]);

  const filter = q.trim().toLowerCase();
  const match = (it: Item) => !filter || it.name.toLowerCase().includes(filter) || it.en.toLowerCase().includes(filter) || it.base.includes(filter);

  return (
    <>
      <div className="tree-filter">
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--faint)" }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder={t("筛选结构（中文 / 英文）", "Filter structures (English / 中文)")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="scroll sidebar-body tree">
        {groups.map(({ cat, items }) => {
          const shown = items.filter(match);
          if (!shown.length) return null;
          return (
            <details key={cat.id} open={Boolean(filter) || undefined}>
              <summary>
                <span className="swatch" style={{ background: cat.color, width: 14, height: 14 }} />
                {t(cat.label, cat.labelEn)}
                <span className="count">{shown.length}</span>
              </summary>
              {shown.map((it) => {
                const active = it.keys.some((k) => k.key === selected);
                const primary = it.keys.find((k) => k.side === "right") ?? it.keys[0];
                return (
                  <div className={`tree-item ${active ? "active" : ""}`} key={it.base}>
                    <span className="prov-dot" style={{ background: PROV_COLOR[it.provenance] }} title={t(`几何来源：${it.provenance}`, `Geometry source: ${it.provenance}`)} />
                    <button className="name" onClick={() => actions.reveal(primary.key, it.category)}>
                      {highlight(it.name, filter)}
                    </button>
                    {it.keys.length > 1 &&
                      it.keys
                        .filter((k) => k.side)
                        .sort((a) => (a.side === "right" ? -1 : 1))
                        .map((k) => (
                          <button key={k.key} className="side" onClick={() => actions.reveal(k.key, it.category)}>
                            {k.side === "right" ? t("右", "R") : t("左", "L")}
                          </button>
                        ))}
                  </div>
                );
              })}
            </details>
          );
        })}
        <div className="muted" style={{ fontSize: 11.5, padding: "12px 10px 0", lineHeight: 1.6 }}>
          {t("圆点颜色表示几何来源：", "Dot colour = geometry source:")}
          <span style={{ color: PROV_COLOR.source }}> ● {t("真实扫描", "scanned")}</span>
          <span style={{ color: PROV_COLOR.derived }}> ● {t("派生", "derived")}</span>
          <span style={{ color: PROV_COLOR.atlas }}> ● {t("图谱拟合", "atlas-fitted")}</span>
          <span style={{ color: PROV_COLOR.modeled }}> ● {t("建模", "modeled")}</span>
          <span style={{ color: PROV_COLOR.schematic }}> ● {t("示意", "schematic")}</span>
          {t("。牙齿与牙体组织请在“牙位图”中浏览。", ". Browse teeth and tooth tissues in the Odontogram.")}
        </div>
      </div>
    </>
  );
}
