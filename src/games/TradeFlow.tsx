import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../store";
import { fireConfetti } from "../lib/confetti";
import { buzz, tick } from "../lib/haptics";

interface Good {
  id: string;
  icon: string;
  name: string;
  from: string;
  to: string;
  dir: "export" | "import";
}

const goods: Good[] = [
  {
    id: "oil",
    icon: "🛢️",
    name: "Нефть",
    from: "Россия",
    to: "Индия",
    dir: "export",
  },
  {
    id: "banana",
    icon: "🍌",
    name: "Бананы",
    from: "Эквадор",
    to: "Россия",
    dir: "import",
  },
  {
    id: "phone",
    icon: "📱",
    name: "Смартфоны",
    from: "Китай",
    to: "Россия",
    dir: "import",
  },
  {
    id: "grain",
    icon: "🌾",
    name: "Зерно",
    from: "Россия",
    to: "Египет",
    dir: "export",
  },
];

/** Живой пример «экспорт или импорт»: товар едет через границу. */
export function TradeFlow() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"export" | "import" | null>(null);
  const [score, setScore] = useState(0);
  const addXp = useStore((s) => s.addXp);
  const good = goods[idx];
  const done = idx >= goods.length;

  const pick = (d: "export" | "import") => {
    if (picked) return;
    setPicked(d);
    if (d === good.dir) {
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
    if (idx + 1 >= goods.length) fireConfetti();
  };

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      {done ? (
        <div className="text-center">
          <div className="text-3xl">🌐</div>
          <div className="mt-1 font-bold text-tds-text">
            Все товары разошлись: {score}/{goods.length} верно
          </div>
        </div>
      ) : (
        <>
          <div className="mb-2 text-center text-sm font-bold text-tds-text">
            {good.icon} {good.name} едет из{" "}
            <span className="text-tds-yellow-pressed">{good.from}</span> в{" "}
            <span className="text-tds-yellow-pressed">{good.to}</span>
          </div>
          <div className="relative flex h-14 items-center overflow-hidden rounded-tds-btn border border-tds-border bg-tds-bg">
            <span className="absolute left-2 text-2xl">🇷🇺</span>
            <span className="absolute right-2 text-2xl">🌍</span>
            <AnimatePresence mode="wait">
              {picked && (
                <motion.span
                  key={good.id + (picked === good.dir ? "ok" : "no")}
                  initial={{ x: 0, opacity: 0 }}
                  animate={{ x: picked === "export" ? 110 : -110, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-1/2 -ml-4 text-2xl"
                >
                  🚚
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => pick("export")}
              disabled={picked !== null}
              className={`min-h-11 rounded-tds-btn border px-4 text-sm font-bold transition ${
                picked === "export"
                  ? good.dir === "export"
                    ? "border-tds-green bg-tds-green-soft text-tds-text"
                    : "border-tds-red bg-tds-red-soft text-tds-text"
                  : "border-tds-border bg-tds-bg text-tds-text hover:border-tds-black"
              }`}
            >
              📤 Экспорт
            </button>
            <button
              type="button"
              onClick={() => pick("import")}
              disabled={picked !== null}
              className={`min-h-11 rounded-tds-btn border px-4 text-sm font-bold transition ${
                picked === "import"
                  ? good.dir === "import"
                    ? "border-tds-green bg-tds-green-soft text-tds-text"
                    : "border-tds-red bg-tds-red-soft text-tds-text"
                  : "border-tds-border bg-tds-bg text-tds-text hover:border-tds-black"
              }`}
            >
              📥 Импорт
            </button>
          </div>
          {picked && (
            <div className="mt-2 text-center text-xs text-tds-muted">
              {picked === good.dir
                ? `✅ Верно: продажа и вывоз = экспорт, покупка и ввоз = импорт. ${good.name} — это ${good.dir}.`
                : `❌ ${good.name} — это ${good.dir === "export" ? "экспорт (продажа и вывоз)" : "импорт (покупка и ввоз)"}.`}
            </div>
          )}
          {picked && (
            <button
              type="button"
              onClick={next}
              className="mt-2 min-h-11 w-full rounded-tds-btn bg-tds-yellow px-4 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed"
            >
              {idx + 1 >= goods.length ? "Итоги 🎉" : "Следующий товар →"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
