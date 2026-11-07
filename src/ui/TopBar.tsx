import { Activity, BookOpen, ClipboardList, Box, Camera, CircleHelp, GraduationCap, Languages, Library, Moon, Search, Settings2, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore, setState, type Mode, type Quality } from "../state/store";
import { useT } from "../i18n";
import type { Numbering } from "../anatomy/notation";
import { useEngine } from "../app/services";
import { AiNotice } from "./AiNotice";

const MODES: { id: Mode; zh: string; en: string; icon: typeof Box }[] = [
  { id: "explore", zh: "探索", en: "Explore", icon: Box },
  { id: "learn", zh: "课程", en: "Lessons", icon: BookOpen },
  { id: "disease", zh: "病变", en: "Disease", icon: Activity },
  { id: "chart", zh: "病历", en: "Chart", icon: ClipboardList },
  { id: "quiz", zh: "测验", en: "Quiz", icon: GraduationCap },
  { id: "glossary", zh: "术语", en: "Glossary", icon: Library },
];

/** 设置菜单：语言、画质、牙位记录法、深浅色 —— 在任何模式下都可用 */
function SettingsMenu() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lang = useStore((s) => s.lang);
  const quality = useStore((s) => s.quality);
  const numbering = useStore((s) => s.numbering);
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);
  const QUALITIES: [Quality, string, string, string, string][] = [
    ["auto", "自动", "Auto", "按显卡性能自动选择", "Chosen from your GPU"],
    ["smooth", "流畅", "Smooth", "降低分辨率、简化材质，适合集成显卡", "Lower resolution and simpler materials, for integrated GPUs"],
    ["high", "高清", "High", "完整材质与最高分辨率", "Full materials at full resolution"],
  ];
  return (
    <div className="settings-wrap" ref={ref}>
      <button className="btn icon ghost" aria-expanded={open} aria-label={t("设置", "Settings")} title={t("设置：语言、画质…", "Settings: language, quality…")} onClick={() => setOpen(!open)}>
        <Settings2 size={18} />
      </button>
      {open && (
        <div className="panel settings-pop" role="dialog" aria-label={t("设置", "Settings")}>
          <div className="settings-row">
            <span>{t("界面语言", "Language")}</span>
            <div className="seg" role="group">
              <button aria-pressed={lang === "zh"} onClick={() => setState({ lang: "zh" })}>中文</button>
              <button aria-pressed={lang === "en"} onClick={() => setState({ lang: "en" })}>English</button>
            </div>
          </div>
          <div className="settings-row">
            <span>{t("画质", "Quality")}</span>
            <div className="seg" role="group">
              {QUALITIES.map(([q, zh, en, tipZh, tipEn]) => (
                <button key={q} aria-pressed={quality === q} title={t(tipZh, tipEn)} onClick={() => setState({ quality: q })}>{t(zh, en)}</button>
              ))}
            </div>
          </div>
          <div className="muted settings-hint">
            {t("卡顿时选“流畅”；独立显卡可选“高清”。", "Pick “Smooth” if it stutters; “High” for dedicated GPUs.")}
          </div>
          <div className="settings-row">
            <span>{t("牙位记录法", "Tooth numbering")}</span>
            <div className="seg" role="group">
              {(["fdi", "uni", "pal"] as Numbering[]).map((n) => (
                <button key={n} aria-pressed={numbering === n} onClick={() => setState({ numbering: n })}>
                  {n === "fdi" ? "FDI" : n === "uni" ? t("通用", "Universal") : "Palmer"}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <span>{t("外观", "Theme")}</span>
            <div className="seg" role="group">
              <button aria-pressed={theme === "light"} onClick={() => setState({ theme: "light" })}><Sun size={14} />{t("浅色", "Light")}</button>
              <button aria-pressed={theme === "dark"} onClick={() => setState({ theme: "dark" })}><Moon size={14} />{t("深色", "Dark")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Logo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <path
        fill="currentColor"
        d="M20 6c-9 0-15 7-14 17 1 8 4 13 6 20 2 8 3 15 7 15 5 0 5-10 8-16 2-4 4-4 6 0 3 6 3 16 8 16 4 0 5-7 7-15 2-7 5-12 6-20 1-10-5-17-14-17-6 0-8 3-12 3S26 6 20 6z"
      />
    </svg>
  );
}

export function TopBar() {
  const mode = useStore((s) => s.mode);
  const engine = useEngine();
  const t = useT();
  const lang = useStore((s) => s.lang);

  const snapshot = () => {
    if (!engine) return;
    const a = document.createElement("a");
    a.href = engine.snapshot();
    a.download = `OralAtlas-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
    a.click();
  };

  return (
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setState({ mode: "explore" }); }}>
        <span className="brand-mark"><Logo /></span>
        <span>
          <div className="brand-name">OralAtlas</div>
          <div className="brand-sub">{t("口腔三维解剖图谱", "3D Oral & Dental Atlas")}</div>
        </span>
      </a>
      <nav className="modes" aria-label={t("模式", "Modes")}>
        {MODES.map((m) => (
          <button key={m.id} aria-current={mode === m.id ? "page" : undefined} onClick={() => setState({ mode: m.id, pickInterceptor: null, quizHighlight: null })}>
            <m.icon size={17} />
            {t(m.zh, m.en)}
          </button>
        ))}
      </nav>
      <div className="topbar-spacer" />
      <AiNotice variant="chip" />
      <button className="search-trigger" onClick={() => setState({ searchOpen: true })} aria-label={t("搜索", "Search")}>
        <Search size={16} />
        <span>{t("搜索牙位、结构、术语…", "Search teeth, structures, terms…")}</span>
        <kbd>/</kbd>
      </button>
      <button className="btn sm ghost lang-toggle" onClick={() => setState({ lang: lang === "en" ? "zh" : "en" })} title={t("Switch to English", "切换为中文")} aria-label={t("Switch to English", "切换为中文")}>
        <Languages size={16} />
        {lang === "en" ? "中文" : "EN"}
      </button>
      <button className="btn icon ghost tooltip-btn hide-mobile" data-tip={t("保存当前画面", "Save screenshot")} onClick={snapshot} aria-label={t("保存当前画面", "Save screenshot")}><Camera size={18} /></button>
      <SettingsMenu />
      <button className="btn icon ghost" onClick={() => setState({ aboutOpen: true })} aria-label={t("关于与帮助", "About & help")}><CircleHelp size={18} /></button>
    </header>
  );
}
