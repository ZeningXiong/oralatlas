import { Crosshair, EyeOff, Focus, Ghost, LogIn, LogOut, ScanSearch, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  CATEGORY_BY_ID,
  baseIdOf,
  categoryOf,
  describe,
  describeLandmark,
  sideOfKey,
  type Provenance,
} from "../anatomy/registry";
import { guideKeyOf, toothNameEn, toothNameZh, toPalmer, toUniversal, typeOf, archOf } from "../anatomy/notation";
import { TOOTH_GUIDES } from "../content/teeth";
import { ROOT_LABELS } from "../content/toothParts";
import { PROVENANCE_ZH, STRUCTURES } from "../content/structures";
import { useEngine } from "../app/services";
import { actions, useStore, setState } from "../state/store";
import { PROV_COLOR } from "./explore/StructureTree";
import { AiNotice } from "./AiNotice";
import { ZhOnlyNote } from "./ZhOnlyNote";
import { altNameOf, nameOf, useLang, useT, type T } from "../i18n";

const TYPE_GROUP: Record<string, [string, string]> = {
  "central-incisor": ["切牙", "Incisor"],
  "lateral-incisor": ["切牙", "Incisor"],
  canine: ["尖牙", "Canine"],
  "first-premolar": ["前磨牙", "Premolar"],
  "second-premolar": ["前磨牙", "Premolar"],
  "first-molar": ["磨牙", "Molar"],
  "second-molar": ["磨牙", "Molar"],
  "third-molar": ["磨牙", "Molar"],
};

/** 模型几何来源的英文说明（中文见 content/structures 的 PROVENANCE_ZH） */
const PROVENANCE_EN: Record<Provenance, { label: string; description: string }> = {
  source: { label: "Source data", description: "Real anatomical geometry from BodyParts3D; only transformed and simplified." },
  derived: {
    label: "Derived",
    description: "Cut from or approximated on the source geometry (e.g. alveolar bone, condyle, glenoid fossa, third molars).",
  },
  modeled: {
    label: "Modeled",
    description:
      "Internal tooth structures were generated inside the real tooth outline with simplified, approximate proportions (not measured); the maxillary sinus was hollowed out of the maxilla with an approximate wall thickness.",
  },
  atlas: {
    label: "Atlas",
    description:
      "Nerve and vessel centerlines come from the Z-Anatomy atlas (CC BY-SA 4.0), registered to this model's jaws: they show the anatomical course, not measurements of this individual.",
  },
  schematic: {
    label: "Schematic",
    description:
      "Teaching paths and markers placed to show relationships between structures: superior alveolar nerves, palatine nerves (greater palatine, nasopalatine), ophthalmic nerve (V1), facial/glossopharyngeal/vagus/hypoglossal nerves (VII/IX/X/XII), mandibular canal envelope, inferior alveolar vein, pterygoid venous plexus and articular disc.",
  },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function List({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="prose">
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  );
}

function ProvenanceNote({ p }: { p?: Provenance }) {
  const t = useT();
  const lang = useLang();
  if (!p) return null;
  const info = lang === "en" ? PROVENANCE_EN[p] : PROVENANCE_ZH[p];
  return (
    <div className="prov">
      <span className="prov-dot" style={{ background: PROV_COLOR[p], marginTop: 6 }} />
      <span>
        <b>{t("模型几何：", "Model geometry: ")}{info?.label ?? p}</b>
        <br />
        {info?.description}
      </span>
    </div>
  );
}

export function DetailPanel() {
  const selected = useStore((s) => s.selected);
  const dissect = useStore((s) => s.dissectFdi);
  const engine = useEngine();
  const t = useT();
  const key = selected ?? (dissect !== null ? `tooth-${dissect}` : null);
  if (!key || !engine?.manifest) return null;

  const close = () => setState({ selected: null });
  const isLandmark = Boolean(engine.manifest.landmarks[key]);
  let body: ReactNode;
  if (isLandmark) body = <LandmarkView k={key} onClose={close} />;
  else if (/-\d\d$/.test(key)) body = <ToothView k={key} onClose={close} />;
  else body = <StructureView k={key} onClose={close} />;
  return (
    <aside className="panel detail" aria-label={t("结构详情", "Structure details")} key={key}>
      {body}
    </aside>
  );
}

// ---------------------------------------------------------------- 牙齿

function ToothView({ k, onClose }: { k: string; onClose: () => void }) {
  const engine = useEngine()!;
  const numbering = useStore((s) => s.numbering);
  const dissect = useStore((s) => s.dissectFdi);
  const ghosted = useStore((s) => s.ghosted);
  const fdi = Number(k.slice(-2));
  const toothKey = `tooth-${fdi}`;
  const guide = TOOTH_GUIDES[guideKeyOf(fdi)];
  const tooth = engine.manifest.teeth[String(fdi)];
  const layer = k.startsWith("tooth-") ? null : describe(k);
  const inDissect = dissect === fdi;
  const canals = tooth.roots.reduce((a, r) => a + r.canals.length, 0);
  const t = useT();
  const lang = useLang();
  const en = lang === "en";

  return (
    <>
      <div className="detail-head">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="chip accent">{t("恒牙", "Permanent")} · {t(...TYPE_GROUP[typeOf(fdi)])}</span>
          <span className="chip">{archOf(fdi) === "maxillary" ? t("上颌", "Maxillary") : t("下颌", "Mandibular")}</span>
          {!en && guide?.aliasZh?.map((a) => <span className="chip warn" key={a}>{a}</span>)}
        </div>
        <h2>{en ? toothNameEn(fdi) : toothNameZh(fdi)}</h2>
        <div className="en">{en ? toothNameZh(fdi) : toothNameEn(fdi)}</div>
        <button className="btn icon ghost detail-close" onClick={onClose} aria-label={t("关闭", "Close")}><X size={18} /></button>
        <div className="numbers">
          <div className={numbering === "fdi" ? "current" : ""}><small>FDI</small><b>{fdi}</b></div>
          <div className={numbering === "uni" ? "current" : ""}><small>{t("通用编号", "Universal")}</small><b>#{toUniversal(fdi)}</b></div>
          <div className={numbering === "pal" ? "current" : ""}><small>Palmer</small><b>{toPalmer(fdi)}</b></div>
        </div>
        <div className="actions">
          {inDissect ? (
            <button className="btn sm primary" onClick={() => actions.exitDissect()}><LogOut size={14} />{t("返回全口", "Back to full mouth")}</button>
          ) : (
            <button className="btn sm primary" onClick={() => actions.enterDissect(fdi)}><LogIn size={14} />{t("单牙解剖", "Dissect tooth")}</button>
          )}
          <button className="btn sm" onClick={() => actions.focus(k)}><Focus size={14} />{t("聚焦", "Focus")}</button>
          {!inDissect && (
            <>
              <button className="btn sm" aria-pressed={ghosted.includes(toothKey)} onClick={() => actions.toggleGhosted(toothKey)}><Ghost size={14} />{t("半透明", "Ghost")}</button>
              <button className="btn sm" onClick={() => { actions.toggleHidden(toothKey); onClose(); }}><EyeOff size={14} />{t("隐藏", "Hide")}</button>
              <button className="btn sm" onClick={() => actions.setIsolate(toothKey)}><Crosshair size={14} />{t("仅显示", "Isolate")}</button>
            </>
          )}
        </div>
      </div>
      <div className="scroll detail-body">
        <ZhOnlyNote compact />
        {layer?.info && (
          <section className="section" style={{ padding: 12, borderRadius: 12, background: "var(--accent-soft)" }}>
            <div className="eyebrow">{t("当前选中的组织", "Selected tissue")}</div>
            <h3 style={{ margin: "4px 0 6px", fontSize: 16 }}>{nameOf(layer.info, lang)} <span className="muted" style={{ fontWeight: 500, fontSize: 12.5 }}>{altNameOf(layer.info, lang)}</span></h3>
            <div className="prose"><p>{layer.info.summary}</p></div>
            <List items={layer.info.details} />
            {layer.info.clinical?.length ? (<><div className="eyebrow" style={{ marginTop: 8 }}>{t("临床意义", "Clinical relevance")}</div><List items={layer.info.clinical} /></>) : null}
          </section>
        )}
        {!guide ? (
          <div className="empty-state">{t("该牙型的内容正在编写中。", "Content for this tooth type is being written.")}</div>
        ) : (
          <>
            <Section title={t("概述", "Overview")}>
              <div className="prose"><p>{guide.summary}</p><p><strong>{t("功能：", "Function: ")}</strong>{guide.function}</p></div>
            </Section>
            <Section title={t("牙冠形态", "Crown morphology")}>
              <table className="surface-table">
                <tbody>
                  {guide.crown.map((c) => (
                    <tr key={c.surface}><th>{c.surface}</th><td>{c.text}</td></tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title={t("牙根", "Roots")}>
              <div className="prose"><p><strong>{guide.rootsBrief}</strong></p></div>
              <List items={guide.root} />
            </Section>
            <Section title={t("髓腔与根管", "Pulp cavity & root canals")}>
              <div className="prose"><p><strong>{guide.canalsBrief}</strong></p></div>
              <List items={guide.pulp} />
              <div className="prov" style={{ marginTop: 8 }}>
                <span>
                  <b>{t("本模型中：", "In this model: ")}</b>
                  {modelCanals(tooth.roots, canals, t, en)}
                </span>
              </div>
              {guide.canalStats?.length ? (
                <div style={{ marginTop: 12 }}>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>{t("根管数目分布（文献统计）", "Canal count distribution (published data)")}</div>
                  <div className="bars">
                    {guide.canalStats.map((c) => (
                      <div className="bar-row" key={c.label}>
                        <span>{c.label}</span>
                        <span className="track"><i style={{ width: `${Math.min(c.percent, 100)}%` }} /></span>
                        <b>{c.percent.toFixed(c.percent < 10 ? 1 : 0)}%</b>
                      </div>
                    ))}
                  </div>
                  {guide.canalStatsSource && <div className="source-note">{t("来源：", "Source: ")}{guide.canalStatsSource}</div>}
                </div>
              ) : null}
            </Section>
            <Section title={t("发育时间", "Development chronology")}>
              <div className="timeline">
                <div><i /><b>{guide.development.calcification}</b><span>{t("开始钙化", "Calcification begins")}</span></div>
                <div><i /><b>{guide.development.crownComplete}</b><span>{t("牙冠完成", "Crown completed")}</span></div>
                <div><i /><b>{guide.development.eruption}</b><span>{t("萌出", "Eruption")}</span></div>
                <div><i /><b>{guide.development.rootComplete}</b><span>{t("牙根完成", "Root completed")}</span></div>
              </div>
            </Section>
            {guide.dimensions && Object.keys(guide.dimensions).length > 0 && (
              <Section title={t("平均测量值（mm）", "Average dimensions (mm)")}>
                <dl className="kv">
                  {guide.dimensions.crownLength !== undefined && (<><dt>{t("冠长", "Crown length")}</dt><dd>{guide.dimensions.crownLength}</dd></>)}
                  {guide.dimensions.rootLength !== undefined && (<><dt>{t("根长", "Root length")}</dt><dd>{guide.dimensions.rootLength}</dd></>)}
                  {guide.dimensions.crownMD !== undefined && (<><dt>{t("冠近远中径", "Crown MD")}</dt><dd>{guide.dimensions.crownMD}</dd></>)}
                  {guide.dimensions.crownLabioLingual !== undefined && (<><dt>{t("冠唇（颊）舌径", "Crown labio/bucco-lingual")}</dt><dd>{guide.dimensions.crownLabioLingual}</dd></>)}
                  {guide.dimensions.cervicalMD !== undefined && (<><dt>{t("颈部近远中径", "Cervical MD")}</dt><dd>{guide.dimensions.cervicalMD}</dd></>)}
                  {guide.dimensions.cervicalLabioLingual !== undefined && (<><dt>{t("颈部唇（颊）舌径", "Cervical labio/bucco-lingual")}</dt><dd>{guide.dimensions.cervicalLabioLingual}</dd></>)}
                </dl>
                <div className="source-note">{t("参考值，个体差异较大；数值尚待对照教材核对。", "Reference values; individual variation is large. Not yet checked against textbooks.")}</div>
              </Section>
            )}
            <Section title={t("鉴别要点", "Identification")}><List items={guide.identification} /></Section>
            <Section title={t("临床意义", "Clinical relevance")}><List items={guide.clinical} /></Section>
            {guide.variations?.length ? <Section title={t("常见变异", "Common variations")}><List items={guide.variations} /></Section> : null}
          </>
        )}
        <Section title={t("关于此内容", "About this content")}><AiNotice /></Section>
        <Section title={t("关于此模型", "About this model")}>
          <ProvenanceNote p={layer ? engine.manifest.meshes[k]?.provenance : tooth.provenance} />
          {!layer && (
            <div className="source-note">
              {t("外形源自 BodyParts3D（", "Outline from BodyParts3D (")}
              {engine.manifest.meshes[toothKey]?.sourceRef ?? t("第三磨牙由第二磨牙派生", "third molar derived from the second molar")}
              {t("），牙冠细部按牙型做了示意性修整。", "); crown details were schematically refined per tooth type.")}
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- 结构

function StructureView({ k, onClose }: { k: string; onClose: () => void }) {
  const engine = useEngine()!;
  const ghosted = useStore((s) => s.ghosted);
  const d = describe(k);
  const info = d.info;
  const cat = CATEGORY_BY_ID[d.category];
  const side = sideOfKey(k);
  const other = side ? k.replace(/-(left|right)$/, side === "left" ? "-right" : "-left") : null;
  const hasOther = other && engine.manifest.meshes[other];
  const prov = engine.manifest.meshes[k]?.provenance;
  const t = useT();
  const lang = useLang();

  const relatedKey = (base: string) => {
    const cands = Object.keys(engine.manifest.meshes).filter((m) => baseIdOf(m) === base && !/-\d\d$/.test(m));
    if (!cands.length) return Object.keys(engine.manifest.landmarks).find((l) => l.replace(/-(left|right)$/, "") === base) ?? null;
    return cands.find((c) => side && c.endsWith(`-${side}`)) ?? cands.find((c) => c.endsWith("-right")) ?? cands[0];
  };

  return (
    <>
      <div className="detail-head">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span className="chip accent"><span className="dot" style={{ background: cat.color }} />{lang === "en" ? cat.labelEn : cat.label}</span>
          {side && <span className="chip">{side === "left" ? t("左侧", "Left") : t("右侧", "Right")}</span>}
        </div>
        <h2>{nameOf(d, lang)}</h2>
        <div className="en">{lang === "en" ? d.nameZh : info?.nameEn ?? d.nameEn}</div>
        {info?.nameLatin && <div className="latin">{info.nameLatin}</div>}
        <button className="btn icon ghost detail-close" onClick={onClose} aria-label={t("关闭", "Close")}><X size={18} /></button>
        <div className="actions">
          <button className="btn sm" onClick={() => actions.focus(k)}><Focus size={14} />{t("聚焦", "Focus")}</button>
          <button className="btn sm" aria-pressed={ghosted.includes(k)} onClick={() => actions.toggleGhosted(k)}><Ghost size={14} />{t("半透明", "Ghost")}</button>
          <button className="btn sm" onClick={() => { actions.toggleHidden(k); onClose(); }}><EyeOff size={14} />{t("隐藏", "Hide")}</button>
          <button className="btn sm" onClick={() => actions.setIsolate(k)}><Crosshair size={14} />{t("仅显示", "Isolate")}</button>
          {hasOther && (
            <button className="btn sm" onClick={() => actions.reveal(other!, categoryOf(other!))}><ScanSearch size={14} />{t("对侧", "Other side")}</button>
          )}
        </div>
      </div>
      <div className="scroll detail-body">
        {!info ? (
          <div className="empty-state">{t("该结构的释义正在编写中。", "A description of this structure is being written.")}</div>
        ) : (
          <>
            <ZhOnlyNote compact />
            <Section title={t("定义", "Definition")}><div className="prose"><p>{info.summary}</p></div></Section>
            <Section title={t("解剖要点", "Key anatomy")}><List items={info.details} /></Section>
            {info.clinical?.length ? <Section title={t("临床意义", "Clinical relevance")}><List items={info.clinical} /></Section> : null}
            {info.related?.length ? (
              <Section title={t("相关结构", "Related structures")}>
                <div className="related">
                  {info.related.map((r) => {
                    const rk = relatedKey(r);
                    const st = STRUCTURES[r] ?? describeLandmark(rk ?? "");
                    const name = st ? nameOf(st, lang) : r;
                    return rk ? (
                      <button key={r} className="chip" onClick={() => actions.reveal(rk, engine.manifest.landmarks[rk] ? null : categoryOf(rk))}>{name}</button>
                    ) : (
                      <span key={r} className="chip">{name}</span>
                    );
                  })}
                </div>
              </Section>
            ) : null}
          </>
        )}
        <Section title={t("关于此内容", "About this content")}><AiNotice /></Section>
        <Section title={t("关于此模型", "About this model")}>
          <ProvenanceNote p={prov} />
          {engine.manifest.meshes[k]?.sourceRef && (
            <div className="source-note">{t("BodyParts3D 源网格：", "BodyParts3D source mesh: ")}{engine.manifest.meshes[k].sourceRef}</div>
          )}
        </Section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- 标志点

function LandmarkView({ k, onClose }: { k: string; onClose: () => void }) {
  const d = describeLandmark(k);
  const t = useT();
  const lang = useLang();
  return (
    <>
      <div className="detail-head">
        <span className="chip accent">{t("骨性标志", "Landmark")}</span>
        <h2>{d ? nameOf(d, lang) : k}</h2>
        <div className="en">{altNameOf(d, lang)}</div>
        <button className="btn icon ghost detail-close" onClick={onClose} aria-label={t("关闭", "Close")}><X size={18} /></button>
        <div className="actions">
          <button className="btn sm" onClick={() => actions.focus(k)}><Focus size={14} />{t("聚焦", "Focus")}</button>
        </div>
      </div>
      <div className="scroll detail-body">
        <ZhOnlyNote compact />
        <Section title={t("说明", "Description")}><div className="prose"><p>{d?.description}</p></div></Section>
        {d?.clinical && <Section title={t("临床意义", "Clinical relevance")}><div className="prose"><p>{d.clinical}</p></div></Section>}
        <Section title={t("关于此内容", "About this content")}><AiNotice /></Section>
        <Section title={t("关于此模型", "About this model")}>
          <ProvenanceNote p="schematic" />
          <div className="source-note">{t("标志点位置由模型几何与图谱路径计算得出，用于教学定位。", "Landmark positions are computed from the model geometry and atlas paths, for teaching orientation.")}</div>
        </Section>
      </div>
    </>
  );
}

/** “本模型中：…共 N 个根管”的一句话说明 */
function modelCanals(roots: { label: string; canals: unknown[] }[], total: number, t: T, en: boolean): string {
  const parts = roots.map((r) => {
    const lab = ROOT_LABELS[r.label];
    const name = (en ? lab?.nameEn : lab?.nameZh) ?? r.label;
    return en ? `${name} (${r.canals.length} canal${r.canals.length === 1 ? "" : "s"})` : `${name}（${r.canals.length} 根管）`;
  });
  return (
    parts.join(en ? ", " : "、") +
    t(`，共 ${total} 个根管。`, `; ${total} canals in total. `) +
    t("模型按教科书最常见的形态构建，真实个体存在变异。", "The model follows the most common textbook form; real teeth vary.")
  );
}
