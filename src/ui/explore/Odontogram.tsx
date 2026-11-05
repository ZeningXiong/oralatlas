// 牙位图：按临床习惯（面对患者）排列 32 颗恒牙，可点击选中、双击进入单牙解剖
import { useState } from "react";
import { formatTooth, positionOf, quadrantOf, toothNameEn, toothNameZh, toPalmer, toUniversal } from "../../anatomy/notation";
import { useT } from "../../i18n";
import { actions, useStore } from "../../state/store";

const WIDTH: Record<number, number> = { 1: 0.86, 2: 0.7, 3: 0.78, 4: 0.72, 5: 0.7, 6: 1.04, 7: 0.98, 8: 0.9 };
const LOWER_INCISOR: Record<number, number> = { 1: 0.56, 2: 0.6 };
/** 示意图中的牙根数（上颌第一前磨牙 2 根，上颌磨牙 3 根，下颌磨牙 2 根） */
const ROOTS: Record<string, number> = { "u-4": 2, "u-6": 3, "u-7": 3, "u-8": 3, "l-6": 2, "l-7": 2, "l-8": 2 };

/** 牙齿侧面轮廓：牙冠 + 牙根。上颌牙根朝上，下颌牙根朝下。base 为咬合面 y。 */
function toothPath(x: number, w: number, pos: number, upper: boolean, base: number) {
  const s = upper ? -1 : 1; // 指向牙根的方向（屏幕 y）
  const crown = pos >= 6 ? 16 : pos >= 4 ? 18 : pos === 3 ? 21 : 20;
  const root = pos === 3 ? 32 : pos >= 6 ? 22 : 26;
  const n = ROOTS[`${upper ? "u" : "l"}-${pos}`] ?? 1;
  const y0 = base;
  const yc = y0 - s * crown;
  const L = x + w * 0.08;
  const R = x + w * 0.92;
  // 咬合面/切缘
  let edge: string;
  if (pos === 3) edge = `L${x + w / 2} ${y0 + s * 3}`;
  else if (pos >= 4) edge = `Q${x + w * 0.28} ${y0 + s * 3} ${x + w / 2} ${y0 - s * 1} Q${x + w * 0.72} ${y0 + s * 3} ${x + w * 0.88} ${y0}`;
  else edge = `L${x + w * 0.88} ${y0}`;
  let d = `M${L} ${yc} C${x - 1} ${yc + s * crown * 0.4} ${x} ${y0} ${x + w * 0.12} ${y0}${edge}`;
  d += ` C${x + w} ${y0} ${x + w + 1} ${yc + s * crown * 0.4} ${R} ${yc}`;
  const yr = yc - s * root;
  if (n === 1) {
    d += ` C${R} ${yc - s * root * 0.5} ${x + w * 0.6} ${yr} ${x + w / 2} ${yr} C${x + w * 0.4} ${yr} ${L} ${yc - s * root * 0.5} ${L} ${yc}Z`;
  } else {
    const seg = (R - L) / n;
    let cx = R;
    for (let i = 0; i < n; i++) {
      const mid = cx - seg / 2;
      const len = root * (n === 3 && i === 1 ? 1.06 : 0.94);
      const tipY = yc - s * len;
      d += ` C${cx} ${yc - s * len * 0.55} ${mid + seg * 0.2} ${tipY} ${mid} ${tipY} C${mid - seg * 0.2} ${tipY} ${cx - seg} ${yc - s * len * 0.55} ${cx - seg} ${yc - s * (i === n - 1 ? 0 : 7)}`;
      cx -= seg;
    }
    d += "Z";
  }
  return d;
}

const ROWS = [
  { fdis: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], upper: true, base: 117 },
  { fdis: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38], upper: false, base: 129 },
];
const UNIT = 22;
const GAP = 2;

export function Odontogram() {
  const numbering = useStore((s) => s.numbering);
  const selected = useStore((s) => s.selected);
  const viewed = useStore((s) => s.progress.viewedTeeth);
  const dissect = useStore((s) => s.dissectFdi);
  const [hover, setHover] = useState<number | null>(null);
  const t = useT();
  const nameOfTooth = (f: number) => t(toothNameZh(f), toothNameEn(f));

  const rowWidth = (upper: boolean) =>
    ROWS[upper ? 0 : 1].fdis.reduce((a, f) => {
      const p = positionOf(f);
      return a + (!upper && LOWER_INCISOR[p] ? LOWER_INCISOR[p] : WIDTH[p]) * UNIT + GAP;
    }, 0);
  const totalW = Math.max(rowWidth(true), rowWidth(false)) + 8;

  const selFdi = selected && /^tooth-\d\d$/.test(selected) ? Number(selected.slice(6)) : dissect;
  const info = hover ?? selFdi;

  return (
    <div className="scroll sidebar-body">
      <div className="odonto">
        <div className="eyebrow" style={{ marginBottom: 6 }}>{t("恒牙列 · 面对患者视角", "Permanent dentition · facing the patient")}</div>
        <svg viewBox={`0 0 ${totalW} 236`} role="img" aria-label={t("牙位图", "Odontogram")}>
          <line x1={totalW / 2} y1={22} x2={totalW / 2} y2={222} stroke="var(--line-strong)" strokeDasharray="3 4" />
          <line x1={2} y1={123} x2={totalW - 2} y2={123} stroke="var(--line-strong)" strokeDasharray="3 4" />
          <text x={4} y={12} fontSize={10} fill="var(--faint)">{t("上颌 · 患者右侧", "Maxillary · patient right")}</text>
          <text x={totalW - 4} y={12} fontSize={10} fill="var(--faint)" textAnchor="end">{t("患者左侧", "Patient left")}</text>
          <text x={4} y={234} fontSize={10} fill="var(--faint)">{t("下颌", "Mandibular")}</text>
          {ROWS.map((row) => {
            const w0 = rowWidth(row.upper);
            let x = (totalW - w0) / 2;
            return row.fdis.map((fdi) => {
              const pos = positionOf(fdi);
              const w = (!row.upper && LOWER_INCISOR[pos] ? LOWER_INCISOR[pos] : WIDTH[pos]) * UNIT;
              const x0 = x;
              x += w + GAP;
              const isSel = selFdi === fdi;
              const isHover = hover === fdi;
              const seen = viewed.includes(fdi);
              const fill = isSel
                ? "var(--accent)"
                : seen
                  ? "color-mix(in srgb, var(--accent) 22%, var(--panel-solid))"
                  : "var(--panel-solid)";
              const ty = row.upper ? 118 - 62 : 130 + 70;
              return (
                <g
                  key={fdi}
                  className="tooth-cell"
                  onMouseEnter={() => setHover(fdi)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => actions.select(`tooth-${fdi}`, { focus: true })}
                  onDoubleClick={() => actions.enterDissect(fdi)}
                  role="button"
                  aria-label={`${nameOfTooth(fdi)}${t("，", ", ")}${formatTooth(fdi, numbering)}`}
                >
                  <path
                    d={toothPath(x0, w, pos, row.upper, row.base)}
                    fill={fill}
                    stroke={isSel || isHover ? "var(--accent)" : "var(--line-strong)"}
                    strokeWidth={isSel || isHover ? 1.8 : 1.1}
                  />
                  <text
                    x={x0 + w / 2}
                    y={ty}
                    fontSize={numbering === "pal" ? 7.5 : 9.5}
                    textAnchor="middle"
                    fill={isSel ? "var(--accent)" : "var(--muted)"}
                    fontWeight={isSel ? 750 : 600}
                    fontFamily="var(--mono)"
                  >
                    {formatTooth(fdi, numbering).replace("#", "")}
                  </text>
                </g>
              );
            });
          })}
        </svg>
        <div className="odonto-legend">
          <span><i style={{ background: "var(--accent)" }} />{t("当前选中", "Selected")}</span>
          <span><i style={{ background: "color-mix(in srgb, var(--accent) 22%, var(--panel-solid))" }} />{t("已查看", "Viewed")}</span>
          <span><i style={{ background: "var(--panel-solid)" }} />{t("未查看", "Not viewed")}</span>
        </div>
        <div className="section">
          <h3>{t("学习进度", "Progress")}</h3>
          <div className="progress-bar"><i style={{ width: `${(viewed.length / 32) * 100}%` }} /></div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            {t(`已查看 ${viewed.length} / 32 颗恒牙 · 单击选中，双击进入单牙解剖`, `${viewed.length} / 32 permanent teeth viewed · click to select, double-click to dissect`)}
          </div>
        </div>
        {info && (
          <div className="section">
            <h3>{nameOfTooth(info)}</h3>
            <div className="numbers">
              <div className={numbering === "fdi" ? "current" : ""}><small>FDI</small><b>{info}</b></div>
              <div className={numbering === "uni" ? "current" : ""}><small>{t("通用编号", "Universal")}</small><b>#{toUniversal(info)}</b></div>
              <div className={numbering === "pal" ? "current" : ""}><small>Palmer</small><b>{toPalmer(info)}</b></div>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              {t(
                `FDI 第 1 位是象限（${quadrantOf(info)}），第 2 位是从中线数起的牙位（${positionOf(info)}）。`,
                `FDI: the first digit is the quadrant (${quadrantOf(info)}), the second the position counted from the midline (${positionOf(info)}).`,
              )}
            </div>
          </div>
        )}
        <div className="section">
          <h3>{t("编号规则速记", "Numbering cheat sheet")}</h3>
          <div className="prose" style={{ fontSize: 12.5 }}>
            <ul>
              <li><strong>FDI</strong>{t("：象限 1 上颌右、2 上颌左、3 下颌左、4 下颌右；牙位 1–8 依次为中切牙至第三磨牙。", ": quadrant 1 upper right, 2 upper left, 3 lower left, 4 lower right; positions 1–8 run from central incisor to third molar.")}</li>
              <li><strong>{t("通用编号", "Universal")}</strong>{t("：从上颌右侧第三磨牙（#1）起，沿上牙弓到上颌左侧第三磨牙（#16），再从下颌左侧第三磨牙（#17）回到下颌右侧第三磨牙（#32）。", ": starts at the maxillary right third molar (#1), runs along the upper arch to the maxillary left third molar (#16), then from the mandibular left third molar (#17) back to the mandibular right third molar (#32).")}</li>
              <li><strong>Palmer</strong>{t("：象限符号（┘└┐┌）加牙位数字，本站以 UR / UL / LL / LR 文本表示。", ": a quadrant symbol (┘└┐┌) plus the position number; shown here as UR / UL / LL / LR.")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
