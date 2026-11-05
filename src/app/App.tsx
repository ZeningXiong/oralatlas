import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "../i18n";
import { useContext, useEffect, useRef, useState } from "react";
import { Engine } from "../engine/Engine";
import { EngineContext } from "./services";
import { actions, getState, setState, useStore, type ExplorePanel } from "../state/store";
import type { ViewPreset } from "../content/types";
import { categoryOf } from "../anatomy/registry";
import { TopBar } from "../ui/TopBar";
import { LayersPanel } from "../ui/explore/LayersPanel";
import { Odontogram } from "../ui/explore/Odontogram";
import { StructureTree } from "../ui/explore/StructureTree";
import { DetailPanel } from "../ui/DetailPanel";
import { Dock } from "../ui/Dock";
import { DissectBar, StageChips } from "../ui/DissectBar";
import { SearchDialog } from "../ui/SearchDialog";
import { AboutDialog, Welcome } from "../ui/AboutDialog";
import { LessonPanel } from "../ui/learn/LessonPanel";
import { QuizPanel } from "../ui/quiz/QuizPanel";
import { GlossaryPanel } from "../ui/GlossaryPanel";
import { DiseasePanel } from "../ui/disease/DiseasePanel";

const VIEW_KEYS: ViewPreset[] = ["three-quarter", "front", "right", "left", "top", "bottom", "occlusal-upper", "occlusal-lower"];

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const s = getState();
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || e.key === "/") {
        e.preventDefault();
        setState({ searchOpen: true });
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") {
        if (s.searchOpen || s.aboutOpen) setState({ searchOpen: false, aboutOpen: false });
        else if (s.selected) setState({ selected: null });
        else if (s.dissectFdi !== null) actions.exitDissect();
        else if (s.isolate) setState({ isolate: null });
        return;
      }
      if (s.searchOpen || s.aboutOpen || s.welcomeOpen) return;
      const k = e.key.toLowerCase();
      const sel = s.selected;
      const fdi = sel?.match(/-(\d\d)$/) ? Number(sel.slice(-2)) : null;
      if (k === "d" && fdi) s.dissectFdi === fdi ? actions.exitDissect() : actions.enterDissect(fdi);
      else if (k === "f" && sel) actions.focus(sel);
      else if (k === "g" && sel) actions.toggleGhosted(fdi && s.dissectFdi === null ? `tooth-${fdi}` : sel);
      else if (k === "h" && sel) {
        actions.toggleHidden(fdi && s.dissectFdi === null ? `tooth-${fdi}` : sel);
        setState({ selected: null });
      } else if (k === "l") setState({ labels: !s.labels });
      else if (k === "s") setState({ section: { ...s.section, enabled: !s.section.enabled } });
      else if (k === "r") s.dissectFdi !== null ? actions.focus(`tooth-${s.dissectFdi}`) : actions.resetCamera();
      else if (k === "n") setState({ numbering: s.numbering === "fdi" ? "uni" : s.numbering === "uni" ? "pal" : "fdi" });
      else if (/^[1-8]$/.test(k) && s.dissectFdi === null) actions.setView(VIEW_KEYS[Number(k) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** 深链接：#/tooth/36、#/s/<网格键>、#/lesson/<id> */
function useHashRouting(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
      const [kind, id] = h.split("/");
      if (kind === "tooth" && /^[1-4][1-8]$/.test(id)) {
        setState({ mode: "explore", welcomeOpen: false });
        actions.reveal(`tooth-${id}`, "teeth");
      } else if (kind === "dissect" && /^[1-4][1-8]$/.test(id)) {
        setState({ mode: "explore", welcomeOpen: false });
        actions.enterDissect(Number(id));
      } else if (kind === "s" && id) {
        setState({ mode: "explore", welcomeOpen: false });
        actions.reveal(id, categoryOf(id));
      } else if (kind === "lesson" && id) setState({ mode: "learn", lessonId: id, lessonSection: 0, welcomeOpen: false });
    };
    apply();
    window.addEventListener("hashchange", apply);
    // 状态 → 地址栏（不产生历史记录）
    const unsub = useStore.subscribe((s, p) => {
      if (s.selected === p.selected && s.dissectFdi === p.dissectFdi && s.lessonId === p.lessonId && s.mode === p.mode) return;
      let hash = "";
      if (s.mode === "learn" && s.lessonId) hash = `#/lesson/${s.lessonId}`;
      else if (s.mode === "explore" && s.dissectFdi !== null) hash = `#/dissect/${s.dissectFdi}`;
      else if (s.mode === "explore" && s.selected) hash = /^tooth-\d\d$/.test(s.selected) ? `#/tooth/${s.selected.slice(6)}` : `#/s/${s.selected}`;
      if (hash !== location.hash) history.replaceState(null, "", hash || location.pathname + location.search);
    });
    return () => {
      window.removeEventListener("hashchange", apply);
      unsub();
    };
  }, [ready]);
}

const EXPLORE_TABS: { id: ExplorePanel; label: string; en: string }[] = [
  { id: "layers", label: "图层", en: "Layers" },
  { id: "odontogram", label: "牙位图", en: "Odontogram" },
  { id: "tree", label: "结构", en: "Structures" },
];

function Sidebar() {
  const mode = useStore((s) => s.mode);
  const panel = useStore((s) => s.explorePanel);
  const collapsed = useStore((s) => s.sidebarCollapsed);
  const setCollapsed = (v: boolean) => setState({ sidebarCollapsed: v });
  const tt = useT();
  const wide = mode === "learn" || mode === "glossary" || mode === "disease";
  useEffect(() => setState({ sidebarCollapsed: window.innerWidth < 900 && mode === "explore" }), [mode]);
  return (
    <>
      <aside className={`panel sidebar ${wide ? "wide" : ""} ${collapsed ? "collapsed" : ""}`} aria-label={tt("侧栏", "Sidebar")}>
        {mode === "explore" && (
          <>
            <div className="sidebar-tabs">
              <div className="seg" role="tablist">
                {EXPLORE_TABS.map((t) => (
                  <button key={t.id} role="tab" aria-pressed={panel === t.id} onClick={() => setState({ explorePanel: t.id })}>{tt(t.label, t.en)}</button>
                ))}
              </div>
            </div>
            {panel === "layers" && <LayersPanel />}
            {panel === "odontogram" && <Odontogram />}
            {panel === "tree" && <StructureTree />}
          </>
        )}
        {mode === "learn" && <LessonPanel />}
        {mode === "quiz" && <QuizPanel />}
        {mode === "glossary" && <GlossaryPanel />}
        {mode === "disease" && <DiseasePanel />}
      </aside>
      <button className="btn mobile-sheet-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? tt("打开面板", "Open panel") : tt("收起面板", "Hide panel")}
      </button>
      <button className={`sidebar-toggle ${collapsed ? "" : "open"} ${wide ? "wide" : ""}`} onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? tt("展开侧栏", "Expand sidebar") : tt("收起侧栏", "Collapse sidebar")}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </>
  );
}

function LoadingCard() {
  const ready = useStore((s) => s.ready);
  const stage = useStore((s) => s.loadingStage);
  const progress = useStore((s) => s.loadingProgress);
  const error = useStore((s) => s.loadError);
  const t = useT();
  if (ready && !error) return null;
  return (
    <div className="panel loading-card" role="status">
      {error ? (
        <>
          <h3>{t("加载失败", "Failed to load")}</h3>
          <p className="muted">{error}</p>
          <button className="btn primary" onClick={() => location.reload()}>{t("重新加载", "Reload")}</button>
        </>
      ) : (
        <>
          <div className="spinner" />
          <h3>{stage ?? t("正在准备", "Preparing")}</h3>
          <div className="muted" style={{ fontSize: 12.5 }}>{t("首次加载约 7 MB，之后会被浏览器缓存", "About 7 MB on first visit, cached by the browser afterwards")}</div>
          <div className="progress-bar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>
        </>
      )}
    </div>
  );
}

function TeethToast() {
  const t = useStore((s) => s.teethLoading);
  const err = useStore((s) => s.teethError);
  const engine = useContext(EngineContext);
  const tt = useT();
  if (err && !t)
    return (
      <div className="panel toast" role="alert" style={{ borderColor: "var(--bad)" }}>
        <span style={{ color: "var(--bad)" }}>{err}</span>
        <button className="btn sm primary" onClick={() => { setState({ teethError: null }); const d = getState().dissectFdi; if (d !== null) void engine?.ensureTooth(d); else void engine?.ensureAllTeeth(); }}>{tt("重试", "Retry")}</button>
        <button className="btn sm ghost" onClick={() => setState({ teethError: null })}>{tt("关闭", "Dismiss")}</button>
      </div>
    );
  if (!t) return null;
  return (
    <div className="panel toast" role="status">
      <span>{tt("加载牙体内部结构", "Loading internal tooth structures")} {t.done}/{t.total}</span>
      <div className="progress-bar"><i style={{ width: `${(t.done / t.total) * 100}%` }} /></div>
    </div>
  );
}

export function App() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const theme = useStore((s) => s.theme);
  const ready = useStore((s) => s.ready);
  const mode = useStore((s) => s.mode);
  const hasDetail = useStore((s) => s.mode !== "disease" && (s.selected !== null || s.dissectFdi !== null));
  const collapsed = useStore((s) => s.sidebarCollapsed);
  useKeyboard();
  useHashRouting(ready);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 面板遮挡区域 → 引擎（让模型在可见区域内居中）
  useEffect(() => {
    if (!engine) return;
    const update = () => {
      const mobile = window.innerWidth < 900;
      const h = window.innerHeight;
      if (mobile) {
        const bottom = hasDetail ? h * 0.58 : !collapsed ? h * 0.52 : 0;
        engine.setInsets({ left: 0, right: 0, top: 0, bottom: bottom ? bottom + 64 : 0 });
      } else {
        const narrow = window.innerWidth < 1180;
        const sideW = (mode === "learn" || mode === "glossary" || mode === "disease") ? 434 : narrow ? 330 : 358;
        engine.setInsets({ left: collapsed ? 0 : sideW, right: hasDetail ? (narrow ? 364 : 406) : 0, top: 0, bottom: 64 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [engine, hasDetail, collapsed, mode]);

  useEffect(() => {
    const e = new Engine(stageRef.current!);
    if (import.meta.env.DEV || new URLSearchParams(location.search).has("debug")) Object.assign(window, { __engine: e, __store: useStore, __actions: actions });
    setEngine(e);
    void e.loadAll();
    return () => e.dispose();
  }, []);

  return (
    <EngineContext.Provider value={engine}>
      <div className="app">
        <TopBar />
        <main
          className={`main ${hasDetail && ready ? "has-detail" : ""} ${mode === "learn" || mode === "glossary" || mode === "disease" ? "sidebar-wide" : ""} ${collapsed ? "sidebar-closed" : ""}`}
        >
          <div className="stage" ref={stageRef} />
          <div id="stage-overlay" />
          {ready && (
            <>
              <Sidebar />
              {mode !== "disease" && <DetailPanel />}
              {mode !== "disease" && <DissectBar />}
              <StageChips />
              {mode !== "disease" && <Dock />}
              <TeethToast />
            </>
          )}
          <LoadingCard />
        </main>
        <SearchDialog />
        <AboutDialog />
        {ready && <Welcome />}
      </div>
    </EngineContext.Provider>
  );
}
