import {
  Box,
  ChevronsDownUp,
  Eye,
  FlipHorizontal2,
  Maximize,
  Minus,
  Plus,
  RefreshCcw,
  Rotate3d,
  Scissors,
  Tag,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import type { ViewPreset } from "../content/types";
import { useEngine } from "../app/services";
import { actions, setState, useStore, type SectionAxis } from "../state/store";
import { useT } from "../i18n";

const VIEWS: { id: ViewPreset; label: string; en: string; glyph: ReactNode; glyphEn: ReactNode }[] = [
  { id: "three-quarter", label: "四分之三视图", en: "Three-quarter", glyph: <Box size={16} />, glyphEn: <Box size={16} /> },
  { id: "front", label: "正面", en: "Front", glyph: <b>前</b>, glyphEn: <b>F</b> },
  { id: "right", label: "右侧面（患者右）", en: "Right (patient's)", glyph: <b>右</b>, glyphEn: <b>R</b> },
  { id: "left", label: "左侧面（患者左）", en: "Left (patient's)", glyph: <b>左</b>, glyphEn: <b>L</b> },
  { id: "top", label: "上方", en: "Top", glyph: <b>上</b>, glyphEn: <b>T</b> },
  { id: "bottom", label: "下方", en: "Bottom", glyph: <b>下</b>, glyphEn: <b>B</b> },
  { id: "occlusal-upper", label: "上牙弓咬合面", en: "Upper occlusal", glyph: <b>⌒</b>, glyphEn: <b>⌒</b> },
  { id: "occlusal-lower", label: "下牙弓咬合面", en: "Lower occlusal", glyph: <b>⌣</b>, glyphEn: <b>⌣</b> },
];

const AXES_OVERVIEW: Record<SectionAxis, [string, string]> = { sagittal: ["矢状面", "Sagittal"], coronal: ["冠状面", "Coronal"], axial: ["水平面", "Axial"] };
const AXES_TOOTH: Record<SectionAxis, [string, string]> = { sagittal: ["近远中向", "Mesiodistal"], coronal: ["颊（唇）舌向", "Buccolingual"], axial: ["水平向", "Horizontal"] };

export function Dock() {
  const engine = useEngine();
  const s = useStore(
    useShallow((st) => ({
    view: st.view,
    explode: st.explode,
    jawOpen: st.jawOpen,
    section: st.section,
    labels: st.labels,
    autoRotate: st.autoRotate,
    dissect: st.dissectFdi,
    toothExplode: st.toothExplode,
    showContext: st.showContext,
    })),
  );
  const [pop, setPop] = useState<"section" | "view" | null>(null);
  const t = useT();
  const en = useStore((st) => st.lang) === "en";
  const axesPair = s.dissect !== null ? AXES_TOOTH : AXES_OVERVIEW;
  const axes = Object.fromEntries(Object.entries(axesPair).map(([k, v]) => [k, t(v[0], v[1])])) as Record<SectionAxis, string>;
  const sec = s.section;
  const setSec = (patch: Partial<typeof sec>) => setState({ section: { ...useStore.getState().section, ...patch } });

  return (
    <div className="panel dock" role="toolbar" aria-label={t("视图工具", "View tools")}>
      {s.dissect === null ? (
        <>
          <div className="dock-wrap">
            <button className="btn sm" aria-pressed={pop === "view"} onClick={() => setPop(pop === "view" ? null : "view")}>
              {(() => { const v = VIEWS.find((x) => x.id === s.view); return (en ? v?.glyphEn : v?.glyph) ?? <Box size={16} />; })()}
              {t("视角", "View")}
            </button>
            {pop === "view" && (
              <div className="panel dock-pop" onMouseLeave={() => setPop(null)}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="eyebrow" style={{ flex: 1 }}>{t("预设视角（快捷键 1–8）", "Preset views (keys 1–8)")}</span>
                  <button className="btn sm icon" aria-label={t("放大", "Zoom in")} onClick={() => engine?.zoom(0.8)}><Plus size={15} /></button>
                  <button className="btn sm icon" aria-label={t("缩小", "Zoom out")} onClick={() => engine?.zoom(1.25)}><Minus size={15} /></button>
                </div>
                <div className="view-grid">
                  {VIEWS.map((v, i) => (
                    <button
                      key={v.id}
                      className="btn"
                      aria-pressed={s.view === v.id}
                      onClick={() => {
                        actions.setView(v.id);
                        setPop(null);
                      }}
                    >
                      {en ? v.glyphEn : v.glyph}
                      <span>{en ? v.en.replace(/ \(.*\)/, "") : v.label.replace(/（.*）/, "")}</span>
                      <kbd style={{ display: "none" }}>{i + 1}</kbd>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="sep" />
          <label className="dock-slider" title={t("把上下颌、牙龈和牙齿逐层分开，看清牙根与牙槽窝", "Separate jaws, gingiva and teeth to see roots and sockets")}>
            <ChevronsDownUp size={15} />
            <input type="range" min={0} max={1} step={0.01} value={s.explode} onChange={(e) => setState({ explode: Number(e.target.value) })} aria-label={t("上下颌分离", "Explode jaws")} />
          </label>
          <label className="dock-slider" title={t("张口：下颌绕髁突转动并向前滑动", "Open mouth: the mandible rotates about the condyles and glides forward")}>
            <span>{t("张口", "Open")}</span>
            <input type="range" min={0} max={1} step={0.01} value={s.jawOpen} onChange={(e) => setState({ jawOpen: Number(e.target.value) })} aria-label={t("张口程度", "Mouth opening")} />
          </label>
        </>
      ) : (
        <>
          <button className="btn sm ghost tooltip-btn" data-tip={t("颊（唇）侧观", "Buccal (labial) view")} onClick={() => actions.focus(`tooth-${s.dissect}`)}><Eye size={15} />{t("取景", "Frame")}</button>
          <label className="dock-slider" title={t("把牙体各层组织分开展示", "Pull the tooth tissue layers apart")}>
            <span>{t("分层展开", "Explode layers")}</span>
            <input type="range" min={0} max={1} step={0.01} value={s.toothExplode} onChange={(e) => setState({ toothExplode: Number(e.target.value) })} aria-label={t("分层展开", "Explode layers")} />
          </label>
          <button className="btn sm" aria-pressed={s.showContext} onClick={() => setState({ showContext: !s.showContext })}>{t("周围组织", "Surroundings")}</button>
        </>
      )}
      <span className="sep" />
      <div className="dock-wrap">
        <button className="btn sm" aria-pressed={sec.enabled} onClick={() => { setSec({ enabled: !sec.enabled }); setPop(!sec.enabled ? "section" : null); }}>
          <Scissors size={15} />{t("剖切", "Section")}
        </button>
        {pop === "section" && sec.enabled && (
          <div className="panel dock-pop" onMouseLeave={() => setPop(null)}>
            <label>
              {t("剖面方向", "Plane")}
              <div className="seg">
                {(Object.keys(axes) as SectionAxis[]).map((a) => (
                  <button key={a} aria-pressed={sec.axis === a} onClick={() => setSec({ axis: a, offset: 0 })}>{axes[a]}</button>
                ))}
              </div>
            </label>
            <label>
              {t("剖面位置", "Position")}
              <input type="range" min={-1} max={1} step={0.01} value={sec.offset} onChange={(e) => setSec({ offset: Number(e.target.value) })} />
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn sm" onClick={() => setSec({ flip: !sec.flip })}><FlipHorizontal2 size={14} />{t("翻转保留侧", "Flip side")}</button>
              <button className="btn sm" onClick={() => setSec({ offset: 0 })}>{t("居中", "Center")}</button>
            </div>
          </div>
        )}
      </div>
      {sec.enabled && pop !== "section" && (
        <button className="btn sm ghost" onClick={() => setPop("section")}>{axes[sec.axis]}</button>
      )}
      <button className="btn sm" aria-pressed={s.labels} onClick={() => setState({ labels: !s.labels })}><Tag size={15} />{t("标签", "Labels")}</button>
      <span className="sep" />
      <button className="btn icon ghost tooltip-btn" data-tip={t("自动旋转", "Auto-rotate")} aria-label={t("自动旋转", "Auto-rotate")} aria-pressed={s.autoRotate} onClick={() => setState({ autoRotate: !s.autoRotate })}><Rotate3d size={17} /></button>
      <button
        className="btn icon ghost tooltip-btn"
        data-tip={s.dissect !== null ? t("重新取景", "Reframe") : t("重置视角", "Reset view")}
        aria-label={t("重置视角", "Reset view")}
        onClick={() => (s.dissect !== null ? actions.focus(`tooth-${s.dissect}`) : actions.resetCamera())}
      >
        {s.dissect !== null ? <Maximize size={17} /> : <RefreshCcw size={17} />}
      </button>
    </div>
  );
}
