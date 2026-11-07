// 病历面板：按 ICDAS 0–6 逐牙面记录龋病，并与三维模型联动；可保存（本机浏览器）与导出。
import { ClipboardList, Copy, Download, Eye, FilePlus2, FileText, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEngine } from "../../app/services";
import { formatTooth, toothNameEn, toothNameZh } from "../../anatomy/notation";
import { cariesAt } from "../../disease/caries";
import { REFERENCES } from "../../disease/references";
import { actions, setState, useStore } from "../../state/store";
import { useLang, useT } from "../../i18n";
import { AiNotice } from "../AiNotice";
import {
  ICDAS,
  chart,
  hexToRgb,
  isAnterior,
  normalizeRecord,
  summarize,
  surfaceLetter,
  surfaceName,
  surfacesOf,
  useChart,
  worstCode,
  type Activity,
  type IcdasCode,
  type PatientRecord,
  type Surface,
} from "../../chart/record";
import { baseName, exportCsv, exportHtml, exportJson, glyphRegions, parseImport } from "../../chart/export";

const Q = (q: number, reverse: boolean) => {
  const a = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => q * 10 + i);
  return reverse ? a.reverse() : a;
};
const UPPER = [...Q(1, true), ...Q(2, false)];
const LOWER = [...Q(4, true), ...Q(3, false)];
const fdiOfKey = (key: string): number | null => {
  const m = key.match(/(?:^|-)([1-4][1-8])$/);
  return m ? Number(m[1]) : null;
};

/** 正在三维中查看的病损 */
interface Viewing {
  fdi: number;
  surface: Surface;
  code: IcdasCode;
}

export function ChartPanel() {
  const t = useT();
  const lang = useLang();
  const engine = useEngine();
  const records = useChart((s) => s.records);
  const activeId = useChart((s) => s.activeId);
  const tooth = useChart((s) => s.tooth);
  const surface = useChart((s) => s.surface);
  const savedAt = useChart((s) => s.savedAt);
  const record = records.find((r) => r.id === activeId) ?? null;
  const numbering = useStore((s) => s.numbering);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // 首次进入：没有病历时自动新建一份
  useEffect(() => {
    if (!useChart.getState().records.length) chart.create();
  }, []);

  // 进入病历模式：回到全口视图；在三维中点牙 → 选中该牙
  useEffect(() => {
    actions.resetAll();
    setState({
      labels: false,
      pickInterceptor: (key: string) => {
        const fdi = fdiOfKey(key);
        if (fdi) chart.select(fdi, null);
      },
    });
    return () => {
      engine?.stopLesion();
      engine?.setToothMarks(null);
      setState({ pickInterceptor: null, selected: null });
    };
  }, [engine]);

  // 三维着色：按每颗牙的最高 ICDAS 分
  useEffect(() => {
    if (!engine || viewing) return;
    const marks = new Map<number, [number, number, number]>();
    for (const [k, e] of Object.entries(record?.teeth ?? {})) {
      const w = worstCode(e);
      if (w !== null && w > 0) marks.set(Number(k), hexToRgb(ICDAS[w].color));
    }
    engine.setToothMarks(marks);
  }, [engine, record, viewing]);

  // 选中的牙在三维中高亮并取景
  useEffect(() => {
    if (viewing) return;
    setState({ selected: tooth ? `tooth-${tooth}` : null });
    if (tooth) actions.focus(`tooth-${tooth}`);
  }, [tooth, viewing]);

  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(id);
  }, [msg]);

  /** 在三维中查看某牙面的病损：单牙解剖 + 按 ICDAS 编码生成病损 + 剖面穿过病损 */
  const view3d = async (fdi: number, s: Surface, code: IcdasCode) => {
    if (!engine) return;
    setViewing({ fdi, surface: s, code });
    engine.setToothMarks(null);
    actions.applyScene({ focusTooth: fdi, layers: ["enamel", "dentin", "cementum", "pulp", "canals"] });
    setState({ selected: null, labels: false });
    const r = await engine.startLesion(fdi, s);
    // ICDAS 0–6 对应病变演示中的前 7 个阶段（共 10 个阶段）；病历只表现硬组织病损，不叠加牙髓/根尖周改变
    const p = cariesAt(code / 9, r.frame, r.apexDist).params;
    engine.setLesion({ ...p, pulpInflam: 0, pulpNecrosis: 0, periapical: 0, bacteria: 0 });
    engine.setLesionBacteria(false);
    const sec = engine.lesionSection();
    setState({ section: { enabled: true, axis: sec.axis, offset: sec.offset, flip: true } });
    setTimeout(() => engine.frameLesion("crown"), 950);
  };
  const back = () => {
    engine?.stopLesion();
    setViewing(null);
    actions.resetAll();
    setState({ labels: false });
    if (tooth) setTimeout(() => actions.focus(`tooth-${tooth}`), 50);
  };

  const onImport = async (file: File) => {
    try {
      const list = parseImport(await file.text()).map(normalizeRecord).filter(Boolean) as PatientRecord[];
      if (!list.length) throw new Error("empty");
      const n = chart.importRecords(list);
      setMsg(t(`已导入 ${n} 份病历`, `Imported ${n} record(s)`));
    } catch {
      setMsg(t("无法识别该文件，请选择本站导出的 JSON 文件", "Unrecognized file — choose a JSON file exported from this site"));
    }
  };

  const sum = useMemo(() => (record ? summarize(record) : null), [record]);
  const label = (r: PatientRecord) =>
    `${r.patient.name || t("未命名", "Untitled")}${r.patient.recordNo ? ` · ${r.patient.recordNo}` : ""} · ${r.patient.examDate || r.createdAt.slice(0, 10)}`;

  if (!record) return null;
  const p = record.patient;
  const entry = tooth ? record.teeth[tooth] : undefined;
  const ref = REFERENCES.ICDAS;

  return (
    <>
      <div className="panel-head" style={{ display: "block" }}>
        <div className="eyebrow">{t("病历 · 龋病检查（ICDAS）", "Chart · Caries exam (ICDAS)")}</div>
        <div className="chart-records">
          <select className="input" value={record.id} onChange={(e) => chart.open(e.target.value)} aria-label={t("选择病历", "Choose record")}>
            {records.map((r) => (
              <option key={r.id} value={r.id}>{label(r)}</option>
            ))}
          </select>
          <button className="btn icon" title={t("新建病历", "New record")} aria-label={t("新建病历", "New record")} onClick={() => { chart.create(); setInfoOpen(true); }}><FilePlus2 size={16} /></button>
          <button className="btn icon" title={t("复制为新一次检查", "Duplicate as a new exam")} aria-label={t("复制病历", "Duplicate record")} onClick={() => chart.duplicate(record.id)}><Copy size={16} /></button>
          <button
            className="btn icon"
            title={t("删除病历", "Delete record")}
            aria-label={t("删除病历", "Delete record")}
            onClick={() => {
              if (confirm(t(`确定删除“${label(record)}”？此操作无法撤销。`, `Delete “${label(record)}”? This cannot be undone.`))) {
                chart.remove(record.id);
                if (useChart.getState().records.length === 0) chart.create();
              }
            }}
          ><Trash2 size={16} /></button>
        </div>
        <div className="muted chart-saved">
          {savedAt ? t("已自动保存到本机浏览器", "Auto-saved in this browser") : t("修改会自动保存到本机浏览器", "Changes are saved automatically in this browser")}
          {msg && <span className="chart-msg"> · {msg}</span>}
        </div>
      </div>

      <div className="scroll sidebar-body chart-body">
        {viewing && (
          <div className="chart-viewing">
            <Eye size={15} />
            <span>
              {t("三维查看：", "3D view: ")}
              <b>{formatTooth(viewing.fdi, numbering)} {surfaceName(viewing.fdi, viewing.surface, lang)}</b> · ICDAS {viewing.code}
            </span>
            <button className="btn sm" onClick={back}><X size={14} />{t("返回全口", "Back to full mouth")}</button>
          </div>
        )}

        {/* 基本信息 */}
        <details className="chart-section" open={infoOpen} onToggle={(e) => setInfoOpen((e.target as HTMLDetailsElement).open)}>
          <summary>{t("基本信息", "Patient information")}</summary>
          <div className="chart-form">
            <label>{t("姓名", "Name")}<input className="input" value={p.name} onChange={(e) => chart.setPatient({ name: e.target.value })} /></label>
            <label>{t("病历号", "Record no.")}<input className="input" value={p.recordNo} onChange={(e) => chart.setPatient({ recordNo: e.target.value })} /></label>
            <label>{t("性别", "Sex")}
              <select className="input" value={p.sex} onChange={(e) => chart.setPatient({ sex: e.target.value as typeof p.sex })}>
                <option value="">—</option>
                <option value="male">{t("男", "Male")}</option>
                <option value="female">{t("女", "Female")}</option>
                <option value="other">{t("其他", "Other")}</option>
              </select>
            </label>
            <label>{t("出生日期", "Date of birth")}<input className="input" type="date" value={p.birthDate} onChange={(e) => chart.setPatient({ birthDate: e.target.value })} /></label>
            <label>{t("检查日期", "Exam date")}<input className="input" type="date" value={p.examDate} onChange={(e) => chart.setPatient({ examDate: e.target.value })} /></label>
            <label>{t("检查者", "Examiner")}<input className="input" value={p.examiner} onChange={(e) => chart.setPatient({ examiner: e.target.value })} /></label>
            <label className="wide">{t("主诉", "Chief complaint")}<input className="input" value={p.chiefComplaint} onChange={(e) => chart.setPatient({ chiefComplaint: e.target.value })} /></label>
            <label className="wide">{t("备注", "Notes")}<textarea className="input" rows={2} value={p.notes} onChange={(e) => chart.setPatient({ notes: e.target.value })} /></label>
          </div>
          <div className="muted chart-privacy">
            {t(
              "教学练习用：数据只保存在本机浏览器，不会上传；请勿录入真实患者的可识别信息。清除浏览器数据会删除记录，重要内容请导出备份。",
              "For teaching and practice: data stays in this browser and is never uploaded. Do not enter identifiable real-patient data. Clearing browser data deletes records — export a backup.",
            )}
          </div>
        </details>

        {/* 牙位图 */}
        <div className="chart-section">
          <div className="chart-h">{t("牙位图", "Odontogram")}<span className="muted">{t("点击牙面记录；也可在三维模型上点牙", "Click a surface to chart it, or click a tooth in 3D")}</span></div>
          <div className="odo">
            <div className="odo-side"><span>{t("右", "R")}</span><span>{t("左", "L")}</span></div>
            {[UPPER, LOWER].map((row, ri) => (
              <div key={ri} className={`odo-row ${ri ? "lower" : "upper"}`}>
                {row.map((fdi, i) => (
                  <ToothGlyph
                    key={fdi}
                    fdi={fdi}
                    record={record}
                    selected={tooth === fdi}
                    surface={tooth === fdi ? surface : null}
                    label={formatTooth(fdi, numbering)}
                    mid={i === 8}
                    onPick={(s) => chart.select(fdi, s)}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="chart-legend">
            {ICDAS.map((c) => (
              <span key={c.code} title={lang === "en" ? c.descEn : c.descZh}><i style={{ background: c.color }} />{c.code}</span>
            ))}
            <span><i style={{ background: "#fff" }} />{t("未记录", "Not charted")}</span>
          </div>
        </div>

        {/* 选中牙的编辑 */}
        {tooth ? (
          <div className="chart-section chart-editor">
            <div className="chart-tooth-head">
              <div>
                <b>{formatTooth(tooth, numbering)} · {lang === "en" ? toothNameEn(tooth) : toothNameZh(tooth)}</b>
                <div className="muted" style={{ fontSize: 12 }}>{lang === "en" ? toothNameZh(tooth) : toothNameEn(tooth)}</div>
              </div>
              <button className="btn sm ghost" onClick={() => chart.select(null)} aria-label={t("关闭", "Close")}><X size={14} /></button>
            </div>
            <div className="chart-tooth-actions">
              <button className="btn sm" onClick={() => chart.setAllSurfaces(tooth, 0)}>{t("全部记为 0（健康）", "All surfaces 0 (sound)")}</button>
              <button className="btn sm ghost" onClick={() => chart.setAllSurfaces(tooth, null)}>{t("清除本牙", "Clear tooth")}</button>
            </div>
            {surfacesOf(tooth).map((s) => {
              const f = entry?.surfaces[s];
              return (
                <div key={s} className={`chart-surface ${surface === s ? "on" : ""}`} onClick={() => chart.select(tooth, s)}>
                  <div className="chart-surface-name">
                    <b>{surfaceLetter(tooth, s)}</b> {surfaceName(tooth, s, lang)}
                  </div>
                  <div className="icdas-seg" role="group" aria-label={`ICDAS · ${surfaceName(tooth, s, lang)}`}>
                    {ICDAS.map((c) => (
                      <button
                        key={c.code}
                        aria-pressed={f?.code === c.code}
                        style={f?.code === c.code ? { background: c.color, borderColor: c.color, color: c.code >= 2 ? "#fff" : "#1f2937" } : undefined}
                        title={`${c.code} · ${lang === "en" ? c.en : c.zh}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          chart.select(tooth, s);
                          chart.setSurface(tooth, s, f?.code === c.code ? null : { ...f, code: c.code });
                        }}
                      >{c.code}</button>
                    ))}
                  </div>
                  {f && (
                    <div className="chart-surface-more" onClick={(e) => e.stopPropagation()}>
                      <div className="muted chart-crit">
                        <b>{lang === "en" ? ICDAS[f.code].en : ICDAS[f.code].zh}</b>：{lang === "en" ? ICDAS[f.code].descEn : ICDAS[f.code].descZh}
                      </div>
                      <div className="chart-surface-row">
                        <div className="seg" role="group" aria-label={t("活跃性", "Activity")}>
                          {([["", "未评估", "N/A"], ["active", "活跃", "Active"], ["arrested", "静止", "Arrested"]] as const).map(([v, zh, en]) => (
                            <button key={v} aria-pressed={(f.activity ?? "") === v} onClick={() => chart.setSurface(tooth, s, { ...f, activity: (v || undefined) as Activity | undefined })}>{t(zh, en)}</button>
                          ))}
                        </div>
                        <button className="btn sm" disabled={!engine} onClick={() => void view3d(tooth, s, f.code)} title={t("在三维中按此编码显示该牙面的病损（示意）", "Show this lesion on the 3D tooth (schematic)")}>
                          <Eye size={14} />{t("三维查看", "View in 3D")}
                        </button>
                      </div>
                      <input className="input" placeholder={t("牙面备注（可选）", "Surface note (optional)")} value={f.note ?? ""} onChange={(e) => chart.setSurface(tooth, s, { ...f, note: e.target.value || undefined })} />
                    </div>
                  )}
                </div>
              );
            })}
            <label className="chart-tooth-note">
              {t("牙齿备注", "Tooth note")}
              <input className="input" value={entry?.note ?? ""} placeholder={t("如：已充填、缺失、需复查…", "e.g. restored, missing, recall…")} onChange={(e) => chart.setToothNote(tooth, e.target.value)} />
            </label>
          </div>
        ) : (
          <div className="chart-section muted chart-hint">{t("在牙位图或三维模型中选择一颗牙开始记录。", "Select a tooth in the odontogram or the 3D model to start charting.")}</div>
        )}

        {/* 汇总 */}
        {sum && (
          <div className="chart-section">
            <div className="chart-h">{t("汇总", "Summary")}</div>
            <div className="chart-sum">
              <div><b>{sum.teeth}</b><span>{t("已记录牙数", "Teeth charted")}</span></div>
              <div><b>{sum.byCode.reduce((a, b) => a + b, 0)}</b><span>{t("已记录牙面", "Surfaces charted")}</span></div>
              <div><b>{sum.cavitated}</b><span>{t("ICDAS ≥ 3 牙面", "Surfaces ICDAS ≥ 3")}</span></div>
            </div>
            <div className="chart-bars">
              {ICDAS.map((c) => {
                const n = sum.byCode[c.code];
                const max = Math.max(1, ...sum.byCode);
                return (
                  <div key={c.code} className="chart-bar" title={lang === "en" ? c.en : c.zh}>
                    <span>{c.code}</span>
                    <i style={{ width: `${(n / max) * 100}%`, background: c.color }} />
                    <em>{n}</em>
                  </div>
                );
              })}
            </div>
            <ul className="chart-list">
              {Object.keys(record.teeth)
                .map(Number)
                .sort((a, b) => a - b)
                .flatMap((fdi) =>
                  surfacesOf(fdi)
                    .filter((s) => (record.teeth[fdi].surfaces[s]?.code ?? 0) > 0)
                    .map((s) => {
                      const c = record.teeth[fdi].surfaces[s]!.code;
                      return (
                        <li key={`${fdi}${s}`}>
                          <button className="link" onClick={() => chart.select(fdi, s)}>
                            <span className="code" style={{ background: ICDAS[c].color }}>{c}</span>
                            {formatTooth(fdi, numbering)} {surfaceLetter(fdi, s)} · {lang === "en" ? ICDAS[c].en : ICDAS[c].zh}
                          </button>
                        </li>
                      );
                    }),
                )}
            </ul>
          </div>
        )}

        {/* 导出 */}
        <div className="chart-section">
          <div className="chart-h">{t("保存与导出", "Save & export")}</div>
          <div className="chart-export">
            <button className="btn" onClick={() => exportHtml(record, lang, numbering, viewing ? undefined : engine?.snapshot())}><FileText size={15} />{t("报告（HTML，可打印为 PDF）", "Report (HTML, printable to PDF)")}</button>
            <button className="btn" onClick={() => exportCsv(record, lang)}><Download size={15} />{t("表格（CSV）", "Spreadsheet (CSV)")}</button>
            <button className="btn" onClick={() => exportJson([record], baseName(record))}><Download size={15} />{t("数据（JSON，可再导入）", "Data (JSON, re-importable)")}</button>
            <button className="btn" onClick={() => exportJson(records, `OralAtlas_all-records_${new Date().toISOString().slice(0, 10)}`)}><Download size={15} />{t(`全部病历备份（${records.length} 份）`, `Back up all records (${records.length})`)}</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={15} />{t("导入 JSON", "Import JSON")}</button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void onImport(f); e.target.value = ""; }} />
          </div>
        </div>

        <div className="chart-section chart-ref">
          <ClipboardList size={14} />
          <span>
            {t("编码依据：", "Codes based on: ")}
            <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer">{ref.citation}</a>
            {t(" 判定标准文字为概括，非原文。", " Criteria text is summarised, not quoted.")}
          </span>
        </div>
        <AiNotice />
      </div>
    </>
  );
}

function ToothGlyph(props: {
  fdi: number;
  record: PatientRecord;
  selected: boolean;
  surface: Surface | null;
  label: string;
  mid: boolean;
  onPick: (s: Surface | null) => void;
}) {
  const { fdi, record, selected, surface, label, mid, onPick } = props;
  const e = record.teeth[fdi];
  const size = 20;
  return (
    <div className={`odo-tooth ${selected ? "sel" : ""} ${mid ? "mid" : ""}`}>
      {Math.floor(fdi / 10) <= 2 && <div className="odo-n">{label}</div>}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="group" aria-label={label}>
        {glyphRegions(fdi, size).map(({ surface: s, points }) => {
          const f = e?.surfaces[s];
          return (
            <polygon
              key={s}
              points={points}
              className={surface === s ? "on" : ""}
              fill={f ? ICDAS[f.code].color : "var(--panel-solid)"}
              onClick={() => onPick(s)}
            >
              <title>{`${label} ${s}${f ? ` · ICDAS ${f.code}` : ""}`}</title>
            </polygon>
          );
        })}
        {isAnterior(fdi) && <rect x={size * 0.3} y={size * 0.3} width={size * 0.4} height={size * 0.4} className="odo-inc" onClick={() => onPick(null)} />}
      </svg>
      {Math.floor(fdi / 10) >= 3 && <div className="odo-n">{label}</div>}
    </div>
  );
}

