import { levelInfo, useStore } from "../store";

export function XpBar() {
    const xp = useStore((s) => s.xp);
    const { lvl, into } = levelInfo(xp);
    return (
        <div
            className="flex items-center gap-2"
            title={`${xp} XP · уровень ${lvl}`}
        >
            <span className="text-xs font-bold text-tds-text">LVL {lvl}</span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-tds-neutral">
                <div
                    className="h-full rounded-full bg-tds-yellow transition-all duration-300"
                    style={{ width: `${Math.round(into * 100)}%` }}
                />
            </div>
            <span className="text-xs font-semibold tabular-nums text-tds-muted">
                {xp} XP
            </span>
        </div>
    );
}
