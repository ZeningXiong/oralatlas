import { ArrowLeft, ArrowRight, Box, CheckCircle2, Clock, GraduationCap, Target } from "lucide-react";
import { useEffect, useRef } from "react";
import { LESSONS } from "../../content/lessons";
import { QUIZ } from "../../content/quiz";
import { actions, setState, useStore } from "../../state/store";
import { Rich } from "../rich";
import { AiNotice } from "../AiNotice";
import { ZhOnlyNote } from "../ZhOnlyNote";
import { useT } from "../../i18n";

export function LessonPanel() {
  const lessonId = useStore((s) => s.lessonId);
  return lessonId ? <LessonReader id={lessonId} /> : <LessonList />;
}

function LessonList() {
  const t = useT();
  const progress = useStore((s) => s.progress);
  const lessons = [...LESSONS].sort((a, b) => a.order - b.order);
  const done = progress.lessonsDone.length;
  const totalMin = lessons.reduce((a, l) => a + l.minutes, 0);
  return (
    <>
      <div className="panel-head" style={{ display: "block" }}>
        <div className="eyebrow">{t("系统课程", "Course")}</div>
        <h2 className="panel-title" style={{ fontSize: 18, margin: "2px 0 8px" }}>{t("口腔解剖生理学 · 三维导学", "Oral Anatomy & Physiology · 3D guided lessons")}</h2>
        <div className="progress-bar"><i style={{ width: `${(done / Math.max(lessons.length, 1)) * 100}%` }} /></div>
        <AiNotice />
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          {t(
            `已完成 ${done} / ${lessons.length} 课 · 全部约 ${Math.round(totalMin / 6) / 10} 小时`,
            `${done} / ${lessons.length} lessons completed · about ${Math.round(totalMin / 6) / 10} h in total`,
          )}
        </div>
        <div style={{ marginTop: 6 }}><ZhOnlyNote compact /></div>
      </div>
      <div className="scroll sidebar-body lesson-list">
        {lessons.map((l) => {
          const read = progress.lessonsRead[l.id] ?? 0;
          const isDone = progress.lessonsDone.includes(l.id);
          return (
            <button key={l.id} className={`lesson-card ${isDone ? "done" : ""}`} onClick={() => setState({ lessonId: l.id, lessonSection: 0 })}>
              <span className="lesson-num">{isDone ? <CheckCircle2 size={18} /> : String(l.order).padStart(2, "0")}</span>
              <span style={{ minWidth: 0 }}>
                <b>{l.title}</b>
                <small>{l.subtitle}</small>
                <small style={{ display: "flex", gap: 10, marginTop: 2 }}>
                  <span><Clock size={11} style={{ verticalAlign: -1 }} /> {l.minutes} {t("分钟", "min")}</span>
                  <span>{l.sections.length} {t("节", l.sections.length === 1 ? "section" : "sections")}</span>
                </small>
                {read > 0 && !isDone && <div className="progress-bar"><i style={{ width: `${(read / l.sections.length) * 100}%` }} /></div>}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function LessonReader({ id }: { id: string }) {
  const t = useT();
  const lesson = LESSONS.find((l) => l.id === id);
  const active = useStore((s) => s.lessonSection);
  const done = useStore((s) => s.progress.lessonsDone.includes(id));
  const bodyRef = useRef<HTMLDivElement>(null);
  const sorted = [...LESSONS].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((l) => l.id === id);
  const quizCount = QUIZ.filter((q) => q.lessonId === id).length;

  // 切换到某一节时：应用该节的 3D 场景，并滚动到该节
  useEffect(() => {
    if (!lesson) return;
    const sec = lesson.sections[active];
    if (sec?.scene) actions.applyScene(sec.scene);
    actions.markLessonRead(id, active + 1);
    bodyRef.current?.querySelector(`[data-sec="${active}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [id, active, lesson]);

  if (!lesson) return <div className="empty-state">{t("课程不存在。", "Lesson not found.")}</div>;

  return (
    <>
      <div className="reader-head">
        <button className="btn sm ghost" onClick={() => setState({ lessonId: null })} style={{ marginLeft: -8 }}>
          <ArrowLeft size={14} />{t("全部课程", "All lessons")}
        </button>
        <div className="eyebrow" style={{ marginTop: 8 }}>{t(`第 ${lesson.order} 课 · ${lesson.minutes} 分钟`, `Lesson ${lesson.order} · ${lesson.minutes} min`)}</div>
        <h2>{lesson.title}</h2>
        <div className="muted" style={{ fontSize: 13 }}>{lesson.subtitle}</div>
      </div>
      <div className="scroll sidebar-body reader" ref={bodyRef}>
        <div style={{ marginTop: 12 }}><AiNotice variant="card" /></div>
        <div style={{ marginTop: 8 }}><ZhOnlyNote compact /></div>
        <div className="objectives">
          <div className="eyebrow" style={{ color: "var(--accent)" }}><Target size={12} style={{ verticalAlign: -1 }} /> {t("学习目标", "Objectives")}</div>
          <ul>{lesson.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
        {lesson.sections.map((s, i) => (
          <section
            key={i}
            data-sec={i}
            className={`lesson-section ${i === active ? "active" : ""}`}
            onClick={() => i !== active && setState({ lessonSection: i })}
          >
            <h3><span className="n">{String(i + 1).padStart(2, "0")}</span>{s.heading}</h3>
            <Rich text={s.body} />
            {s.scene && (
              <button
                className={`btn sm view3d ${i === active ? "primary" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (i === active) actions.applyScene(s.scene);
                  else setState({ lessonSection: i });
                }}
              >
                <Box size={14} />{i === active ? t("重新展示 3D 场景", "Show 3D scene again") : t("在 3D 中查看", "View in 3D")}
              </button>
            )}
          </section>
        ))}
        <div className="keypoints">
          <div className="eyebrow">{t("本课要点", "Key points")}</div>
          <ol>{lesson.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ol>
        </div>
        <div className="reader-nav">
          <button className={`btn ${done ? "on" : "primary"}`} onClick={() => actions.completeLesson(id)}>
            <CheckCircle2 size={15} />{done ? t("已完成", "Completed") : t("标记为已完成", "Mark as completed")}
          </button>
          {quizCount > 0 && (
            <button className="btn" onClick={() => setState({ mode: "quiz", quizLaunch: { lessonId: id, n: Date.now() } })}>
              <GraduationCap size={15} />{t(`本课测验（${quizCount} 题）`, `Lesson quiz (${quizCount} questions)`)}
            </button>
          )}
        </div>
        <div className="reader-nav">
          {idx > 0 && (
            <button className="btn ghost" onClick={() => setState({ lessonId: sorted[idx - 1].id, lessonSection: 0 })}>
              <ArrowLeft size={14} />{sorted[idx - 1].title}
            </button>
          )}
          <span style={{ flex: 1 }} />
          {idx < sorted.length - 1 && (
            <button className="btn ghost" onClick={() => setState({ lessonId: sorted[idx + 1].id, lessonSection: 0 })}>
              {sorted[idx + 1].title}<ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
