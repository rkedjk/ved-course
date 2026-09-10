import { useEffect, useState } from "react";
import { glossary, glossaryIds } from "../data/glossary";
import { useStore } from "../store";
import { Flashcards } from "./Flashcards";

/** Вкладка «Глоссарий»: флэш-карточки + поиск по всем терминам. */
export function GlossaryView() {
  const unlock = useStore((s) => s.unlock);
  const [q, setQ] = useState("");
  useEffect(() => {
    unlock("glossary-read");
  }, [unlock]);

  const ids = glossaryIds.filter((id) =>
    glossary[id].term.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <Flashcards />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Поиск по глоссарию…"
        className="min-h-11 w-full rounded-tds-btn border border-tds-border bg-tds-card px-4 text-sm text-tds-text placeholder:text-tds-muted focus:border-tds-yellow focus:outline-none"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {ids.map((id) => (
          <div
            key={id}
            className="rounded-tds-card border border-tds-border bg-tds-card p-3 shadow-tds-card"
          >
            <div className="font-bold text-tds-text">{glossary[id].term}</div>
            <div className="mt-1 text-[13px] leading-relaxed text-tds-text">
              {glossary[id].def}
            </div>
            {glossary[id].example && (
              <div className="mt-1.5 text-xs text-tds-muted">
                💡 {glossary[id].example}
              </div>
            )}
          </div>
        ))}
      </div>
      {ids.length === 0 && (
        <div className="py-6 text-center text-sm text-tds-muted">
          Ничего не найдено 🤷
        </div>
      )}
    </div>
  );
}
