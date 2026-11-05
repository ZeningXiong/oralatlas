// 极简富文本：空行分段；"- " 开头为列表项；**粗体**
import { Fragment, type ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong> : <Fragment key={`${keyBase}-${i}`}>{p}</Fragment>,
  );
}

export function Rich({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="prose">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const isList = lines.every((l) => /^[-•]\s+/.test(l) || /^\d+[.、]\s*/.test(l));
        if (isList) {
          const ordered = /^\d+[.、]/.test(lines[0]);
          const items = lines.map((l, li) => <li key={li}>{inline(l.replace(/^([-•]|\d+[.、])\s*/, ""), `${bi}-${li}`)}</li>);
          return ordered ? <ol key={bi}>{items}</ol> : <ul key={bi}>{items}</ul>;
        }
        // 段落中混有列表
        const out: ReactNode[] = [];
        let list: string[] = [];
        const flush = () => {
          if (list.length) out.push(<ul key={`l${out.length}`}>{list.map((l, li) => <li key={li}>{inline(l, `${bi}-x${li}`)}</li>)}</ul>);
          list = [];
        };
        lines.forEach((l, li) => {
          if (/^[-•]\s+/.test(l)) list.push(l.replace(/^[-•]\s+/, ""));
          else {
            flush();
            out.push(<p key={`p${li}`}>{inline(l, `${bi}-${li}`)}</p>);
          }
        });
        flush();
        return <Fragment key={bi}>{out}</Fragment>;
      })}
    </div>
  );
}

export function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
