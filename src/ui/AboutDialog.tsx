import { BookOpen, Box, ExternalLink, GraduationCap, X } from "lucide-react";
import { useState } from "react";
import { PROVENANCE_ORDER } from "../anatomy/registry";
import { PROVENANCE_ZH } from "../content/structures";
import { setState, useStore, type AppState } from "../state/store";
import { PROV_COLOR } from "./explore/StructureTree";
import { Logo } from "./TopBar";
import { AI_NOTICE_LONG, AI_NOTICE_LONG_EN, AI_NOTICE_SHORT, AI_NOTICE_SHORT_EN, AiNotice, aiShort } from "./AiNotice";
import { useLang, useT } from "../i18n";

type Tab = "guide" | "data" | "credits";

export function AboutDialog() {
  const open = useStore((s) => s.aboutOpen);
  const [tab, setTab] = useState<Tab>("guide");
  const t = useT();
  const en = useLang() === "en";
  if (!open) return null;
  const close = () => setState({ aboutOpen: false });
  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="panel dialog wide" role="dialog" aria-label={t("关于 OralAtlas", "About OralAtlas")}>
        <div className="dialog-tabs">
          {([
            ["guide", "使用指南", "Guide"],
            ["data", "模型与可信度", "Model reliability"],
            ["credits", "数据来源与署名", "Sources & credits"],
          ] as [Tab, string, string][]).map(([id, zh, enLabel]) => (
            <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{t(zh, enLabel)}</button>
          ))}
          <span style={{ flex: 1 }} />
          <button className="btn icon ghost" onClick={close} aria-label={t("关闭", "Close")} style={{ marginBottom: 6 }}><X size={18} /></button>
        </div>
        <div className="scroll dialog-body prose">
          {en && tab === "guide" && <GuideEn />}
          {en && tab === "data" && <DataEn />}
          {en && tab === "credits" && <CreditsEn />}
          {!en && tab === "guide" && (
            <>
              <h2>OralAtlas 口腔三维解剖图谱</h2>
              <AiNotice variant="card" />
              <p>面向口腔医学生的自学平台：在真实解剖数据构建的三维模型上，系统学习牙体形态、牙体与牙周组织、颌骨与颞下颌关节，以及口腔颌面部的神经血管。</p>
              <h3>鼠标与触控</h3>
              <ul>
                <li>左键拖动旋转，滚轮或双指缩放；单击选中结构，悬停查看名称。</li>
                <li><strong>双击牙齿</strong>进入单牙解剖：逐层查看釉质、牙本质、牙骨质、牙周膜、髓腔与根管，可分层展开、剖切。</li>
                <li>左侧“图层”控制各类结构的显示、半透明与隐藏；“牙位图”按临床习惯浏览 32 颗恒牙。</li>
                <li>底部工具条：预设视角、上下颌分离、张口、剖切、标签。</li>
              </ul>
              <h3>键盘快捷键</h3>
              <div className="shortcut-grid">
                <span><kbd>/</kbd> 或 <kbd>Ctrl</kbd>+<kbd>K</kbd></span><span>搜索牙位、结构、术语</span>
                <span><kbd>Esc</kbd></span><span>取消选择 / 退出单牙解剖 / 关闭对话框</span>
                <span><kbd>D</kbd></span><span>对选中的牙齿进入单牙解剖</span>
                <span><kbd>F</kbd></span><span>聚焦选中的结构</span>
                <span><kbd>G</kbd> / <kbd>H</kbd></span><span>选中结构半透明 / 隐藏</span>
                <span><kbd>L</kbd></span><span>显示或隐藏标签</span>
                <span><kbd>S</kbd></span><span>开关剖切</span>
                <span><kbd>R</kbd></span><span>重置视角</span>
                <span><kbd>1</kbd>–<kbd>8</kbd></span><span>预设视角（四分之三 / 前 / 右 / 左 / 上 / 下 / 上牙弓 / 下牙弓）</span>
                <span><kbd>N</kbd></span><span>切换牙位记录法（FDI → 通用 → Palmer）</span>
              </div>
              <h3>学习建议</h3>
              <ol>
                <li>先读“课程”第 1–3 课，建立方位术语与牙位记录法的概念。</li>
                <li>按牙型学习（第 4–6 课），每颗牙都在单牙解剖中对照形态描述观察。</li>
                <li>用“测验”的 3D 找牙与结构识别检验空间认知，错题本会自动记录。</li>
              </ol>
              <p className="muted"><strong>声明：</strong>教学文字由 AI 辅助编写、正在审校中；本站为教学参考，不能用于诊断、治疗计划或任何临床决策。模型来自单一个体并经过简化，牙体内部组织与部分神经血管为示意建模（见“模型与可信度”）。</p>
            </>
          )}
          {!en && tab === "data" && (
            <>
              <h2>模型几何的可信度</h2>
              <p>每个结构在详情面板底部都标注了它的几何来源。学习时请留意：真实扫描数据与示意建模的精确程度不同。</p>
              <table className="prov-table">
                <tbody>
                  {PROVENANCE_ORDER.map((p) => (
                    <tr key={p}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <span className="prov-dot" style={{ background: PROV_COLOR[p], display: "inline-block", marginRight: 8 }} />
                        <b>{PROVENANCE_ZH[p]?.label ?? p}</b>
                      </td>
                      <td>{PROVENANCE_ZH[p]?.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>模型说明</h3>
              <ul>
                <li>单位为厘米，坐标系 Y 轴向上、Z 轴向前；“左/右”均指患者的左右。</li>
                <li>BodyParts3D 原始数据只有 28 颗牙，四颗第三磨牙由同象限第二磨牙缩放派生。</li>
                <li>牙体内部组织（釉质、牙本质、牙骨质、牙周膜、髓腔、根管）在每颗牙的真实外形内按教科书比例建模，根管数取最常见形态。</li>
                <li>上颌窦由上颌骨内部掏空建模；额窦、蝶窦为示意体积。</li>
                <li>神经血管走行来自 Z-Anatomy 图谱并拟合到本模型颌骨上，部分细小分支为示意路径。</li>
              </ul>
            </>
          )}
          {!en && tab === "credits" && (
            <>
              <h2>数据来源与署名</h2>
              <h3>三维解剖数据</h3>
              <ul>
                <li>
                  <strong>BodyParts3D</strong>，© The Database Center for Life Science（DBCLS），依据{" "}
                  <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">CC BY-SA 2.1 Japan <ExternalLink size={11} /></a> 许可使用。
                  <br />
                  <span className="muted">BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan</span>
                </li>
                <li>
                  <strong>Z-Anatomy</strong>（Lluís Vinent 等）神经血管中心线，依据{" "}
                  <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0 <ExternalLink size={11} /></a> 许可使用。
                </li>
                <li>
                  模型资产经 <strong>Dental Scope</strong>（Yoseph 及贡献者，<a href="https://github.com/Yoosseph/dental-scope" target="_blank" rel="noreferrer">github.com/Yoosseph/dental-scope <ExternalLink size={11} /></a>）处理：坐标变换、减面压缩、第三磨牙派生、牙体分层建模、神经血管拟合等。处理后的模型按原许可（CC BY-SA）共享。本站文件未改动，仅在浏览器中对体素重建的牙本质、牙骨质、牙周膜和髓腔做了 Taubin 平滑，以消除阶梯纹。
                </li>
              </ul>
              <h3>文献数据</h3>
              <ul>
                <li>根管数目统计：Monsarrat P, et al. PLOS ONE 2016;11(10):e0165329（CC BY）；第三磨牙：Al-Qudah A, et al. Sci Rep 2023;13:6901（CC BY 4.0）。</li>
                <li>根管数目百分比转引自 Dental Scope 整理的数据（出处如上），未与论文原文核对。</li>
              </ul>
              <h3>教学文字的来源</h3>
              <p>
                <strong>{AI_NOTICE_SHORT}。</strong>
                {AI_NOTICE_LONG.replace(/^本站的/, "")}
              </p>
              <ul>
                <li>课程大纲参照国内口腔解剖生理学课程的常见章节顺序拟定，并非逐章对应某一本教材。</li>
                <li>术语表的分组与必收词条由编写者指定，词条释义、英文与拉丁名由 AI 撰写；拉丁名中不确定的已省略。</li>
                <li>已人工抽查：16 种牙型的发育时间与常用的 Logan–Kronfeld 时间表一致；部分神经、肌肉条目经通读未发现错误。其余内容尚未逐条核验。</li>
              </ul>
              <h3>软件</h3>
              <ul>
                <li>three.js、three-mesh-bvh、GSAP、React、zustand、lucide 图标（均为 MIT 或类似开源许可）。</li>
                <li>
                  渲染引擎架构参考了{" "}
                  <a href="https://github.com/thebuggeddev/anatomy" target="_blank" rel="noreferrer">thebuggeddev/anatomy <ExternalLink size={11} /></a>（命令式 three.js 引擎 + React 界面、按需渲染、模型归一化与覆盖层定位）。
                </li>
              </ul>
              <h3>本站许可</h3>
              <p>三维模型及其渲染图依 CC BY-SA 共享；教学文字（AI 辅助编写，部分事实参考了 Dental Scope 的 CC BY-SA 4.0 资料）依 CC BY-SA 4.0 共享。转载请保留以上署名。</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Welcome() {
  const open = useStore((s) => s.welcomeOpen);
  const t = useT();
  const lang = useLang();
  if (!open) return null;
  const go = (patch: Partial<AppState>) => {
    localStorage.setItem("oralatlas.welcomed", "1");
    setState({ welcomeOpen: false, ...patch });
  };
  return (
    <div className="backdrop" style={{ placeItems: "center", paddingTop: 0 }}>
      <div className="panel welcome" role="dialog" aria-label={t("欢迎", "Welcome")}>
        <span className="brand-mark" style={{ width: 44, height: 44, borderRadius: 14 }}><Logo size={24} /></span>
        <h1>{t("口腔三维解剖图谱", "3D Oral & Dental Atlas")}</h1>
        <p className="lede">
          {t(
            "32 颗恒牙的逐层解剖、三种牙位记录法、颌骨与颞下颌关节、口腔神经血管——在真实解剖数据构建的三维模型上，配套 14 节系统课程与题库，按自己的节奏学习。",
            "Layer-by-layer anatomy of all 32 permanent teeth, three tooth-numbering systems, the jaws and TMJ, and oral nerves and vessels — on 3D models built from real anatomical data, with 14 structured lessons and a question bank. Learn at your own pace.",
          )}
        </p>
        <div className="welcome-grid">
          <button className="welcome-card" onClick={() => go({ mode: "learn", lessonId: "overview", lessonSection: 0 })}>
            <span className="ico"><BookOpen size={20} /></span>
            <b>{t("从第一课开始", "Start with lesson 1")}</b>
            <small>{t("跟随课程循序渐进，每一节都会自动展示对应的三维场景。", "Follow the lessons step by step; each section sets up its own 3D scene.")}</small>
          </button>
          <button className="welcome-card" onClick={() => go({ mode: "explore" })}>
            <span className="ico"><Box size={20} /></span>
            <b>{t("自由探索", "Explore freely")}</b>
            <small>{t("旋转、剖切、分层；双击任意一颗牙进入单牙解剖。", "Rotate, section and peel layers; double-click any tooth to dissect it.")}</small>
          </button>
          <button className="welcome-card" onClick={() => go({ mode: "quiz" })}>
            <span className="ico"><GraduationCap size={20} /></span>
            <b>{t("测一测", "Test yourself")}</b>
            <small>{t("3D 找牙、牙位换算、结构识别和知识题库，检验掌握程度。", "Find teeth in 3D, convert numbering, identify structures and answer the question bank.")}</small>
          </button>
        </div>
        <div className="welcome-foot">
          <strong style={{ color: "var(--warn)" }}>{aiShort(lang)}</strong>
          {t(
            "，请以教材和授课教师为准。教学参考，不用于诊断或治疗。模型数据：BodyParts3D（© DBCLS，CC BY-SA 2.1 JP）、Z-Anatomy（CC BY-SA 4.0），经 Dental Scope 处理。",
            ". Rely on your textbooks and instructors. For teaching reference only, not for diagnosis or treatment. Model data: BodyParts3D (© DBCLS, CC BY-SA 2.1 JP) and Z-Anatomy (CC BY-SA 4.0), processed by Dental Scope.",
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- English versions of the tabs

function GuideEn() {
  return (
    <>
      <h2>OralAtlas — 3D Oral & Dental Atlas</h2>
      <AiNotice variant="card" />
      <p>A self-study platform for dental students: learn tooth morphology, dental and periodontal tissues, the jaws and temporomandibular joint, and the nerves and vessels of the oral and maxillofacial region on 3D models built from real anatomical data.</p>
      <p className="muted">The interface and structure names are available in English. Detailed teaching text (lessons, quiz, glossary definitions, structure descriptions) is currently in Chinese only; English translation is in progress.</p>
      <h3>Mouse and touch</h3>
      <ul>
        <li>Drag with the left button to rotate, scroll or pinch to zoom; click to select a structure, hover to see its name.</li>
        <li><strong>Double-click a tooth</strong> to dissect it: view enamel, dentin, cementum, periodontal ligament, pulp cavity and root canals layer by layer, with exploded view and sectioning.</li>
        <li>On the left, “Layers” controls showing, ghosting and hiding each category; the “Odontogram” browses the 32 permanent teeth the clinical way.</li>
        <li>Bottom toolbar: preset views, jaw separation, mouth opening, section, labels.</li>
        <li>The settings menu (gear icon, top right) switches language, render quality, tooth numbering and theme from any mode.</li>
      </ul>
      <h3>Keyboard shortcuts</h3>
      <div className="shortcut-grid">
        <span><kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd></span><span>Search teeth, structures, terms</span>
        <span><kbd>Esc</kbd></span><span>Deselect / leave tooth dissection / close dialogs</span>
        <span><kbd>D</kbd></span><span>Dissect the selected tooth</span>
        <span><kbd>F</kbd></span><span>Focus the selected structure</span>
        <span><kbd>G</kbd> / <kbd>H</kbd></span><span>Ghost / hide the selected structure</span>
        <span><kbd>L</kbd></span><span>Show or hide labels</span>
        <span><kbd>S</kbd></span><span>Toggle section</span>
        <span><kbd>R</kbd></span><span>Reset view</span>
        <span><kbd>1</kbd>–<kbd>8</kbd></span><span>Preset views (three-quarter / front / right / left / top / bottom / upper arch / lower arch)</span>
        <span><kbd>N</kbd></span><span>Cycle tooth numbering (FDI → Universal → Palmer)</span>
      </div>
      <h3>How to study</h3>
      <ol>
        <li>Start with lessons 1–3 to learn orientation terms and tooth numbering.</li>
        <li>Study by tooth type (lessons 4–6), checking each description against the tooth in dissection view.</li>
        <li>Use the quiz (find teeth in 3D, identify structures) to test spatial understanding; missed questions are recorded automatically.</li>
      </ol>
      <p className="muted"><strong>Disclaimer:</strong> the teaching text is AI-assisted and under review. This site is a teaching reference and must not be used for diagnosis, treatment planning or any clinical decision. The models come from a single individual and are simplified; internal tooth tissues and some nerves and vessels are schematic models (see “Model reliability”).</p>
    </>
  );
}

function DataEn() {
  const DESC: Record<string, [string, string]> = {
    source: ["Source data", "Real anatomical geometry from BodyParts3D; only transformed and simplified."],
    derived: ["Derived", "Cut from or approximated on the source geometry (e.g. alveolar bone, condyle, glenoid fossa, third molars)."],
    modeled: ["Modeled", "Internal tooth structures were generated inside the real tooth outline with simplified, approximate proportions (not measured); the maxillary sinus was hollowed out of the maxilla with an approximate wall thickness."],
    atlas: ["Atlas", "Nerve and vessel centerlines come from the Z-Anatomy atlas (CC BY-SA 4.0), registered to this model's jaws: they show the anatomical course, not measurements of this individual."],
    schematic: ["Schematic", "Teaching paths and markers placed to show relationships between structures (e.g. superior alveolar and palatine nerves, cranial nerves VII/IX/X/XII, mandibular canal envelope, pterygoid venous plexus, articular disc)."],
  };
  return (
    <>
      <h2>How reliable is the model geometry?</h2>
      <p>Every structure states its geometry source at the bottom of its details panel. Keep in mind that real scan data and schematic models differ in accuracy.</p>
      <table className="prov-table">
        <tbody>
          {PROVENANCE_ORDER.map((p) => (
            <tr key={p}>
              <td style={{ whiteSpace: "nowrap" }}>
                <span className="prov-dot" style={{ background: PROV_COLOR[p], display: "inline-block", marginRight: 8 }} />
                <b>{DESC[p]?.[0] ?? p}</b>
              </td>
              <td>{DESC[p]?.[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Model notes</h3>
      <ul>
        <li>Units are centimeters; Y points up and Z forward. “Left/right” always means the patient's left/right.</li>
        <li>BodyParts3D contains only 28 teeth; the four third molars were scaled from the second molar in the same quadrant.</li>
        <li>Internal tooth tissues (enamel, dentin, cementum, PDL, pulp cavity, root canals) were modeled inside each real tooth outline using textbook proportions; canal counts follow the most common form.</li>
        <li>The maxillary sinus was hollowed out of the maxilla; the frontal and sphenoidal sinuses are schematic volumes.</li>
        <li>Nerve and vessel courses come from the Z-Anatomy atlas, fitted to this model's jaws; some small branches are schematic paths.</li>
      </ul>
    </>
  );
}

function CreditsEn() {
  return (
    <>
      <h2>Sources and credits</h2>
      <h3>3D anatomical data</h3>
      <ul>
        <li>
          <strong>BodyParts3D</strong>, © The Database Center for Life Science (DBCLS), used under{" "}
          <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">CC BY-SA 2.1 Japan <ExternalLink size={11} /></a>.
          <br />
          <span className="muted">BodyParts3D, © The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan</span>
        </li>
        <li>
          <strong>Z-Anatomy</strong> (Lluís Vinent et al.) nerve and vessel centerlines, used under{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0 <ExternalLink size={11} /></a>.
        </li>
        <li>
          Model assets processed by <strong>Dental Scope</strong> (Yoseph and contributors,{" "}
          <a href="https://github.com/Yoosseph/dental-scope" target="_blank" rel="noreferrer">github.com/Yoosseph/dental-scope <ExternalLink size={11} /></a>): coordinate transforms, decimation and compression, third-molar derivation, layered tooth modeling, nerve and vessel fitting, etc. The processed models are shared under the original license (CC BY-SA). This site does not modify the files; it only applies Taubin smoothing in the browser to the voxel-reconstructed dentin, cementum, PDL and pulp to remove stair-step artifacts.
        </li>
      </ul>
      <h3>Literature data</h3>
      <ul>
        <li>Root canal counts: Monsarrat P, et al. PLOS ONE 2016;11(10):e0165329 (CC BY); third molars: Al-Qudah A, et al. Sci Rep 2023;13:6901 (CC BY 4.0).</li>
        <li>Canal-count percentages are quoted from the data compiled by Dental Scope (sources above) and have not been checked against the original papers.</li>
      </ul>
      <h3>Where the teaching text comes from</h3>
      <p>
        <strong>{AI_NOTICE_SHORT_EN}. </strong>
        {AI_NOTICE_LONG_EN.replace(/^The teaching text on this site/, "The teaching text")}
      </p>
      <ul>
        <li>The lesson outline follows the usual chapter order of Chinese oral anatomy and physiology courses; it does not map chapter by chapter to any single textbook.</li>
        <li>Glossary groups and required entries were chosen by the author; definitions, English and Latin names were written by AI, and uncertain Latin names were left out.</li>
        <li>Spot-checked by hand: development chronology for all 16 tooth types matches the commonly used Logan–Kronfeld table; some nerve and muscle entries were read through without errors found. The rest has not been verified item by item.</li>
        <li>English versions of interface text were also AI-translated.</li>
      </ul>
      <h3>Software</h3>
      <ul>
        <li>three.js, three-mesh-bvh, GSAP, React, zustand, lucide icons (MIT or similar open-source licenses).</li>
        <li>
          Rendering architecture inspired by{" "}
          <a href="https://github.com/thebuggeddev/anatomy" target="_blank" rel="noreferrer">thebuggeddev/anatomy <ExternalLink size={11} /></a> (imperative three.js engine + React UI, render on demand, model normalization and overlay positioning).
        </li>
      </ul>
      <h3>License of this site</h3>
      <p>The 3D models and their renderings are shared under CC BY-SA; the teaching text (AI-assisted, with some facts drawn from Dental Scope's CC BY-SA 4.0 materials) is shared under CC BY-SA 4.0. Please keep the credits above when reusing.</p>
    </>
  );
}
