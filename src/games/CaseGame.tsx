import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store";
import { fireConfetti } from "../lib/confetti";
import { buzz, tick } from "../lib/haptics";

export interface CaseItem {
  icon: string;
  text: string;
  options: string[];
  correct: number;
  explain: string;
}

/** Кейс-игра: одна ситуация за раз, мгновенная проверка, XP за правильные. */
export function CaseGame({
  cases,
  title,
}: {
  cases: CaseItem[];
  title: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const addXp = useStore((s) => s.addXp);
  const c = cases[idx];
  const done = idx >= cases.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === c.correct) {
      setScore((s) => s + 1);
      addXp(5);
      tick();
    } else {
      buzz();
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
    if (idx + 1 >= cases.length) fireConfetti();
  };

  if (done) {
    return (
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 text-center shadow-tds-card">
        <div className="text-3xl">{score === cases.length ? "🏆" : "🎯"}</div>
        <div className="mt-1 font-bold text-tds-text">
          {score} из {cases.length} кейсов решено
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-tds-muted">
        {title} · кейс {idx + 1}/{cases.length}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
        >
          <div className="rounded-tds-btn bg-tds-bg p-3 text-sm font-semibold leading-relaxed text-tds-text">
            <span className="mr-1.5 text-xl">{c.icon}</span>
            {c.text}
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {c.options.map((opt, i) => {
              let cls =
                "border-tds-border bg-tds-bg text-tds-text hover:border-tds-black";
              if (picked !== null) {
                if (i === c.correct)
                  cls = "border-tds-green bg-tds-green-soft text-tds-text";
                else if (i === picked)
                  cls = "border-tds-red bg-tds-red-soft text-tds-text";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => pick(i)}
                  className={`min-h-11 rounded-tds-btn border px-4 py-2.5 text-left text-sm font-medium transition ${cls}`}
                >
                  {picked !== null && i === c.correct && "✅ "}
                  {picked !== null && i === picked && i !== c.correct && "❌ "}
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <>
              <div className="mt-2 rounded-tds-btn bg-tds-neutral p-3 text-[13px] leading-relaxed text-tds-muted">
                💡 {c.explain}
              </div>
              <button
                type="button"
                onClick={next}
                className="mt-2 min-h-11 w-full rounded-tds-btn bg-tds-yellow px-4 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
              >
                {idx + 1 >= cases.length ? "Итоги 🎉" : "Следующий кейс →"}
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
