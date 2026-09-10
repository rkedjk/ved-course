import { achievements } from "../data/achievements";
import { useStore } from "../store";

/** Вкладка «Достижения»: бейджи. */
export function AchievementsView() {
  const unlocked = useStore((s) => s.achievements);
  const done = useStore((s) => s.done);
  const xp = useStore((s) => s.xp);

  const total = achievements.length;
  const got = unlocked.length;
  const allDone = Object.keys(done).length;

  return (
    <div>
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 text-center shadow-tds-card">
        <div className="text-3xl">{got === total ? "👑" : "🏆"}</div>
        <div className="mt-1 text-lg font-bold text-tds-text">
          {got} из {total} достижений
        </div>
        <div className="text-xs text-tds-muted">
          Модулей пройдено: {allDone} · XP: {xp}
        </div>
        <div className="mx-auto mt-2 h-2 w-48 overflow-hidden rounded-full bg-tds-neutral">
          <div
            className="h-full rounded-full bg-tds-yellow transition-all duration-300"
            style={{ width: `${(got / total) * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {achievements.map((a) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-tds-card border p-3 text-center shadow-tds-card ${
                isUnlocked
                  ? "border-tds-yellow bg-tds-card"
                  : "border-tds-border bg-tds-bg opacity-55"
              }`}
            >
              <div className={`text-3xl ${isUnlocked ? "" : "grayscale"}`}>
                {a.icon}
              </div>
              <div className="mt-1 text-sm font-bold text-tds-text">
                {a.title}
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-tds-muted">
                {a.desc}
              </div>
              {isUnlocked && (
                <div className="mt-1 text-xs font-bold text-tds-green">
                  ✅ открыто
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
