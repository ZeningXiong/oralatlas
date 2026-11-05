import { ArrowRight, Bone, Check, CircleDot, Hash, ListChecks, RotateCcw, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_FDI, formatTooth, toothNameEn, toothNameZh, toPalmer, toUniversal, type Numbering } from "../../anatomy/notation";
import { CATEGORY_BY_ID, baseIdOf, categoryOf, describe, sideOfKey } from "../../anatomy/registry";
import { QUIZ } from "../../content/quiz";
import { LESSONS } from "../../content/lessons";
import type { CategoryId, QuizTopic, SceneSpec } from "../../content/types";
import { useEngine } from "../../app/services";
import { actions, getState, setState, useStore } from "../../state/store";
import { AiNotice } from "../AiNotice";
import { ZhOnlyNote } from "../ZhOnlyNote";
import { nameOf, tr, useLang, useT } from "../../i18n";

const TOPIC_ZH: Record<QuizTopic, string> = {
  numbering: "牙位记录",
  "tooth-morphology": "牙体形态",
  "dental-tissues": "牙体组织",
  "pulp-canals": "髓腔根管",
  periodontium: "牙周组织",
  development: "牙的发育",
  bones: "颌骨",
  tmj: "颞下颌关节",
  nerves: "神经",
  vessels: "血管",
  muscles: "肌肉",
  sinus: "上颌窦",
  clinical: "临床应用",
};
const TOPIC_EN: Record<QuizTopic, string> = {
  numbering: "Tooth numbering",
  "tooth-morphology": "Tooth morphology",
  "dental-tissues": "Dental tissues",
  "pulp-canals": "Pulp & canals",
  periodontium: "Periodontium",
  development: "Tooth development",
  bones: "Jaw bones",
  tmj: "TMJ",
  nerves: "Nerves",
  vessels: "Vessels",
  muscles: "Muscles",
  sinus: "Maxillary sinus",
  clinical: "Clinical application",
};
/** 主题名（当前语言） */
const topicName = (t: QuizTopic) => tr(TOPIC_ZH[t], TOPIC_EN[t]);
/** 牙名（当前语言） */
const toothName = (fdi: number) => (getState().lang === "en" ? toothNameEn(fdi) : toothNameZh(fdi));

type Kind = "knowledge" | "find" | "convert" | "identify";

interface RunQ {
  id: string;
  topic: string;
  prompt: string;
  sub?: string;
  options: string[];
  answer: number;
  explanation: string;
  scene?: SceneSpec;
  /** 3D 找牙：目标牙 */
  pickFdi?: number;
  /** 结构识别：高亮的网格 */
  highlight?: string;
  /** 答完后在 3D 中选中 */
  reveal?: string;
}

const shuffle = <T,>(a: T[]) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** 打乱选项顺序并同步正确答案下标 */
function shuffleOptions(q: RunQ): RunQ {
  if (!q.options.length) return q;
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

// ---------------------------------------------------------------- 题目生成

function knowledgeSet(opts: { topics: QuizTopic[]; lessonId?: string; count: number; wrongOnly: boolean }): RunQ[] {
  const hist = getState().progress.quiz;
  const lastWrong = new Set<string>();
  const lastRight = new Set<string>();
  for (const h of hist) {
    if (h.correct) {
      lastRight.add(h.id);
      lastWrong.delete(h.id);
    } else {
      lastWrong.add(h.id);
      lastRight.delete(h.id);
    }
  }
  let pool = QUIZ.filter((q) => (opts.lessonId ? q.lessonId === opts.lessonId : !opts.topics.length || opts.topics.includes(q.topic)));
  if (opts.wrongOnly) pool = pool.filter((q) => lastWrong.has(q.id));
  // 未做过的优先，其次是做错的
  const rank = (id: string) => (lastWrong.has(id) ? 1 : lastRight.has(id) ? 2 : 0);
  pool = shuffle(pool).sort((a, b) => rank(a.id) - rank(b.id));
  return pool.slice(0, opts.count).map((q) =>
    shuffleOptions({ id: q.id, topic: topicName(q.topic), prompt: q.prompt, options: q.options, answer: q.answer, explanation: q.explanation, scene: q.scene }),
  );
}

const SYSTEM_ZH: Record<Numbering, string> = { fdi: "FDI", uni: "通用编号", pal: "Palmer" };
const SYSTEM_EN: Record<Numbering, string> = { fdi: "FDI", uni: "Universal", pal: "Palmer" };
const systemName = (n: Numbering) => tr(SYSTEM_ZH[n], SYSTEM_EN[n]);

function convertSet(count: number): RunQ[] {
  const out: RunQ[] = [];
  const systems: Numbering[] = ["fdi", "uni", "pal"];
  for (let i = 0; i < count; i++) {
    const fdi = ALL_FDI[Math.floor(Math.random() * 32)];
    const mode = Math.random();
    if (mode < 0.3) {
      // 编号 → 牙名
      const sys = systems[Math.floor(Math.random() * 3)];
      const wrong = shuffle(ALL_FDI.filter((f) => f !== fdi && (f % 10 === fdi % 10 || Math.floor(f / 10) === Math.floor(fdi / 10)))).slice(0, 3);
      out.push(
        shuffleOptions({
          id: `num:${fdi}:${sys}:name`,
          topic: tr("牙位记录", "Tooth numbering"),
          prompt: tr(`${SYSTEM_ZH[sys]} 记录为「${formatTooth(fdi, sys)}」的牙是？`, `Which tooth is ${SYSTEM_EN[sys]} “${formatTooth(fdi, sys)}”?`),
          options: [toothName(fdi), ...wrong.map(toothName)],
          answer: 0,
          explanation: explainNumber(fdi),
          reveal: `tooth-${fdi}`,
        }),
      );
      continue;
    }
    const [from, to] = shuffle(systems).slice(0, 2);
    const near = new Set<number>();
    const q = Math.floor(fdi / 10);
    const p = fdi % 10;
    const mirror = { 1: 2, 2: 1, 3: 4, 4: 3 }[q as 1]! * 10 + p;
    const opposite = { 1: 4, 4: 1, 2: 3, 3: 2 }[q as 1]! * 10 + p;
    near.add(mirror).add(opposite);
    if (p < 8) near.add(q * 10 + p + 1);
    if (p > 1) near.add(q * 10 + p - 1);
    near.delete(fdi);
    const wrong = shuffle([...near]).slice(0, 3);
    out.push(
      shuffleOptions({
        id: `num:${fdi}:${from}:${to}`,
        topic: tr("牙位记录", "Tooth numbering"),
        prompt: tr(`${SYSTEM_ZH[from]}「${formatTooth(fdi, from)}」换算成 ${SYSTEM_ZH[to]} 是？`, `${SYSTEM_EN[from]} “${formatTooth(fdi, from)}” in ${SYSTEM_EN[to]} is?`),
        options: [formatTooth(fdi, to), ...wrong.map((f) => formatTooth(f, to))],
        answer: 0,
        explanation: explainNumber(fdi),
        reveal: `tooth-${fdi}`,
      }),
    );
  }
  return out;
}

function explainNumber(fdi: number) {
  return tr(
    `${toothNameZh(fdi)}：FDI ${fdi}（象限 ${Math.floor(fdi / 10)}、牙位 ${fdi % 10}）＝ 通用编号 #${toUniversal(fdi)} ＝ Palmer ${toPalmer(fdi)}。通用编号从上颌右侧第三磨牙 #1 开始，沿上牙弓到 #16，再从下颌左侧第三磨牙 #17 回到 #32。`,
    `${toothNameEn(fdi)}: FDI ${fdi} (quadrant ${Math.floor(fdi / 10)}, position ${fdi % 10}) = Universal #${toUniversal(fdi)} = Palmer ${toPalmer(fdi)}. Universal numbering starts at the maxillary right third molar (#1), runs along the upper arch to #16, then continues from the mandibular left third molar (#17) back to #32.`,
  );
}

function findSet(count: number, numbering: Numbering, style: "name" | "number" | "mix"): RunQ[] {
  return shuffle(ALL_FDI)
    .slice(0, count)
    .map((fdi) => {
      const byName = style === "name" || (style === "mix" && Math.random() < 0.5);
      return {
        id: `find:${fdi}`,
        topic: tr("3D 找牙", "Find in 3D"),
        prompt: byName ? toothName(fdi) : `${systemName(numbering)} ${formatTooth(fdi, numbering)}`,
        sub: byName ? tr("请在模型上点击这颗牙", "Click this tooth on the model") : tr("请在模型上点击这个牙位", "Click this tooth position on the model"),
        options: [],
        answer: -1,
        explanation: explainNumber(fdi),
        pickFdi: fdi,
      };
    });
}

const IDENTIFY_CATS: CategoryId[] = ["maxilla", "mandible", "tmj", "sinus", "nerves", "arteries", "veins", "muscles", "skull"];

function identifySet(manifestKeys: string[], count: number): RunQ[] {
  const byBase = new Map<string, string>();
  for (const k of manifestKeys) {
    if (/-\d\d$/.test(k)) continue;
    const cat = categoryOf(k);
    if (!IDENTIFY_CATS.includes(cat)) continue;
    const info = describe(k).info;
    if (!info) continue;
    const base = baseIdOf(k);
    if (!byBase.has(base) || sideOfKey(k) === "right") byBase.set(base, k);
  }
  const all = [...byBase.entries()];
  return shuffle(all)
    .slice(0, count)
    .map(([base, key]) => {
      const cat = categoryOf(key);
      const name = nameOf(describe(key).info!);
      const peers = shuffle(all.filter(([b, k]) => b !== base && categoryOf(k) === cat)).map(([, k]) => nameOf(describe(k).info!));
      const others = shuffle(all.filter(([b]) => b !== base)).map(([, k]) => nameOf(describe(k).info!));
      const wrong = [...new Set([...peers, ...others])].filter((n) => n !== name).slice(0, 3);
      const neuro = cat === "nerves" || cat === "arteries" || cat === "veins";
      const layers: CategoryId[] = neuro
        ? ["teeth", "maxilla", "mandible", cat]
        : cat === "muscles" || cat === "skull"
          ? ["teeth", "maxilla", "mandible", "skull", "tmj", cat]
          : ["teeth", "gingiva", "alveolar", "maxilla", "mandible", "skull", cat];
      return shuffleOptions({
        id: `id:${base}`,
        topic: tr(CATEGORY_BY_ID[cat].label, CATEGORY_BY_ID[cat].labelEn),
        prompt: tr("高亮（橙色）的结构是？", "Which structure is highlighted (orange)?"),
        options: [name, ...wrong],
        answer: 0,
        explanation: describe(key).info!.summary,
        scene: {
          layers: [...new Set(layers)],
          // 目标所在类别保持不透明，其余结构半透明，避免目标被遮挡
          ghost: [...new Set(layers)].filter((c) => c !== cat),
        },
        highlight: key,
        reveal: key,
      });
    });
}

// ---------------------------------------------------------------- 组件

export function QuizPanel() {
  const [run, setRun] = useState<{ kind: Kind; qs: RunQ[]; i: number; answers: (number | null)[]; picked: (number | null)[] } | null>(null);
  const launch = useStore((s) => s.quizLaunch);
  const t = useT();

  useEffect(() => {
    if (launch?.lessonId) {
      setRun({ kind: "knowledge", qs: knowledgeSet({ topics: [], lessonId: launch.lessonId, count: 50, wrongOnly: false }), i: 0, answers: [], picked: [] });
    }
  }, [launch]);

  // 离开测验时清理拦截器与高亮，并把三维场景恢复为默认（测验会改动图层与透明度）
  const touched = useRef(false);
  useEffect(() => {
    if (run) touched.current = true;
  }, [run]);
  useEffect(
    () => () => {
      setState({ pickInterceptor: null, quizHighlight: null });
      if (touched.current) actions.resetAll();
    },
    [],
  );

  if (!run) return <QuizHome onStart={(kind, qs) => setRun({ kind, qs, i: 0, answers: [], picked: [] })} />;
  if (!run.qs.length)
    return (
      <div className="empty-state">
        {t("没有符合条件的题目。", "No questions match these settings.")}
        <div style={{ marginTop: 12 }}><button className="btn" onClick={() => setRun(null)}>{t("返回", "Back")}</button></div>
      </div>
    );
  if (run.i >= run.qs.length) return <QuizSummary run={run} onExit={() => setRun(null)} onRetry={(qs) => setRun({ kind: run.kind, qs, i: 0, answers: [], picked: [] })} />;
  return (
    <QuizRunner
      key={run.i}
      q={run.qs[run.i]}
      index={run.i}
      total={run.qs.length}
      kind={run.kind}
      onAnswer={(correct, picked) => {
        actions.recordQuiz(run.qs[run.i].id, correct);
        setRun((r) => r && { ...r, answers: [...r.answers, correct ? 1 : 0], picked: [...r.picked, picked] });
      }}
      onNext={() => setRun((r) => r && { ...r, i: r.i + 1 })}
      onExit={() => setRun(null)}
    />
  );
}

function QuizHome({ onStart }: { onStart: (k: Kind, qs: RunQ[]) => void }) {
  const engine = useEngine();
  const numbering = useStore((s) => s.numbering);
  const history = useStore((s) => s.progress.quiz);
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [count, setCount] = useState(10);
  const [findStyle, setFindStyle] = useState<"name" | "number" | "mix">("mix");
  const t = useT();
  const lang = useLang();

  const stats = useMemo(() => {
    const total = history.length;
    const correct = history.filter((h) => h.correct).length;
    const byTopic = new Map<string, { n: number; c: number }>();
    const en = lang === "en";
    const topicOf = new Map(QUIZ.map((q) => [q.id, en ? TOPIC_EN[q.topic] : TOPIC_ZH[q.topic]]));
    for (const h of history) {
      const tp =
        topicOf.get(h.id) ??
        (h.id.startsWith("find:")
          ? en ? "Find in 3D" : "3D 找牙"
          : h.id.startsWith("num:")
            ? en ? "Numbering conversion" : "牙位换算"
            : h.id.startsWith("id:")
              ? en ? "Structure ID" : "结构识别"
              : en ? "Other" : "其他");
      const v = byTopic.get(tp) ?? { n: 0, c: 0 };
      v.n++;
      if (h.correct) v.c++;
      byTopic.set(tp, v);
    }
    const last = new Map<string, boolean>();
    for (const h of history) last.set(h.id, h.correct);
    const wrong = QUIZ.filter((q) => last.get(q.id) === false).length;
    return { total, correct, byTopic: [...byTopic.entries()].sort((a, b) => b[1].n - a[1].n), wrong };
  }, [history, lang]);

  const allTopics = [...new Set(QUIZ.map((q) => q.topic))];
  const toggleTopic = (tp: QuizTopic) => setTopics((ts) => (ts.includes(tp) ? ts.filter((x) => x !== tp) : [...ts, tp]));

  return (
    <div className="scroll sidebar-body quiz-home">
      <div>
        <div className="eyebrow">{t("自我检测", "Self-assessment")}</div>
        <h2 className="panel-title" style={{ fontSize: 18, margin: "2px 0 10px" }}>{t("测验与练习", "Quiz & practice")}</h2>
        <AiNotice variant="card" />
        <div className="stats">
          <div className="stat"><b>{stats.total}</b><small>{t("累计答题", "Answered")}</small></div>
          <div className="stat"><b>{stats.total ? Math.round((stats.correct / stats.total) * 100) : 0}%</b><small>{t("正确率", "Accuracy")}</small></div>
          <div className="stat"><b>{stats.wrong}</b><small>{t("错题待复习", "To review")}</small></div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 6 }}>
        <h3>{t(`知识测验 · 题库 ${QUIZ.length} 题`, `Knowledge quiz · ${QUIZ.length} questions`)}</h3>
        <ZhOnlyNote compact />
        <div className="topic-grid">
          <button className="btn sm" aria-pressed={!topics.length} onClick={() => setTopics([])}>{t("全部主题", "All topics")}</button>
          {allTopics.map((tp) => (
            <button key={tp} className="btn sm" aria-pressed={topics.includes(tp)} onClick={() => toggleTopic(tp)}>
              {lang === "en" ? TOPIC_EN[tp] : TOPIC_ZH[tp]} <span className="faint">{QUIZ.filter((q) => q.topic === tp).length}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <span className="muted" style={{ fontSize: 12.5 }}>{t("题数", "Questions")}</span>
          <div className="seg">
            {[10, 20, 50].map((n) => <button key={n} aria-pressed={count === n} onClick={() => setCount(n)}>{n}</button>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => onStart("knowledge", knowledgeSet({ topics, count, wrongOnly: false }))}>
            <ListChecks size={15} />{t("开始测验", "Start quiz")}
          </button>
          <button className="btn" disabled={!stats.wrong} onClick={() => onStart("knowledge", knowledgeSet({ topics: [], count: 50, wrongOnly: true }))}>
            <RotateCcw size={15} />{t("重练错题", "Retry missed")}（{stats.wrong}）
          </button>
        </div>
      </div>

      <div className="section">
        <h3>{t("三维互动练习", "Interactive 3D practice")}</h3>
        <button className="quiz-mode-card" onClick={() => onStart("find", findSet(10, numbering, findStyle))}>
          <span className="ico"><CircleDot size={20} /></span>
          <span>
            <b>{t("3D 找牙", "Find the tooth in 3D")}</b>
            <small>{t(`给出牙名或牙位号，在模型上点出这颗牙。共 10 题，按当前记录法（${SYSTEM_ZH[numbering]}）出题。`, `Given a tooth name or number, click that tooth on the model. 10 questions, using the current numbering (${SYSTEM_EN[numbering]}).`)}</small>
            <span className="seg" style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
              {(["mix", "name", "number"] as const).map((s) => (
                <button key={s} aria-pressed={findStyle === s} onClick={() => setFindStyle(s)}>{s === "mix" ? t("混合", "Mixed") : s === "name" ? t("按名称", "By name") : t("按编号", "By number")}</button>
              ))}
            </span>
          </span>
        </button>
        <button className="quiz-mode-card" style={{ marginTop: 8 }} onClick={() => onStart("convert", convertSet(10))}>
          <span className="ico"><Hash size={20} /></span>
          <span><b>{t("牙位编号换算", "Numbering conversion")}</b><small>{t("在 FDI、通用编号和 Palmer 之间互相换算，并把编号与牙名对应。共 10 题。", "Convert between FDI, Universal and Palmer, and match numbers to tooth names. 10 questions.")}</small></span>
        </button>
        <button className="quiz-mode-card" style={{ marginTop: 8 }} disabled={!engine?.manifest} onClick={() => engine && onStart("identify", identifySet(Object.keys(engine.manifest.meshes), 10))}>
          <span className="ico"><Bone size={20} /></span>
          <span><b>{t("结构识别", "Structure identification")}</b><small>{t("模型高亮一个骨、肌肉、神经或血管，选出它的名称。共 10 题。", "A bone, muscle, nerve or vessel is highlighted; choose its name. 10 questions.")}</small></span>
        </button>
      </div>

      {stats.byTopic.length > 0 && (
        <div className="section">
          <h3>{t("各主题掌握情况", "Mastery by topic")}</h3>
          <div className="bars">
            {stats.byTopic.map(([tp, v]) => (
              <div className="bar-row" key={tp}>
                <span>{tp}</span>
                <span className="track"><i style={{ width: `${(v.c / v.n) * 100}%` }} /></span>
                <b>{Math.round((v.c / v.n) * 100)}%</b>
              </div>
            ))}
          </div>
          <button className="btn sm ghost" style={{ marginTop: 8 }} onClick={() => confirm(t("确定清空全部学习记录（课程进度、查看记录与答题记录）？", "Clear all learning records (lesson progress, viewing history and quiz answers)?")) && actions.resetProgress()}>
            {t("清空学习记录", "Clear learning records")}
          </button>
        </div>
      )}
    </div>
  );
}

function QuizRunner({
  q,
  index,
  total,
  kind,
  onAnswer,
  onNext,
  onExit,
}: {
  q: RunQ;
  index: number;
  total: number;
  kind: Kind;
  onAnswer: (correct: boolean, picked: number | null) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [pickResult, setPickResult] = useState<{ ok: boolean; fdi: number | null } | null>(null);
  const answered = picked !== null || pickResult !== null;
  const t = useT();

  // 进入题目：设置 3D 场景
  useEffect(() => {
    if (kind === "find") {
      actions.applyScene({ layers: ["teeth", "gingiva"], view: index % 3 === 0 ? "occlusal-lower" : index % 3 === 1 ? "occlusal-upper" : "front" });
      setState({ labels: false, selected: null, quizHighlight: null });
      setState({
        pickInterceptor: (key: string) => {
          const m = key.match(/-(\d\d)$/);
          const fdi = m ? Number(m[1]) : null;
          if (fdi === null) return;
          const ok = fdi === q.pickFdi;
          setPickResult({ ok, fdi });
          setState({ pickInterceptor: null, quizHighlight: `tooth-${q.pickFdi}`, selected: ok ? null : `tooth-${fdi}` });
          onAnswer(ok, fdi);
        },
      });
    } else if (kind === "identify" && q.highlight) {
      actions.applyScene(q.scene);
      setState({ quizHighlight: q.highlight, labels: false, selected: null, pickInterceptor: () => undefined });
      actions.focus(q.highlight);
    } else if (q.scene) {
      actions.applyScene(q.scene);
      setState({ quizHighlight: null, pickInterceptor: null });
    } else setState({ quizHighlight: null, pickInterceptor: null });
    return () => setState({ pickInterceptor: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, index]);

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    const ok = i === q.answer;
    onAnswer(ok, i);
    if (q.reveal && kind !== "find") {
      setState({ quizHighlight: null, pickInterceptor: null });
      if (kind === "identify") actions.select(q.reveal);
      else actions.reveal(q.reveal, categoryOf(q.reveal));
    }
  };

  const correct = kind === "find" ? pickResult?.ok : picked === q.answer;
  const letters = "ABCDEF";

  return (
    <div className="scroll sidebar-body quiz-card">
      <div className="quiz-progress">
        <span className="chip">{q.topic}</span>
        <div className="progress-bar"><i style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} /></div>
        <span className="mono">{index + 1}/{total}</span>
        <button className="btn sm icon ghost" onClick={onExit} aria-label={t("退出测验", "Exit quiz")}><X size={15} /></button>
      </div>

      {kind === "find" ? (
        <>
          <div className="quiz-prompt">
            <div className="eyebrow">{q.sub}</div>
            <div style={{ fontSize: 22, marginTop: 4 }}>{q.prompt}</div>
          </div>
          {!pickResult && <div className="hint-box" style={{ margin: 0 }}>{t("拖动可旋转模型；在牙齿上单击作答。", "Drag to rotate the model; click a tooth to answer.")}</div>}
          {document.getElementById("stage-overlay") &&
            createPortal(
              <div className={`panel pick-prompt ${pickResult ? (pickResult.ok ? "ok" : "bad") : ""}`}>
                <small>{pickResult ? (pickResult.ok ? t("回答正确（橙色为目标牙）", "Correct (target tooth in orange)") : t(`你点的是 ${toothNameZh(pickResult.fdi!)}，橙色为正确位置`, `You clicked the ${toothNameEn(pickResult.fdi!).toLowerCase()}; the correct tooth is in orange`)) : q.sub}</small>
                <b>{q.prompt}</b>
              </div>,
              document.getElementById("stage-overlay")!,
            )}
        </>
      ) : (
        <>
          {kind === "knowledge" && <ZhOnlyNote compact />}
          <div className="quiz-prompt">{q.prompt}</div>
          <div className="options">
            {q.options.map((o, i) => {
              const cls = answered ? (i === q.answer ? "correct" : i === picked ? "wrong" : "") : "";
              return (
                <button key={i} className={`option ${cls}`} disabled={answered} onClick={() => choose(i)}>
                  <span className="letter">{answered && i === q.answer ? <Check size={14} /> : answered && i === picked ? <X size={14} /> : letters[i]}</span>
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {answered && (
        <div className={`feedback ${correct ? "ok" : "bad"}`}>
          <b>{correct ? t("✓ 回答正确", "✓ Correct") : t("✗ 回答错误", "✗ Incorrect")}</b>
          {q.explanation}
        </div>
      )}
      {answered && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="btn primary" onClick={onNext} autoFocus>
            {index + 1 < total ? t("下一题", "Next") : t("查看结果", "See results")}<ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function QuizSummary({
  run,
  onExit,
  onRetry,
}: {
  run: { kind: Kind; qs: RunQ[]; answers: (number | null)[]; picked: (number | null)[] };
  onExit: () => void;
  onRetry: (qs: RunQ[]) => void;
}) {
  useEffect(() => {
    setState({ pickInterceptor: null, quizHighlight: null });
  }, []);
  const right = run.answers.filter((a) => a === 1).length;
  const pct = Math.round((right / run.qs.length) * 100);
  const wrongQs = run.qs.filter((_, i) => run.answers[i] !== 1);
  const t = useT();
  const lessonTitle = (id: string) => LESSONS.find((l) => QUIZ.find((q) => q.id === id)?.lessonId === l.id)?.title;
  return (
    <div className="scroll sidebar-body quiz-card">
      <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
        <Trophy size={34} color="var(--accent)" />
        <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "var(--mono)" }}>{pct}%</div>
        <div className="muted">
          {t(`答对 ${right} / ${run.qs.length} 题 `, `${right} / ${run.qs.length} correct `)}
          {pct >= 90 ? t("· 掌握得很好！", "· Excellent!") : pct >= 60 ? t("· 继续巩固", "· Keep practicing") : t("· 建议回顾相关课程", "· Review the related lessons")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "12px 0" }}>
        {wrongQs.length > 0 && <button className="btn primary" onClick={() => onRetry(wrongQs.map(shuffleOptions))}><RotateCcw size={15} />{t("重做错题", "Redo missed")}</button>}
        <button className="btn" onClick={onExit}>{t("返回测验首页", "Back to quiz home")}</button>
      </div>
      {wrongQs.length > 0 && (
        <div className="section">
          <h3>{t("错题回顾", "Review missed questions")}</h3>
          {wrongQs.map((q) => (
            <div key={q.id} className="feedback bad" style={{ marginTop: 8 }}>
              <b>{q.prompt}{q.pickFdi ? t(`（${toothNameZh(q.pickFdi)}）`, ` (${toothNameEn(q.pickFdi)})`) : ""}</b>
              {q.options.length > 0 && <div style={{ margin: "4px 0" }}>{t("正确答案：", "Correct answer: ")}<strong>{q.options[q.answer]}</strong></div>}
              <div>{q.explanation}</div>
              {lessonTitle(q.id) && <div className="source-note">{t("相关课程：", "Related lesson: ")}{lessonTitle(q.id)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
