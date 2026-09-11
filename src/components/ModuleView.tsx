import { motion } from "motion/react";
import type { Module } from "../data/types";
import { Inline } from "./Inline";
import { Term } from "./Term";
import { LawLink } from "./LawLink";
import { Quiz } from "./Quiz";
import { DemoRenderer } from "../games";
import { useStore } from "../store";
import { fireConfetti } from "../lib/confetti";
import { celebrate } from "../lib/haptics";

export function ModuleView({
  module,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: {
  module: Module;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const done = useStore((s) => s.done[module.id]);
  const completeModule = useStore((s) => s.completeModule);
  const addXp = useStore((s) => s.addXp);
  const unlock = useStore((s) => s.unlock);

  const finish = () => {
    if (!done) {
      completeModule(module.id);
      addXp(module.xp);
      unlock("first-steps");
      fireConfetti(true);
      celebrate();
    }
    onNext();
  };

  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{module.icon}</span>
        <h2 className="text-lg font-bold leading-tight text-tds-text">
          {module.title}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {module.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="min-h-11 rounded-tds-btn border border-tds-border bg-tds-card px-4 py-2.5 text-sm font-bold text-tds-text transition hover:border-tds-black disabled:opacity-40 sm:w-auto"
        >
          ← Назад
        </button>
        {!done && (
          <button
            type="button"
            onClick={finish}
            className="min-h-11 flex-1 rounded-tds-btn bg-tds-yellow px-4 py-2.5 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
          >
            ✅ Завершить модуль (+{module.xp} XP)
          </button>
        )}
        {done && (
          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className="min-h-11 flex-1 rounded-tds-btn bg-tds-yellow px-4 py-2.5 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed disabled:opacity-40"
          >
            {isLast ? "🎓 К финалу" : "Следующий модуль →"}
          </button>
        )}
      </div>
      {done && (
        <div className="mt-2 text-center text-xs font-semibold text-tds-green">
          ✅ Модуль пройден · повтор XP не даёт
        </div>
      )}
    </motion.div>
  );
}

function BlockView({ block }: { block: Module["blocks"][number] }) {
  switch (block.kind) {
    case "text":
      return (
        <p className="text-[15px] leading-relaxed text-tds-text">
          <Inline text={block.text} />
        </p>
      );
    case "terms":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {block.terms.map((id) => (
            <Term key={id} id={id} label={id} />
          ))}
        </div>
      );
    case "law":
      return <LawLink title={block.title} url={block.url} note={block.note} />;
    case "demo":
      return (
        <div>
          {block.title && (
            <div className="mb-1.5 text-sm font-bold text-tds-text">
              🎮 {block.title}
            </div>
          )}
          <DemoRenderer demo={block.demo} />
          {block.hint && (
            <div className="mt-1.5 text-center text-xs text-tds-muted">
              {block.hint}
            </div>
          )}
        </div>
      );
    case "quiz":
      return <Quiz quiz={block.quiz} />;
    case "joke":
      return (
        <div className="rounded-tds-card border border-tds-yellow bg-tds-yellow-soft p-3 text-sm leading-relaxed text-tds-text">
          <span className="mr-1.5 text-xl">{block.emoji}</span>
          {block.text}
        </div>
      );
    case "quote":
      return (
        <details className="rounded-tds-card border border-tds-border bg-tds-bg p-3 text-sm">
          <summary className="cursor-pointer text-xs font-bold text-tds-muted">
            📓 Как в конспекте{block.source ? ` · ${block.source}` : ""}
          </summary>
          <p className="mt-2 text-[13px] leading-relaxed text-tds-muted">
            {block.text}
          </p>
        </details>
      );
  }
}
