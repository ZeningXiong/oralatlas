import { BookOpen, Bone, CircleDot, Library, MapPin, Search, Layers } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEngine } from "../app/services";
import { categoryOf } from "../anatomy/registry";
import { search, type Hit, type HitKind } from "../search";
import { actions, setState, useStore } from "../state/store";
import { highlight } from "./rich";
import { useT } from "../i18n";

const ICON: Record<HitKind, typeof Search> = {
  tooth: CircleDot,
  structure: Bone,
  tissue: Layers,
  landmark: MapPin,
  lesson: BookOpen,
  term: Library,
};
const KIND_LABEL: Record<HitKind, [string, string]> = {
  tooth: ["牙齿", "Tooth"],
  structure: ["结构", "Structure"],
  tissue: ["牙体组织", "Tissue"],
  landmark: ["标志点", "Landmark"],
  lesson: ["课程", "Lesson"],
  term: ["术语", "Term"],
};

export function openHit(h: Hit) {
  setState({ searchOpen: false });
  switch (h.kind) {
    case "tooth":
    case "structure":
      setState({ mode: "explore", pickInterceptor: null });
      actions.reveal(h.id, categoryOf(h.id));
      break;
    case "landmark":
      setState({ mode: "explore", pickInterceptor: null });
      actions.reveal(h.id, null);
      break;
    case "tissue": {
      setState({ mode: "explore", pickInterceptor: null });
      const fdi = Number(h.id.slice(-2));
      actions.enterDissect(fdi);
      setState({ selected: h.id });
      break;
    }
    case "lesson": {
      const [lessonId, section] = h.payload as [string, number];
      setState({ mode: "learn", lessonId, lessonSection: section });
      break;
    }
    case "term":
      setState({ mode: "glossary", glossaryFocus: h.payload as string });
      break;
  }
}

export function SearchDialog() {
  const open = useStore((s) => s.searchOpen);
  const numbering = useStore((s) => s.numbering);
  const engine = useEngine();
  const lang = useStore((s) => s.lang);
  const t = useT();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const hits = useMemo(() => (engine?.manifest && q ? search(engine.manifest, q, numbering, lang) : []), [engine, q, numbering, lang]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${idx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  if (!open) return null;
  const close = () => setState({ searchOpen: false });

  return (
    <div className="backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="panel dialog" role="dialog" aria-label={t("搜索", "Search")}>
        <div className="search-box">
          <Search size={18} className="muted" />
          <input
            ref={inputRef}
            value={q}
            placeholder={t("输入牙位（36、#19、LL6、左下6）、结构名（下牙槽神经 / mental foramen）、术语…", "Tooth number (36, #19, LL6), structure (mental foramen / 颏孔), term…")}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && hits[idx]) openHit(hits[idx]);
              else if (e.key === "Escape") close();
            }}
            aria-label={t("搜索内容", "Search query")}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="scroll results" ref={listRef}>
          {!q && (
            <div className="empty-state" style={{ padding: 28 }}>
              <div style={{ marginBottom: 10 }}>{t("试试：", "Try:")}</div>
              <div className="related" style={{ justifyContent: "center" }}>
                {(lang === "en"
                  ? ["36", "#8", "UR6", "first molar", "inferior alveolar nerve", "mental foramen", "MB2", "periodontal ligament", "lateral pterygoid", "enamel"]
                  : ["36", "#8", "UR6", "六龄齿", "下牙槽神经", "颏孔", "MB2", "牙周膜", "翼外肌", "牙位记录法"]
                ).map((x) => (
                  <button key={x} className="chip" onClick={() => setQ(x)}>{x}</button>
                ))}
              </div>
            </div>
          )}
          {q && !hits.length && <div className="empty-state">{t(`没有找到“${q}”。可以换用中文名、英文名或牙位号再试。`, `No results for “${q}”. Try an English or Chinese name, or a tooth number.`)}</div>}
          {hits.map((h, i) => {
            const Icon = ICON[h.kind];
            return (
              <button
                key={h.kind + h.id}
                data-idx={i}
                className="result"
                aria-selected={i === idx}
                onMouseEnter={() => setIdx(i)}
                onClick={() => openHit(h)}
              >
                <span className="ico"><Icon size={16} /></span>
                <span style={{ minWidth: 0 }}>
                  <b>{highlight(h.title, q.trim())}</b>
                  <small style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.sub}</small>
                </span>
                <span className="kind">{t(...KIND_LABEL[h.kind])}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
