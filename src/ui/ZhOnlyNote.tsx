import { Languages } from "lucide-react";
import { useLang } from "../i18n";

/**
 * 英文界面下，标注“正文暂只有中文”。
 * 目前只翻译了界面文字和结构/牙位名称；课程、测验、术语释义、结构详解等正文仍为中文。
 */
export function ZhOnlyNote({ compact = false }: { compact?: boolean }) {
  if (useLang() !== "en") return null;
  return (
    <div className={`zh-only-note${compact ? " compact" : ""}`} role="note">
      <Languages size={14} />
      <span>{compact ? "Text below is in Chinese only." : "Detailed text is currently available in Chinese only; English translation is in progress."}</span>
    </div>
  );
}
