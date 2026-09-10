import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const forms = [
  {
    id: "predmet",
    icon: "🚜",
    title: "Предметная",
    desc: "Предприятие выпускает готовое изделие целиком и поставляет его партнёру (для сборки или продажи).",
    example:
      "Завод в РФ собирает весь трактор и отправляет его сборочному заводу в другой стране.",
  },
  {
    id: "podetal",
    icon: "🔩",
    title: "Подетальная (поузловая)",
    desc: "Каждое предприятие делает детали или узлы, а сборку выполняет партнёр.",
    example:
      "Одна страна — двигатели, другая — коробки передач, третья собирает автомобиль.",
  },
  {
    id: "tehnolog",
    icon: "🧪",
    title: "Технологическая (поставочная)",
    desc: "Стадии производства распределены: одна страна поставляет сырьё/полуфабрикаты для следующей стадии.",
    example: "Финляндия — целлюлоза, Россия — бумага.",
  },
];

const scenes: Record<string, string[]> = {
  predmet: ["🏭 Готовый трактор", "➡️", "🏭 Сборка у партнёра"],
  podetal: ["🔧 Двигатели", "+", "⚙️ Коробки", "➡️", "🚗 Сборка авто"],
  tehnolog: ["🌲 Целлюлоза", "➡️", "📄 Производство бумаги"],
};

/** Живой пример «как ТНК делит труд»: три формы кооперации. */
export function TnkDemo() {
  const [active, setActive] = useState(0);
  const form = forms[active];

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="mb-3 flex gap-1.5">
        {forms.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(i)}
            className={`flex-1 rounded-tds-btn border px-2 py-2 text-center text-xs font-bold transition ${
              i === active
                ? "border-tds-yellow bg-tds-yellow-soft text-tds-text"
                : "border-tds-border bg-tds-bg text-tds-muted hover:border-tds-yellow"
            }`}
          >
            <span className="block text-lg">{f.icon}</span>
            {f.title}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={form.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl">
            {scenes[form.id].map((s, i) =>
              s === "➡️" || s === "+" ? (
                <span key={i} className="text-tds-muted">
                  {s}
                </span>
              ) : (
                <span
                  key={i}
                  className="rounded-tds-btn border border-tds-border bg-tds-bg px-3 py-1.5 text-sm font-semibold text-tds-text"
                >
                  {s}
                </span>
              ),
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-tds-text">
            {form.desc}
          </p>
          <p className="mt-1.5 text-xs text-tds-muted">💡 {form.example}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
