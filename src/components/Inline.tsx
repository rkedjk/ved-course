import type { ReactNode } from "react";
import { Term } from "./Term";

const TOKEN = /(\[\[term:[^\]]+\]\]|\*\*[^*]+\*\*)/g;

/** Рендер текста с разметкой [[term:...]] (термин-тултип) и **жирным**. */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  text.split(TOKEN).forEach((p, i) => {
    if (!p) return;
    if (p.startsWith("[[term:")) {
      const id = p.slice(7, -2);
      parts.push(<Term key={i} id={id} label={id} />);
    } else if (p.startsWith("**") && p.endsWith("**")) {
      parts.push(
        <strong key={i} className="font-bold">
          {p.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(<span key={i}>{p}</span>);
    }
  });
  return <>{parts}</>;
}
