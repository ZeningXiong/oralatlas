import { Eye, EyeOff, Ghost, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { CATEGORIES, categoryOf, GROUP_EN, INTERNAL_CATEGORIES } from "../../anatomy/registry";
import { useT } from "../../i18n";
import type { CategoryId } from "../../content/types";
import { useEngine } from "../../app/services";
import { actions, useStore, type Vis } from "../../state/store";

const GROUP_ORDER = ["牙体", "牙周", "骨与关节", "神经血管", "软组织与背景"] as const;

export function LayersPanel() {
  const engine = useEngine();
  const ready = useStore((s) => s.ready);
  const cats = useStore((s) => s.categories);
  const teethLoading = useStore((s) => s.teethLoading);
  const dissect = useStore((s) => s.dissectFdi);
  const t = useT();

  const counts = useMemo(() => {
    const c: Partial<Record<CategoryId, number>> = {};
    if (!engine?.manifest) return c;
    for (const key of Object.keys(engine.manifest.meshes)) {
      const cat = categoryOf(key);
      c[cat] = (c[cat] ?? 0) + 1;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, ready]);

  const internalOn = INTERNAL_CATEGORIES.some((c) => cats[c] !== "off");
  const neuroOn = cats.nerves !== "off" || cats.arteries !== "off" || cats.veins !== "off";

  return (
    <div className="scroll sidebar-body">
      {dissect !== null && (
        <div className="hint-box">
          {t("正在", "")}<b>{t("单牙解剖", "Single-tooth dissection")}</b>
          {t("：牙体组织开关只作用于当前牙齿，其他结构已暂时隐藏。", ": tooth-tissue toggles apply only to this tooth; other structures are temporarily hidden.")}
        </div>
      )}
      {GROUP_ORDER.map((g) => (
        <div className="layer-group" key={g}>
          <h4 className="eyebrow">{t(g, GROUP_EN[g])}</h4>
          {CATEGORIES.filter((c) => c.group === g).map((c) => {
            const v = cats[c.id];
            const label = t(c.label, c.labelEn);
            return (
              <div className="layer-row" key={c.id}>
                <span className={`swatch ${v}`} style={{ background: c.color }} />
                <span className="layer-name">
                  {label}
                  {counts[c.id] ? <small>{counts[c.id]}</small> : null}
                </span>
                <VisSeg value={v} onChange={(nv) => actions.setCategory(c.id, nv)} label={label} />
                <button className="solo" onClick={() => actions.soloCategory(c.id)} title={t(`仅显示${c.label}`, `Show only ${c.labelEn}`)}>
                  {t("仅", "Solo")}
                </button>
              </div>
            );
          })}
          {g === "牙体" && internalOn && dissect === null && (
            <div className="hint-box" style={{ margin: "6px 6px 4px" }}>
              {t("已打开牙体内部组织：牙齿外形自动隐藏，改为显示釉质、牙本质等分层。", "Internal tooth tissues are on: tooth outlines are hidden and enamel, dentin and other layers are shown instead.")}
              {teethLoading && (
                <>
                  <div style={{ marginTop: 8 }}>
                    {t("正在加载 32 颗牙的内部结构", "Loading internal structures of 32 teeth")}（{teethLoading.done}/{teethLoading.total}）
                  </div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <i style={{ width: `${(teethLoading.done / teethLoading.total) * 100}%` }} />
                  </div>
                </>
              )}
            </div>
          )}
          {g === "神经血管" && neuroOn && (
            <div className="hint-box" style={{ margin: "6px 6px 4px" }}>
              {t("神经血管可见时，骨骼", "While nerves and vessels are visible, bones become ")}<b>{t("自动透视", "see-through")}</b>
              {t("，便于看清骨内走行（如下牙槽神经穿行下颌管）。", " so their course inside bone is visible (e.g. the inferior alveolar nerve in the mandibular canal).")}
            </div>
          )}
        </div>
      ))}
      <div style={{ padding: "8px 16px 18px", display: "flex", gap: 8 }}>
        <button className="btn sm" onClick={() => actions.resetAll()}>
          <RotateCcw size={14} />
          {t("恢复默认", "Reset")}
        </button>
      </div>
    </div>
  );
}

export function VisSeg({ value, onChange, label }: { value: Vis; onChange: (v: Vis) => void; label: string }) {
  const t = useT();
  return (
    <span className="vis-seg" role="group" aria-label={t(`${label}显示方式`, `${label} visibility`)}>
      <button aria-pressed={value === "on"} onClick={() => onChange("on")} title={t("显示", "Show")}>
        <Eye size={14} />
      </button>
      <button aria-pressed={value === "ghost"} onClick={() => onChange("ghost")} title={t("半透明", "Ghost")}>
        <Ghost size={14} />
      </button>
      <button aria-pressed={value === "off"} onClick={() => onChange("off")} title={t("隐藏", "Hide")}>
        <EyeOff size={14} />
      </button>
    </span>
  );
}
