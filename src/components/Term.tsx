import { useState } from "react";
import { glossary } from "../data/glossary";

/** Термин с аннотацией-тултипом. Клик — показать/скрыть определение. */
export function Term({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const def = glossary[id];
  if (!def) return <span>{label}</span>;
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-help font-semibold text-tds-text underline decoration-wavy decoration-tds-yellow decoration-2 underline-offset-4"
      >
        {label}
      </button>
      {open && (
        <span className="fixed inset-x-3 top-1/2 z-50 -translate-y-1/2 rounded-tds-card border border-tds-border bg-tds-card p-3 text-left text-sm shadow-tds-pop md:absolute md:inset-auto md:left-0 md:top-full md:mt-1.5 md:w-72 md:max-w-[85vw] md:-translate-y-0 md:shadow-tds-pop">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="absolute right-2 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs text-tds-muted hover:bg-tds-neutral"
          >
            ✕
          </button>
          <span className="mb-1 block pr-6 font-bold">{def.term}</span>
          <span className="block text-tds-text">{def.def}</span>
          {def.example && (
            <span className="mt-1.5 block text-xs text-tds-muted">
              💡 {def.example}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
