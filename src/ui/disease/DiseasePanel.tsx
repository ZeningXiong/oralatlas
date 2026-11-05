import { ChevronRight, ExternalLink, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CARIES_NOTES, CARIES_NOTES_EN, CARIES_STAGES, cariesAt, type LesionFrame } from "../../disease/caries";
import { REFERENCES } from "../../disease/references";
import { useEngine } from "../../app/services";
import { actions, setState, useStore } from "../../state/store";
import { AiNotice } from "../AiNotice";
import { useT } from "../../i18n";

const FDI = 36;
const SECONDS_PER_STAGE = 4;
const REF_ORDER = Object.keys(REFERENCES);
const refNo = (id: string) => REF_ORDER.indexOf(id) + 1;

/** 计划中的疾病演示（当前仅龋病可用） */
export const PLANNED_DEMOS = [
  { id: "caries", title: "龋病：窝沟龋 → 牙髓炎 → 根尖周炎", titleEn: "Caries: pit-and-fissure caries → pulpitis → apical periodontitis", ready: true },
  { id: "smooth-caries", title: "龋病：邻面龋与根面龋", titleEn: "Caries: proximal and root caries", ready: false },
  { id: "pulp-periapical", title: "牙髓病与根尖周病：急性根尖周脓肿与窦道形成", titleEn: "Pulpal and periapical disease: acute apical abscess and sinus tract", ready: false },
  { id: "gingivitis", title: "牙龈炎：菌斑堆积与可逆的牙龈炎症", titleEn: "Gingivitis: plaque accumulation and reversible gingival inflammation", ready: false },
  { id: "periodontitis", title: "牙周炎：附着丧失与牙槽骨吸收（2017 分期 I–IV）", titleEn: "Periodontitis: attachment loss and alveolar bone loss (2017 Stages I–IV)", ready: false },
  { id: "tooth-wear", title: "非龋性硬组织疾病：磨耗、酸蚀与楔状缺损", titleEn: "Non-carious tooth wear: attrition, erosion and cervical (wedge-shaped) lesions", ready: false },
  { id: "third-molar", title: "下颌第三磨牙阻生与冠周炎", titleEn: "Impacted mandibular third molar and pericoronitis", ready: false },
];

/** 阶段序号 ≤ 此值时镜头聚焦牙冠（0–5：健康 → ICDAS 5） */
const CROWN_STAGES = 5;

export function DiseasePanel() {
  const engine = useEngine();
  const t = useT();
  const [frame, setFrame] = useState<{ f: LesionFrame; apex: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stage, setStage] = useState(0);
  const [sectionOn, setSectionOn] = useState(true);
  const [bacteria, setBacteria] = useState(true);
  const [showCredits, setShowCredits] = useState(false);
  const tRef = useRef(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const dissect = useStore((s) => s.dissectFdi);

  const n = CARIES_STAGES.length;
  const duration = SECONDS_PER_STAGE * (n - 1);

  // 进入：单牙解剖 36，加载并测量，开启穿过病损的剖面
  useEffect(() => {
    if (!engine) return;
    let alive = true;
    actions.applyScene({ focusTooth: FDI, layers: ["enamel", "dentin", "cementum", "pulp", "canals"] });
    setState({ selected: null, labels: false });
    void engine.startLesion(FDI).then((r) => {
      if (!alive) return;
      setFrame({ f: r.frame, apex: r.apexDist });
      engine.setLesion(cariesAt(0, r.frame, r.apexDist).params);
      setState({ section: { enabled: true, axis: "sagittal", offset: engine.lesionSectionOffset(), flip: true } });
    });
    return () => {
      alive = false;
      engine.stopLesion();
      actions.resetAll();
    };
  }, [engine]);

  // 用户退出了单牙解剖 → 回到默认
  useEffect(() => {
    if (frame && dissect === null) setPlaying(false);
  }, [dissect, frame]);

  const apply = (t: number) => {
    if (!engine || !frame) return;
    tRef.current = t;
    const r = cariesAt(t, frame.f, frame.apex);
    engine.setLesion(r.params);
    setStage((s) => (s === r.stage ? s : r.stage));
    if (sliderRef.current) sliderRef.current.value = String(t);
    if (pctRef.current) pctRef.current.textContent = `${Math.round(t * 100)}%`;
  };

  // 播放循环：只更新引擎与进度条 DOM，阶段变化时才触发 React 渲染
  useEffect(() => {
    if (!playing || !frame) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = tRef.current + (dt * speed) / duration;
      if (t >= 1) {
        apply(1);
        setPlaying(false);
        return;
      }
      apply(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, frame, speed]);

  useEffect(() => {
    if (!engine || !frame) return;
    setState({ section: { enabled: sectionOn, axis: "sagittal", offset: engine.lesionSectionOffset(), flip: true } });
    const id = setTimeout(() => engine.frameLesion(focus), 950);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionOn, engine, frame]);

  // 前几个阶段病损局限于牙冠，镜头拉近牙冠；进入牙髓/根尖阶段后退远看整牙
  const focus: "crown" | "tooth" = stage <= CROWN_STAGES ? "crown" : "tooth";
  const firstFocus = useRef(true);
  useEffect(() => {
    if (!engine || !frame) return;
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    engine.frameLesion(focus);
  }, [focus, engine, frame]);

  useEffect(() => engine?.setLesionBacteria(bacteria), [bacteria, engine]);

  const jump = (i: number) => {
    setPlaying(false);
    apply(i / (n - 1));
  };
  const cur = CARIES_STAGES[stage];

  return (
    <>
      <div className="panel-head" style={{ display: "block" }}>
        <div className="eyebrow">{t("病变演示", "Disease demo")}</div>
        <h2 className="panel-title" style={{ fontSize: 18, margin: "2px 0 8px" }}>{t("龋病的发生与发展", "Development and progression of dental caries")}</h2>
        <select className="input" value="caries" onChange={() => undefined} aria-label={t("选择演示", "Choose a demo")}>
          {PLANNED_DEMOS.map((d) => (
            <option key={d.id} value={d.id} disabled={!d.ready}>
              {t(d.title, d.titleEn)}
              {d.ready ? "" : t("（计划中）", " (planned)")}
            </option>
          ))}
        </select>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{t("示例牙：下颌左侧第一磨牙（FDI 36）咬合面中央窝", "Example tooth: mandibular left first molar (FDI 36), central fossa of the occlusal surface")}</div>
      </div>
      <div className="scroll sidebar-body disease">
        {/* 播放控制 */}
        <div className="disease-controls">
          <button className="btn primary" onClick={() => (tRef.current >= 1 ? (apply(0), setPlaying(true)) : setPlaying(!playing))} disabled={!frame}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? t("暂停", "Pause") : tRef.current >= 1 ? t("重播", "Replay") : t("播放", "Play")}
          </button>
          <button className="btn" onClick={() => jump(Math.min(stage + 1, n - 1))} disabled={!frame}><SkipForward size={15} />{t("单步", "Step")}</button>
          <button className="btn" onClick={() => jump(0)} disabled={!frame}><RotateCcw size={15} />{t("复位", "Reset")}</button>
        </div>
        <label className="disease-progress">
          <span className="muted">{t("进度", "Progress")}</span>
          <input ref={sliderRef} type="range" min={0} max={1} step={0.001} defaultValue={0} onChange={(e) => { setPlaying(false); apply(Number(e.target.value)); }} disabled={!frame} />
          <span ref={pctRef} className="mono">0%</span>
        </label>
        <div className="disease-options">
          <div className="seg">
            {[0.5, 1, 2].map((v) => <button key={v} aria-pressed={speed === v} onClick={() => setSpeed(v)}>{v}×</button>)}
          </div>
          <button className="btn sm" aria-pressed={sectionOn} onClick={() => setSectionOn(!sectionOn)}>{t("剖面观察", "Section view")}</button>
          <button className="btn sm" aria-pressed={bacteria} onClick={() => setBacteria(!bacteria)}><span className="dot-violet" />{t("细菌示意", "Bacteria (schematic)")}</button>
        </div>

        {/* 当前阶段 */}
        <div className="stage-card">
          <div className="stage-head">
            <span className="mono stage-no">{String(stage).padStart(2, "0")}</span>
            <div>
              <b>{t(cur.title, cur.titleEn)}</b>
              <div className="chip accent" style={{ marginTop: 4 }}>{t(cur.code, cur.codeEn)}</div>
            </div>
          </div>
          <p>{t(cur.body, cur.bodyEn)}</p>
          <div className="refs-inline">
            {t("依据：", "Based on: ")}
            {cur.refs.map((r) => (
              <a key={r} href={`https://doi.org/${REFERENCES[r].doi}`} target="_blank" rel="noreferrer" title={REFERENCES[r].citation}>
                [{refNo(r)}] {REFERENCES[r].citation.split(".")[0].replace(/,.*$/, "")} {REFERENCES[r].citation.match(/\d{4}/)?.[0]}
              </a>
            ))}
          </div>
          {stage <= 3 && <StephanChart />}
        </div>

        {/* 阶段列表 */}
        <ol className="stage-list">
          {CARIES_STAGES.map((s, i) => (
            <li key={s.id} className={i === stage ? "active" : i < stage ? "done" : ""}>
              <button onClick={() => jump(i)}>
                <span className="mono">{String(i).padStart(2, "0")}</span>
                <span>{t(s.title, s.titleEn)}</span>
                <small>{t(s.code, s.codeEn)}</small>
              </button>
            </li>
          ))}
        </ol>

        {/* 动画依据 */}
        <button className="btn sm ghost credits-toggle" onClick={() => setShowCredits(!showCredits)}>
          <ChevronRight size={14} style={{ transform: showCredits ? "rotate(90deg)" : undefined, transition: "transform .2s" }} />
          {t(`动画依据与说明（${REF_ORDER.length} 篇文献）`, `Sources and notes for the animation (${REF_ORDER.length} references)`)}
        </button>
        {showCredits && <DiseaseCredits />}
        <AiNotice />
      </div>
    </>
  );
}

/** 菌斑 pH 变化示意（Stephan 曲线的形态，非原文数据点） */
function StephanChart() {
  const t = useT();
  const W = 300, H = 110, x0 = 30, y0 = 10, w = 260, h = 78;
  const ph = (t: number) => 6.8 - 1.9 * (t < 3 ? t / 3 : Math.exp(-(t - 3) / 12)); // 0–60 分钟
  const xs = (t: number) => x0 + (t / 60) * w;
  const ys = (p: number) => y0 + ((7.2 - p) / (7.2 - 4.4)) * h;
  const d = Array.from({ length: 61 }, (_, t) => `${t ? "L" : "M"}${xs(t).toFixed(1)} ${ys(ph(t)).toFixed(1)}`).join("");
  return (
    <figure className="stephan">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("菌斑 pH 随时间变化示意图", "Schematic of plaque pH over time")}>
        <line x1={x0} y1={ys(5.5)} x2={x0 + w} y2={ys(5.5)} stroke="var(--bad)" strokeDasharray="4 3" />
        <text x={x0 + w} y={ys(5.5) - 4} fontSize={9} textAnchor="end" fill="var(--bad)">{t("临界 pH ≈ 5.5（教材常用值）", "Critical pH ≈ 5.5 (common textbook value)")}</text>
        <path d={`${d}L${xs(60)} ${y0 + h}L${x0} ${y0 + h}Z`} fill="var(--accent-soft)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} />
        <line x1={x0} y1={y0 + h} x2={x0 + w} y2={y0 + h} stroke="var(--line-strong)" />
        <line x1={x0} y1={y0} x2={x0} y2={y0 + h} stroke="var(--line-strong)" />
        {[7, 6, 5].map((p) => <text key={p} x={x0 - 5} y={ys(p) + 3} fontSize={9} textAnchor="end" fill="var(--muted)">{p}</text>)}
        {[0, 20, 40, 60].map((t) => <text key={t} x={xs(t)} y={H - 6} fontSize={9} textAnchor="middle" fill="var(--muted)">{t}</text>)}
        <text x={x0 + 4} y={y0 + h - 4} fontSize={9} fill="var(--muted)">{t("进食糖后（分钟）", "Minutes after sugar intake")}</text>
      </svg>
      <figcaption>
        {t(
          `菌斑 pH 在进食糖后数分钟内降到临界值以下（脱矿），随后在唾液缓冲下缓慢回升（再矿化）。曲线为示意形态，参照 Stephan（1944）[${refNo("Stephan1944")}] 与 Featherstone（2008）[${refNo("Featherstone2008")}]。`,
          `Within minutes of sugar intake, plaque pH drops below the critical value (demineralization), then slowly recovers with salivary buffering (remineralization). Schematic curve, after Stephan (1944) [${refNo("Stephan1944")}] and Featherstone (2008) [${refNo("Featherstone2008")}].`,
        )}
      </figcaption>
    </figure>
  );
}

/** 类似 CREDITS.md 的“动画依据”：每篇文献支持什么、哪些内容是示意 */
export function DiseaseCredits() {
  const t = useT();
  return (
    <div className="disease-credits prose">
      <h4>{t("参考文献（均已通过 Crossref 核对 DOI）", "References (all DOIs checked via Crossref)")}</h4>
      <ol>
        {REF_ORDER.map((id) => {
          const r = REFERENCES[id];
          return (
            <li key={id}>
              {r.citation}{" "}
              {r.doi && (
                <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                  doi:{r.doi} <ExternalLink size={10} />
                </a>
              )}
              <div className="muted" style={{ fontSize: 12 }}>{t("用于：", "Used for: ")}{t(r.usedFor, r.usedForEn)}</div>
            </li>
          );
        })}
      </ol>
      <h4>{t("示意与简化", "Schematic elements and simplifications")}</h4>
      <ul>{CARIES_NOTES.map((n, i) => <li key={i}>{t(n, CARIES_NOTES_EN[i])}</li>)}</ul>
      <h4>{t("三维数据", "3D data")}</h4>
      <p>
        {t(
          "牙齿外形与内部分层来自 Dental Scope 处理的 BodyParts3D 模型（© DBCLS，CC BY-SA 2.1 JP）。病损在浏览器中以着色器叠加在原有模型上，未修改模型文件。",
          "Tooth shape and internal layers come from BodyParts3D models (© DBCLS, CC BY-SA 2.1 JP) as processed by Dental Scope. The lesion is overlaid on the original models with shaders in the browser; the model files are not modified.",
        )}
      </p>
    </div>
  );
}
