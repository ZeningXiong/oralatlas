import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GLOSSARY } from "../content/glossary";
import { setState, useStore } from "../state/store";
import { highlight } from "./rich";
import { AiNotice } from "./AiNotice";
import { ZhOnlyNote } from "./ZhOnlyNote";
import { useLang, useT } from "../i18n";

/** 术语分组的英文名（分组名来自 content/glossary.ts） */
const GROUP_EN: Record<string, string> = {
  牙体形态: "Tooth morphology",
  牙体组织: "Dental tissues",
  髓腔与根管: "Pulp cavity & canals",
  牙周组织: "Periodontium",
  牙的发育: "Tooth development",
  骨与关节: "Bones & joints",
  肌肉: "Muscles",
  神经血管: "Nerves & vessels",
  方位与记录: "Orientation & notation",
  临床应用: "Clinical application",
};

export function GlossaryPanel() {
  const t = useT();
  const lang = useLang();
  const focus = useStore((s) => s.glossaryFocus);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => [...new Set(GLOSSARY.map((t) => t.group))], []);

  useEffect(() => {
    if (!focus) return;
    setQ("");
    setGroup(null);
    requestAnimationFrame(() => {
      const el = ref.current?.querySelector<HTMLElement>(`[data-term="${CSS.escape(focus)}"]`);
      el?.scrollIntoView({ block: "center" });
      el?.animate([{ background: "var(--accent-soft)" }, { background: "transparent" }], { duration: 1800 });
      setState({ glossaryFocus: null });
    });
  }, [focus]);

  const f = q.trim().toLowerCase();
  const list = GLOSSARY.filter(
    (t) =>
      (!group || t.group === group) &&
      (!f || t.zh.includes(f) || t.en.toLowerCase().includes(f) || (t.latin ?? "").toLowerCase().includes(f) || t.definition.includes(f)),
  ).sort((a, b) => (lang === "en" ? a.en.localeCompare(b.en, "en") : a.zh.localeCompare(b.zh, "zh")));

  return (
    <>
      <div className="panel-head" style={{ display: "block" }}>
        <div className="eyebrow">{t("中英拉丁对照", "Chinese · English · Latin")}</div>
        <h2 className="panel-title" style={{ fontSize: 18, margin: "2px 0 4px" }}>{t(`术语表 · ${GLOSSARY.length} 条`, `Glossary · ${GLOSSARY.length} terms`)}</h2>
        <div style={{ marginBottom: 10 }}><AiNotice /></div>
        <div style={{ marginBottom: 10 }}><ZhOnlyNote compact /></div>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--faint)" }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder={t("搜索术语或释义", "Search terms or definitions")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="glossary-groups">
        <button className="btn sm" aria-pressed={!group} onClick={() => setGroup(null)}>{t("全部", "All")}</button>
        {groups.map((g) => (
          <button key={g} className="btn sm" aria-pressed={group === g} onClick={() => setGroup(g)}>{t(g, GROUP_EN[g] ?? g)}</button>
        ))}
      </div>
      <div className="scroll sidebar-body glossary" ref={ref}>
        <dl>
          {list.map((t) => (
            <div className="term" key={t.zh} data-term={t.zh}>
              <dt>
                {lang === "en" ? highlight(t.en, f) : highlight(t.zh, f)}
                <span>{lang === "en" ? highlight(t.zh, f) : highlight(t.en, f)}</span>
                {t.latin && <i>{t.latin}</i>}
              </dt>
              <dd>{highlight(t.definition, f)}</dd>
            </div>
          ))}
        </dl>
        {!list.length && <div className="empty-state">{t("没有匹配的术语。", "No matching terms.")}</div>}
      </div>
    </>
  );
}
