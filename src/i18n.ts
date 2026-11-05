// 界面语言：中文 / English。
// 用法：组件里 `const t = useT(); t("探索", "Explore")`；非 React 代码用 `tr("中文", "English")`。
// 字符串就近写在使用处，避免维护一份庞大的键值表；带 nameZh/nameEn 的数据用 `nameOf()`。
import { useStore, type Lang } from "./state/store";

export type { Lang };
export type T = (zh: string, en: string) => string;

const make = (lang: Lang): T => (lang === "en" ? (_zh, en) => en : (zh) => zh);
const T_ZH = make("zh");
const T_EN = make("en");

/** React：订阅语言变化，返回翻译函数 */
export function useT(): T {
  return useStore((s) => s.lang) === "en" ? T_EN : T_ZH;
}
export function useLang(): Lang {
  return useStore((s) => s.lang);
}

/** 非 React：按当前语言取值（不订阅变化，调用方需自行在语言切换时刷新） */
export function tr(zh: string, en: string): string {
  return useStore.getState().lang === "en" ? en : zh;
}

/** 带 nameZh / nameEn 的条目取当前语言的名称（英文缺失时回退中文） */
export function nameOf(x: { nameZh: string; nameEn?: string } | null | undefined, lang: Lang = useStore.getState().lang): string {
  if (!x) return "";
  return lang === "en" ? x.nameEn || x.nameZh : x.nameZh;
}

/** 名称的“另一种语言”（用作副标题）：中文界面显示英文，英文界面显示中文 */
export function altNameOf(x: { nameZh: string; nameEn?: string } | null | undefined, lang: Lang = useStore.getState().lang): string {
  if (!x) return "";
  return lang === "en" ? x.nameZh : x.nameEn ?? "";
}

/** 同步 <html lang>，便于读屏与字体选择 */
useStore.subscribe((s, prev) => {
  if (s.lang !== prev.lang) document.documentElement.lang = s.lang === "en" ? "en" : "zh-CN";
});
document.documentElement.lang = useStore.getState().lang === "en" ? "en" : "zh-CN";
