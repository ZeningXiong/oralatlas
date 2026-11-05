// 内容来源声明：全站统一的“AI 辅助编写、审校中”提示
import { Info } from "lucide-react";
import { setState } from "../state/store";
import { useLang, useT, type Lang } from "../i18n";

export const AI_NOTICE_SHORT = "内容由 AI 辅助编写，正在审校中";
export const AI_NOTICE_LONG =
  "本站的教学文字（牙型指南、结构释义、课程、题库、术语表）由 AI（Claude）辅助编写，尚未经口腔专业人员逐条审校。撰写时参照了国内《口腔解剖生理学》教材的体系与规范名词，但没有逐条对照教材原文；部分事实与开源项目 Dental Scope 的英文资料交叉核对过。数值、发生率和临床操作参数请以教材和授课教师为准。发现错误欢迎反馈。";

export const AI_NOTICE_SHORT_EN = "AI-assisted content, under review";
export const AI_NOTICE_LONG_EN =
  "The teaching text on this site (tooth guides, structure descriptions, lessons, question bank, glossary) was written with the help of AI (Claude) and has not yet been reviewed item by item by dental professionals. It follows the structure and standard terminology of Chinese oral anatomy and physiology textbooks, but was not checked line by line against any textbook; some facts were cross-checked against the English materials of the open-source Dental Scope project. For values, prevalence figures and clinical parameters, rely on your textbooks and instructors. Error reports are welcome.";

export const aiShort = (lang: Lang) => (lang === "en" ? AI_NOTICE_SHORT_EN : AI_NOTICE_SHORT);
export const aiLong = (lang: Lang) => (lang === "en" ? AI_NOTICE_LONG_EN : AI_NOTICE_LONG);

/** compact：一行小字；card：带说明的提示框 */
export function AiNotice({ variant = "compact" }: { variant?: "compact" | "card" | "chip" }) {
  const lang = useLang();
  const t = useT();
  const open = () => setState({ aboutOpen: true });
  if (variant === "chip") {
    return (
      <button className="chip warn ai-chip" onClick={open} title={aiLong(lang)}>
        <Info size={12} />
        {lang === "en" ? "AI-assisted · in review" : aiShort(lang)}
      </button>
    );
  }
  if (variant === "card") {
    return (
      <div className="ai-notice card" role="note">
        <Info size={15} />
        <span>
          <b>{aiShort(lang)}{t("。", ". ")}</b>
          {lang === "en" ? AI_NOTICE_LONG_EN.replace(/^The teaching text on this site/, "The teaching text") : AI_NOTICE_LONG.replace(/^本站的教学文字/, "教学文字")}
        </span>
      </div>
    );
  }
  return (
    <div className="ai-notice" role="note">
      <Info size={12} />
      <span>
        {aiShort(lang)}
        {t("，请以教材和授课教师为准。", ". Rely on your textbooks and instructors. ")}
        <button className="link" onClick={open}>{t("了解详情", "Learn more")}</button>
      </span>
    </div>
  );
}
