import { useState } from "react";
import { motion } from "motion/react";
import { useStore } from "../store";

const MAX = 2_000_000;

function fmt(n: number): string {
  const v = Math.round(n / 1000);
  return `${v.toLocaleString("ru-RU")}K`;
}

/** Весы валютной позиции: двигай активы и пассивы. */
export function ScalesDemo() {
  const [assets, setAssets] = useState(1_000_000);
  const [liabilities, setLiabilities] = useState(1_000_000);
  const addXp = useStore((s) => s.addXp);
  const [awarded, setAwarded] = useState(false);

  const diff = assets - liabilities;
  const pos =
    diff === 0
      ? {
          label: "Закрытая позиция",
          color: "text-tds-green",
          risk: "валютного риска нет 🎉",
        }
      : diff > 0
        ? {
            label: `Длинная позиция: +${fmt(diff)} USD`,
            color: "text-tds-green",
            risk: "валютный риск есть ⚠️",
          }
        : {
            label: `Короткая позиция: −${fmt(-diff)} USD`,
            color: "text-tds-red",
            risk: "валютный риск есть ⚠️",
          };

  const tilt = Math.max(-18, Math.min(18, diff / 40_000));

  const open = () => {
    if (diff !== 0 && !awarded) {
      setAwarded(true);
      addXp(5);
    }
  };

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="relative mx-auto h-24 w-full max-w-sm">
        <div className="absolute left-0 top-1/2 w-1/2 text-center">
          <div className="text-sm font-bold text-tds-text">💰 Активы</div>
          <motion.div
            animate={{ y: diff >= 0 ? 0 : Math.min(14, -diff / 60_000) }}
            className="mx-auto mt-1 w-fit rounded-tds-btn border border-tds-border bg-tds-bg px-3 py-1 text-sm font-bold tabular-nums text-tds-text"
          >
            {fmt(assets)} USD
          </motion.div>
        </div>
        <div className="absolute right-0 top-1/2 w-1/2 text-center">
          <div className="text-sm font-bold text-tds-text">🧾 Пассивы</div>
          <motion.div
            animate={{ y: diff <= 0 ? 0 : Math.min(14, diff / 60_000) }}
            className="mx-auto mt-1 w-fit rounded-tds-btn border border-tds-border bg-tds-bg px-3 py-1 text-sm font-bold tabular-nums text-tds-text"
          >
            {fmt(liabilities)} USD
          </motion.div>
        </div>
        <motion.div
          animate={{ rotate: tilt }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="absolute left-0 right-0 top-1/2 h-1.5 rounded-full bg-tds-black"
        />
        <div className="absolute left-1/2 top-0 h-6 w-1.5 -translate-x-1/2 bg-tds-muted" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-tds-muted">
            Активы (требования)
          </span>
          <input
            type="range"
            min={0}
            max={MAX}
            step={50_000}
            value={assets}
            onChange={(e) => {
              setAssets(Number(e.target.value));
              open();
            }}
            aria-label="Активы в валюте"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-tds-muted">
            Пассивы (обязательства)
          </span>
          <input
            type="range"
            min={0}
            max={MAX}
            step={50_000}
            value={liabilities}
            onChange={(e) => {
              setLiabilities(Number(e.target.value));
              open();
            }}
            aria-label="Пассивы в валюте"
          />
        </label>
      </div>

      <div
        className={`mt-3 rounded-tds-btn bg-tds-bg p-3 text-center text-sm font-bold ${pos.color}`}
      >
        {pos.label}
      </div>
      <div className="mt-1 text-center text-xs text-tds-muted">{pos.risk}</div>
      <div className="mt-2 text-center text-xs text-tds-muted">
        Совпали требования и обязательства — закрытая позиция: курсу всё равно,
        банк спит спокойно.
      </div>
    </div>
  );
}
