import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { theme1, theme1Meta } from "./data/theme1";
import { theme2, theme2Meta } from "./data/theme2";
import { ModuleView } from "./components/ModuleView";
import { GlossaryView } from "./components/GlossaryView";
import { AchievementsView } from "./components/AchievementsView";
import { XpBar } from "./components/XpBar";
import { Credits } from "./components/Credits";
import { useStore } from "./store";
import { fireConfetti } from "./lib/confetti";
import { celebrate, tick } from "./lib/haptics";

const modules = [...theme1, ...theme2];
const themes = [
  { ...theme1Meta, modules: theme1, icon: "🏛️" },
  { ...theme2Meta, modules: theme2, icon: "💱" },
];

type View = "module" | "glossary" | "achievements";

export default function App() {
  const [view, setView] = useState<View>("module");
  const [idx, setIdx] = useState(0);
  const [eggClicks, setEggClicks] = useState(0);
  const theme = useStore((s) => s.theme);
  const haptics = useStore((s) => s.haptics);
  const setTheme = useStore((s) => s.setTheme);
  const setHaptics = useStore((s) => s.setHaptics);
  const done = useStore((s) => s.done);
  const xp = useStore((s) => s.xp);
  const unlock = useStore((s) => s.unlock);

  const module = modules[idx];

  // Достижения за темы и XP — реактивно
  useEffect(() => {
    if (theme1.every((m) => done[m.id])) unlock("theme1-done");
    if (theme2.every((m) => done[m.id])) unlock("theme2-done");
    if (xp >= 100) unlock("xp-100");
    if (xp >= 300) unlock("xp-300");
  }, [done, xp, unlock]);

  const goModule = (i: number) => {
    setIdx(i);
    setView("module");
    window.scrollTo({ top: 0 });
  };

  const egg = () => {
    const n = eggClicks + 1;
    setEggClicks(n);
    if (n >= 5) {
      setEggClicks(0);
      unlock("easter-egg");
      fireConfetti(true);
      celebrate();
    }
  };

  const jumpTheme = (t: 1 | 2) => {
    const i = modules.findIndex((m) => m.theme === t);
    if (i >= 0) goModule(i);
  };

  return (
    <div className="min-h-dvh">
      {/* Шапка */}
      <header className="sticky top-0 z-30 border-b border-tds-border bg-tds-card/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-3 pb-1.5 pt-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goModule(0)}
              className="text-left text-base font-extrabold tracking-tight text-tds-text"
            >
              📦 Учёт и анализ ВЭД
            </button>
            <div className="flex items-center gap-1.5">
              <XpBar />
              <IconBtn
                title={haptics ? "Вибрация: вкл" : "Вибрация: выкл"}
                onClick={() => {
                  setHaptics(!haptics);
                  tick();
                }}
              >
                <span className={haptics ? "" : "opacity-30 grayscale"}>
                  📳
                </span>
              </IconBtn>
              <IconBtn
                title="Переключить тему"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </IconBtn>
              <IconBtn
                title="Глоссарий"
                onClick={() => {
                  setView("glossary");
                  tick();
                }}
              >
                📖
              </IconBtn>
              <IconBtn
                title="Достижения"
                onClick={() => {
                  setView("achievements");
                  tick();
                }}
              >
                🏆
              </IconBtn>
            </div>
          </div>

          {/* Навигация: темы + модули */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => jumpTheme(t.id === "theme1" ? 1 : 2)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  module.theme === (t.id === "theme1" ? 1 : 2)
                    ? "border-tds-yellow bg-tds-yellow-soft text-tds-text"
                    : "border-tds-border bg-tds-bg text-tds-muted"
                }`}
              >
                {t.icon}{" "}
                {t.title
                  .replace("Тема 1. ", "Тема 1 · ")
                  .replace("Тема 2. ", "Тема 2 · ")}
              </button>
            ))}
            <div className="flex shrink-0 items-center gap-1 pl-1">
              {modules.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => goModule(i)}
                  title={m.title}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition ${
                    i === idx
                      ? "bg-tds-yellow text-tds-black ring-2 ring-tds-yellow"
                      : done[m.id]
                        ? "bg-tds-yellow-soft text-tds-black"
                        : "border border-tds-border bg-tds-bg text-tds-muted"
                  }`}
                >
                  {done[m.id] ? "✓" : i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="mx-auto max-w-3xl px-3 pb-32 pt-3 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (view === "module" ? ":" + idx : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {view === "module" && (
              <>
                {idx === 0 && <Credits />}
                <ModuleView
                  module={module}
                  isFirst={idx === 0}
                  isLast={idx === modules.length - 1}
                  onPrev={() => goModule(idx - 1)}
                  onNext={() =>
                    idx < modules.length - 1
                      ? goModule(idx + 1)
                      : setView("achievements")
                  }
                />
              </>
            )}
            {view === "glossary" && <GlossaryView />}
            {view === "achievements" && <AchievementsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Нижняя навигация (мобильная) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-tds-border bg-tds-card px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            type="button"
            disabled={view !== "module" || idx === 0}
            onClick={() => goModule(idx - 1)}
            className="min-h-11 w-24 shrink-0 rounded-tds-btn border border-tds-border bg-tds-bg text-sm font-bold text-tds-text transition disabled:opacity-35"
          >
            ← Назад
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tds-neutral">
            <div
              className="h-full rounded-full bg-tds-yellow transition-all duration-300"
              style={{ width: `${((idx + 1) / modules.length) * 100}%` }}
            />
          </div>
          <button
            type="button"
            disabled={view !== "module"}
            onClick={() =>
              idx < modules.length - 1
                ? goModule(idx + 1)
                : setView("achievements")
            }
            className="min-h-11 w-24 shrink-0 rounded-tds-btn bg-tds-yellow text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed disabled:opacity-35"
          >
            Далее →
          </button>
        </div>
      </nav>

      <footer className="pb-28 pt-2 text-center text-xs text-tds-muted md:pb-8">
        <button
          type="button"
          onClick={egg}
          className="cursor-pointer"
          title="тук-тук"
        >
          Лекция: к.э.н., доцент Карпунина Елена Валерьевна, кафедра
          «Экономическая безопасность, анализ и учёт» РГРТУ им. В.Ф. Уткина ·
          Разработка: Радмир Мустафин, QA-инженер Т-Банка
        </button>
        <div className="mt-0.5 opacity-60">
          Учебный проект по предмету «Учёт и анализ ВЭД» · сделано с ❤️ и
          валютным риском · не является финансовой рекомендацией 🙂 ·{" "}
          {eggClicks > 0 && `${5 - eggClicks}…`}
        </div>
      </footer>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-tds-border bg-tds-bg text-base transition hover:border-tds-yellow"
    >
      {children}
    </button>
  );
}
