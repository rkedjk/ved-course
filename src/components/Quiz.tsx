import { useState } from "react";
import type { QuizData } from "../data/types";
import { useStore } from "../store";
import { fireCannons, fireConfetti } from "../lib/confetti";
import { buzz, celebrate, tick } from "../lib/haptics";

export function Quiz({
  quiz,
  onDone,
}: {
  quiz: QuizData;
  onDone?: (pct: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const addXp = useStore((s) => s.addXp);
  const recordQuiz = useStore((s) => s.recordQuiz);
  const unlock = useStore((s) => s.unlock);
  const best = useStore((s) => s.quizBest[quiz.id]);
  const firstTime = best === undefined;

  const q = quiz.questions[idx];
  const isLast = idx === quiz.questions.length - 1;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) {
      setCorrect((c) => c + 1);
      tick();
    } else {
      buzz();
    }
  };

  const next = () => {
    if (!isLast) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    const total = quiz.questions.length;
    const pct = Math.round((correct / total) * 100);
    setFinished(true);
    recordQuiz(quiz.id, pct);
    if (firstTime) {
      addXp(correct * 10);
      if (pct === 100) {
        unlock("quiz-perfect");
        fireCannons();
        celebrate();
      } else {
        fireConfetti();
        tick();
      }
    }
    onDone?.(pct);
  };

  if (finished) {
    const total = quiz.questions.length;
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 text-center shadow-tds-card">
        <div className="text-3xl">
          {pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
        </div>
        <div className="mt-1 text-lg font-bold text-tds-text">
          {pct === 100 ? "Идеально!" : pct >= 60 ? "Отлично!" : "Ещё разок!"}
        </div>
        <div className="mt-1 text-sm text-tds-muted">
          {correct} из {total} правильных ({pct}%)
          {!firstTime && " · повтор без XP"}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-tds-text">
          {quiz.emoji} {quiz.title}
        </span>
        <span className="text-xs font-semibold tabular-nums text-tds-muted">
          {idx + 1}/{quiz.questions.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-tds-neutral">
        <div
          className="h-full rounded-full bg-tds-yellow transition-all duration-300"
          style={{
            width: `${((idx + (picked === null ? 0 : 1)) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>
      <div className="text-[15px] font-semibold leading-snug text-tds-text">
        {q.q}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {q.options.map((opt, i) => {
          let cls =
            "border-tds-border bg-tds-card text-tds-text hover:border-tds-black";
          if (picked !== null) {
            if (i === q.correct)
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
              {picked !== null && i === q.correct && "✅ "}
              {picked !== null && i === picked && i !== q.correct && "❌ "}
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 rounded-tds-btn bg-tds-neutral p-3 text-[13px] leading-relaxed text-tds-muted">
          💡 {q.explain}
        </div>
      )}
      {picked !== null && (
        <button
          type="button"
          onClick={next}
          className="mt-3 min-h-11 w-full rounded-tds-btn bg-tds-yellow px-4 py-2.5 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
        >
          {isLast ? "Показать результат" : "Дальше →"}
        </button>
      )}
    </div>
  );
}
