// 病历导出：牙面示意图形（界面与导出报告共用）、JSON / CSV / HTML 报告
import { REFERENCES } from "../disease/references";
import { toothNameEn, toothNameZh, formatTooth, type Numbering } from "../anatomy/notation";
import { ICDAS, isAnterior, surfaceLetter, surfaceName, surfacesOf, summarize, type PatientRecord, type Surface } from "./record";

// ------------------------------------------------------------------ 牙面示意（五区十字）

/**
 * 牙位图中每颗牙画成“外框 + 中心方块”的五区图（病历常用画法）：
 * 中心 = 咬合面；靠近牙弓外侧的一边 = 颊（唇）面，靠近中线的一边 = 近中面。
 * 返回各牙面多边形的顶点（单位：size 的比例坐标）。
 */
export function glyphRegions(fdi: number, size = 40): { surface: Surface; points: string }[] {
  const S = size;
  const a = S * 0.3;
  const b = S * 0.7;
  const q = Math.floor(fdi / 10);
  const P = (pts: number[][]) => pts.map((p) => p.map((v) => +v.toFixed(2)).join(",")).join(" ");
  const top = P([[0, 0], [S, 0], [b, a], [a, a]]);
  const bottom = P([[0, S], [a, b], [b, b], [S, S]]);
  const left = P([[0, 0], [a, a], [a, b], [0, S]]);
  const right = P([[S, 0], [S, S], [b, b], [b, a]]);
  const center = P([[a, a], [b, a], [b, b], [a, b]]);
  const upper = q <= 2;
  // 图上患者右侧（1、4 象限）在观察者左边，近中朝向图的中线（右边）
  const mesialRight = q === 1 || q === 4;
  const out: { surface: Surface; points: string }[] = [
    { surface: upper ? "B" : "L", points: top },
    { surface: upper ? "L" : "B", points: bottom },
    { surface: mesialRight ? "D" : "M", points: left },
    { surface: mesialRight ? "M" : "D", points: right },
  ];
  if (!isAnterior(fdi)) out.push({ surface: "O", points: center });
  return out;
}

/** 用于导出报告的牙面示意 SVG 字符串 */
function glyphSvg(r: PatientRecord, fdi: number, size = 34): string {
  const e = r.teeth[fdi];
  const polys = glyphRegions(fdi, size)
    .map(({ surface, points }) => {
      const f = e?.surfaces[surface];
      const fill = f ? ICDAS[f.code].color : "#ffffff";
      return `<polygon points="${points}" fill="${fill}" stroke="#475569" stroke-width="0.8"/>`;
    })
    .join("");
  const inc = isAnterior(fdi) ? `<rect x="${size * 0.3}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.4}" fill="#e2e8f0" stroke="#475569" stroke-width="0.8"/>` : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${polys}${inc}</svg>`;
}

// ------------------------------------------------------------------ 下载

export function download(name: string, content: string | Blob, type = "application/octet-stream") {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const safe = (s: string) => s.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40);
export function baseName(r: PatientRecord) {
  return `OralAtlas_${safe(r.patient.recordNo || r.patient.name || "record")}_${r.patient.examDate || r.createdAt.slice(0, 10)}`;
}

/** JSON：完整数据，可在本站“导入”恢复 */
export function exportJson(records: PatientRecord[], fileName: string) {
  const payload = { format: "oralatlas-chart", version: 1, exportedAt: new Date().toISOString(), records };
  download(`${fileName}.json`, JSON.stringify(payload, null, 2), "application/json");
}

/** 解析导入文件：支持单条病历或 { records: [...] } */
export function parseImport(text: string): unknown[] {
  const d = JSON.parse(text);
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.records)) return d.records;
  return [d];
}

const csvCell = (v: string | number) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV：每个已记录的牙面一行，便于在 Excel 中统计（带 BOM，Excel 可正确识别中文） */
export function exportCsv(r: PatientRecord, lang: "zh" | "en") {
  const head =
    lang === "en"
      ? ["Record no.", "Name", "Exam date", "FDI", "Tooth", "Surface", "ICDAS", "Criterion", "Activity", "Surface note", "Tooth note"]
      : ["病历号", "姓名", "检查日期", "FDI 牙位", "牙齿", "牙面", "ICDAS", "判定", "活跃性", "牙面备注", "牙齿备注"];
  const rows: (string | number)[][] = [head];
  for (const k of Object.keys(r.teeth).sort((x, y) => Number(x) - Number(y))) {
    const fdi = Number(k);
    const e = r.teeth[k];
    for (const s of surfacesOf(fdi)) {
      const f = e.surfaces[s];
      if (!f) continue;
      rows.push([
        r.patient.recordNo,
        r.patient.name,
        r.patient.examDate,
        fdi,
        lang === "en" ? toothNameEn(fdi) : toothNameZh(fdi),
        `${surfaceLetter(fdi, s)} ${surfaceName(fdi, s, lang)}`,
        f.code,
        lang === "en" ? ICDAS[f.code].en : ICDAS[f.code].zh,
        f.activity ? (lang === "en" ? f.activity : f.activity === "active" ? "活跃" : "静止") : "",
        f.note ?? "",
        e.note ?? "",
      ]);
    }
  }
  download(`${baseName(r)}.csv`, "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"), "text/csv;charset=utf-8");
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** 自包含的 HTML 报告：可直接用浏览器打开、打印或另存为 PDF */
export function exportHtml(r: PatientRecord, lang: "zh" | "en", numbering: Numbering, snapshot?: string) {
  const T = (zh: string, en: string) => (lang === "en" ? en : zh);
  const p = r.patient;
  const sexText = { "": "—", male: T("男", "Male"), female: T("女", "Female"), other: T("其他", "Other") }[p.sex];
  const sum = summarize(r);
  const row = (quads: number[][]) =>
    `<tr>${quads
      .flat()
      .map((fdi) => `<td class="t"><div class="n">${esc(formatTooth(fdi, numbering))}</div>${glyphSvg(r, fdi)}</td>`)
      .join("")}</tr>`;
  const Q = (q: number, rev: boolean) => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => q * 10 + i);
    return rev ? a.reverse() : a;
  };
  const findings: string[] = [];
  for (const k of Object.keys(r.teeth).sort((x, y) => Number(x) - Number(y))) {
    const fdi = Number(k);
    const e = r.teeth[k];
    const fs = surfacesOf(fdi).filter((s) => e.surfaces[s]);
    fs.forEach((s, i) => {
      const f = e.surfaces[s]!;
      findings.push(
        `<tr>${i === 0 ? `<td rowspan="${fs.length}"><b>${esc(formatTooth(fdi, numbering))}</b><br><span class="m">${esc(lang === "en" ? toothNameEn(fdi) : toothNameZh(fdi))}</span>${e.note ? `<br><span class="m">${esc(e.note)}</span>` : ""}</td>` : ""}` +
          `<td>${surfaceLetter(fdi, s)} · ${esc(surfaceName(fdi, s, lang))}</td>` +
          `<td><span class="code" style="background:${ICDAS[f.code].color}">${f.code}</span> ${esc(lang === "en" ? ICDAS[f.code].en : ICDAS[f.code].zh)}</td>` +
          `<td>${f.activity ? esc(lang === "en" ? f.activity : f.activity === "active" ? "活跃" : "静止") : "—"}</td>` +
          `<td>${esc(f.note ?? "")}</td></tr>`,
      );
    });
  }
  const ref = REFERENCES.ICDAS;
  const html = `<!doctype html>
<html lang="${lang === "en" ? "en" : "zh-CN"}"><head><meta charset="utf-8">
<title>${esc(T("口腔检查记录", "Dental chart"))} — ${esc(p.name || p.recordNo || "")}</title>
<style>
body{font-family:system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#0f172a;max-width:960px;margin:24px auto;padding:0 20px;font-size:14px;line-height:1.55}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:24px 0 8px;border-left:4px solid #0d9488;padding-left:8px}
.m{color:#64748b;font-size:12px}.warn{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:8px 12px;border-radius:8px;font-size:12.5px}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f1f5f9;font-weight:600}
.info td{border:none;padding:3px 12px 3px 0}.info td:nth-child(odd){color:#64748b;white-space:nowrap}
.chart{width:auto;margin:0 auto}.chart td.t{border:none;padding:2px 3px;text-align:center}.chart .n{font-size:11px;color:#475569}
.chart tr.gap td{height:10px;border:none !important}.mid{border-left:2px solid #94a3b8 !important}
.code{display:inline-block;min-width:18px;text-align:center;border-radius:4px;color:#fff;font-weight:700;padding:0 4px;text-shadow:0 0 2px #0006}
.legend span{display:inline-flex;align-items:center;gap:4px;margin:0 10px 4px 0;font-size:12px}.legend i{width:12px;height:12px;border:1px solid #475569;display:inline-block}
.snap{max-width:100%;border:1px solid #e2e8f0;border-radius:8px}
@media print{body{margin:0}.noprint{display:none}h2{break-after:avoid}tr{break-inside:avoid}}
</style></head><body>
<div class="noprint" style="text-align:right"><button onclick="print()">${T("打印 / 另存为 PDF", "Print / Save as PDF")}</button></div>
<h1>${T("口腔检查记录 · 龋病（ICDAS）", "Dental chart · Caries (ICDAS)")}</h1>
<div class="m">${T("由 OralAtlas 导出", "Exported from OralAtlas")} · ${esc(new Date().toLocaleString(lang === "en" ? "en" : "zh-CN"))} · ${T("牙位记录法", "Numbering")}: ${numbering === "fdi" ? "FDI" : numbering === "uni" ? "Universal" : "Palmer"}</div>
<p class="warn">${T("教学练习用记录，非正式医疗文书。ICDAS 判定标准文字为对原文的概括（AI 辅助编写），请以原始标准与临床培训为准。", "Teaching/practice record, not an official medical document. ICDAS criteria text is a summary of the original (AI-assisted); rely on the original standard and clinical training.")}</p>
<h2>${T("基本信息", "Patient")}</h2>
<table class="info"><tr><td>${T("姓名", "Name")}</td><td>${esc(p.name || "—")}</td><td>${T("病历号", "Record no.")}</td><td>${esc(p.recordNo || "—")}</td><td>${T("性别", "Sex")}</td><td>${sexText}</td></tr>
<tr><td>${T("出生日期", "Date of birth")}</td><td>${esc(p.birthDate || "—")}</td><td>${T("检查日期", "Exam date")}</td><td>${esc(p.examDate || "—")}</td><td>${T("检查者", "Examiner")}</td><td>${esc(p.examiner || "—")}</td></tr>
<tr><td>${T("主诉", "Chief complaint")}</td><td colspan="5">${esc(p.chiefComplaint || "—")}</td></tr>
${p.notes ? `<tr><td>${T("备注", "Notes")}</td><td colspan="5">${esc(p.notes)}</td></tr>` : ""}</table>
<h2>${T("牙位图", "Odontogram")}</h2>
<table class="chart">${row([Q(1, true), Q(2, false)])}<tr class="gap"><td colspan="16"></td></tr>${row([Q(4, true), Q(3, false)])}</table>
<p class="m" style="text-align:center">${T("观察者视角：图左侧为患者右侧。中心为咬合面，外侧边为颊（唇）面，靠中线一侧为近中面。", "Viewed from the front: the patient's right is on the left. Centre = occlusal; outer edge = buccal/labial; edge toward the midline = mesial.")}</p>
<div class="legend">${ICDAS.map((c) => `<span><i style="background:${c.color}"></i>${c.code} ${esc(lang === "en" ? c.en : c.zh)}</span>`).join("")}</div>
<h2>${T("检查结果", "Findings")}</h2>
<p>${T(`已记录 ${sum.teeth} 颗牙；ICDAS ≥ 3（釉质崩解或牙本质受累）的牙面 ${sum.cavitated} 个。`, `${sum.teeth} teeth charted; ${sum.cavitated} surfaces with ICDAS ≥ 3 (enamel breakdown or dentin involvement).`)}</p>
${findings.length ? `<table><tr><th>${T("牙位", "Tooth")}</th><th>${T("牙面", "Surface")}</th><th>ICDAS</th><th>${T("活跃性", "Activity")}</th><th>${T("备注", "Note")}</th></tr>${findings.join("")}</table>` : `<p class="m">${T("尚无记录。", "No findings recorded.")}</p>`}
${snapshot ? `<h2>${T("三维视图截图", "3D view")}</h2><img class="snap" src="${snapshot}" alt="">` : ""}
<h2>${T("ICDAS 编码标准", "ICDAS codes")}</h2>
<table>${ICDAS.map((c) => `<tr><td style="white-space:nowrap"><span class="code" style="background:${c.color}">${c.code}</span> ${esc(lang === "en" ? c.en : c.zh)}</td><td>${esc(lang === "en" ? c.descEn : c.descZh)}</td></tr>`).join("")}</table>
<p class="m">${T("依据", "Reference")}: ${esc(ref.citation)} <a href="https://doi.org/${ref.doi}">doi:${ref.doi}</a></p>
</body></html>`;
  download(`${baseName(r)}.html`, html, "text/html;charset=utf-8");
}
