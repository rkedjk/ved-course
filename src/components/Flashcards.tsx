import { useState } from "react";
import { glossary, glossaryIds } from "../data/glossary";
import { useStore } from "../store";
import { fireConfetti } from "../lib/confetti";
import { tick } from "../lib/haptics";

/** Флэш-карточки: переворачивай и говори, знаешь ли термин. */
export function Flashcards() {
  const [order, setOrder] = useState(() =>
    glossaryIds.map((id) => ({ id, known: false })),
  );
  const [flipped, setFlipped] = useState(false);
  const addXp = useStore((s) => s.addXp);

  const pending = order.filter((c) => !c.known);
  const knownCount = order.length - pending.length;
  const current = pending[0];

  const advance = (know: boolean) => {
    if (!current) return;
    if (know) {
      addXp(2);
      tick();
    }
    setFlipped(false);
    setOrder((o) =>
      o.map((c) => (c.id === current.id ? { ...c, known: know } : c)),
    );
  };

  if (!current) {
    return (
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-6 text-center shadow-tds-card">
        <div className="text-4xl">🎓</div>
        <div className="mt-2 text-lg font-bold text-tds-text">
          Все {order.length} терминов выучены!
        </div>
        <button
          type="button"
          onClick={() => {
            setOrder((o) => o.map((c) => ({ ...c, known: false })));
            fireConfetti(true);
          }}
          className="mt-3 min-h-11 rounded-tds-btn bg-tds-yellow px-4 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
        >
          🔁 Пройти ещё раз
        </button>
      </div>
    );
  }

  const def = glossary[current.id];

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-tds-muted">
        <span>📖 Глоссарий</span>
        <span className="tabular-nums">
          Выучено {knownCount}/{order.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-tds-neutral">
        <div
          className="h-full rounded-full bg-tds-yellow transition-all duration-300"
          style={{ width: `${(knownCount / order.length) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          setFlipped((f) => !f);
          tick();
        }}
        className="perspective-1000 block w-full"
      >
        <div
          className={`relative min-h-44 w-full rounded-tds-btn border-2 transition-transform duration-300 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          } ${flipped ? "border-tds-yellow bg-tds-yellow-soft" : "border-tds-border bg-tds-bg"}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 [backface-visibility:hidden]">
            <span className="text-2xl">💡</span>
            <span className="text-center text-lg font-extrabold text-tds-text">
              {def.term}
            </span>
            <span className="text-xs text-tds-muted">
              нажми, чтобы перевернуть
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-center text-[13px] font-medium leading-relaxed text-tds-text">
              {def.def}
            </span>
            {def.example && (
              <span className="text-center text-xs text-tds-muted">
                💡 {def.example}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => advance(false)}
          className="min-h-11 flex-1 rounded-tds-btn border border-tds-border bg-tds-card px-4 text-sm font-bold text-tds-text transition hover:border-tds-red"
        >
          🤔 Не знаю
        </button>
        <button
          type="button"
          onClick={() => advance(true)}
          className="min-h-11 flex-1 rounded-tds-btn bg-tds-yellow px-4 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
        >
          👍 Знаю (+2 XP)
        </button>
      </div>
    </div>
  );
}
