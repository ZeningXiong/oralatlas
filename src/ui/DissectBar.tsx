import { LogOut, X } from "lucide-react";
import { formatTooth, toothNameEn, toothNameZh } from "../anatomy/notation";
import { useT } from "../i18n";
import { CATEGORY_BY_ID } from "../anatomy/registry";
import type { CategoryId } from "../content/types";
import { actions, setState, useStore } from "../state/store";

const TISSUES: CategoryId[] = ["enamel", "dentin", "cementum", "pdl", "pulp", "canals"];

/** 单牙解剖时的顶部控制条：牙名 + 各层组织开关 + 退出 */
export function DissectBar() {
  const fdi = useStore((s) => s.dissectFdi);
  const numbering = useStore((s) => s.numbering);
  const cats = useStore((s) => s.categories);
  const t = useT();
  if (fdi === null) return null;
  return (
    <div className="panel dissect-bar" role="group" aria-label={t("单牙解剖", "Single-tooth dissection")}>
      <span>
        <span className="eyebrow">{t("单牙解剖", "Dissection")}</span>
        <br />
        <b>{t(toothNameZh(fdi), toothNameEn(fdi))}</b> <span className="mono">{formatTooth(fdi, numbering)}</span>
      </span>
      <div className="layer-chips">
        {TISSUES.map((c) => {
          const on = cats[c] !== "off";
          return (
            <button
              key={c}
              className="layer-chip"
              aria-pressed={on}
              onClick={() => actions.setCategory(c, on ? "off" : "on")}
              onDoubleClick={() => setState({ categories: { ...cats, ...Object.fromEntries(TISSUES.map((x) => [x, x === c ? "on" : "off"])) } })}
              title={t("单击开关，双击只看这一层", "Click to toggle, double-click to show only this layer")}
            >
              <i style={{ background: CATEGORY_BY_ID[c].color }} />
              {t(CATEGORY_BY_ID[c].label, CATEGORY_BY_ID[c].labelEn)}
            </button>
          );
        })}
      </div>
      <button className="btn sm" onClick={() => actions.exitDissect()}><LogOut size={14} />{t("返回全口", "Back to full mouth")}</button>
    </div>
  );
}

/** 只看一个牙弓 / 仅显示某结构时的提示条 */
export function StageChips() {
  const archFilter = useStore((s) => s.archFilter);
  const isolate = useStore((s) => s.isolate);
  const hidden = useStore((s) => s.hidden);
  const dissect = useStore((s) => s.dissectFdi);
  const quiz = useStore((s) => s.mode === "quiz");
  const t = useT();
  if (dissect !== null || quiz) return null;
  const chips: { text: string; clear: () => void }[] = [];
  if (archFilter) chips.push({ text: archFilter === "upper" ? t("仅显示上牙弓", "Upper arch only") : t("仅显示下牙弓", "Lower arch only"), clear: () => setState({ archFilter: null }) });
  if (isolate) chips.push({ text: t("仅显示所选结构", "Isolated selection"), clear: () => setState({ isolate: null }) });
  if (hidden.length) chips.push({ text: t(`已隐藏 ${hidden.length} 个结构`, `${hidden.length} hidden`), clear: () => setState({ hidden: [] }) });
  if (!chips.length) return null;
  return (
    <div className="stage-chip" style={{ display: "flex", gap: 6 }}>
      {chips.map((c) => (
        <button key={c.text} className="chip accent" onClick={c.clear} style={{ height: 30, padding: "0 12px", boxShadow: "var(--shadow)" }}>
          {c.text} <X size={13} />
        </button>
      ))}
    </div>
  );
}
