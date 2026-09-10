import { useState } from "react";
import { useStore } from "../store";
import { buzz, deal, tick } from "../lib/haptics";
import { fireConfetti } from "../lib/confetti";

const RATE_MIN = 90;
const RATE_MAX = 140;
const SIZE = 1_000_000;
const ENTRY = 109.78;

const fmtUSD = (n: number) =>
  `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} USD`;
const fmtJPY = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ¥";

interface Position {
  side: "short" | "long";
  size: number;
  entry: number;
}

interface LogEntry {
  text: string;
  kind: "ok" | "err" | "info";
}

const steps = [
  { id: 1, label: "Продай 1 млн USD", hint: "шорт по 109,78" },
  { id: 2, label: "Подними курс", hint: "до 119,58" },
  { id: 3, label: "Закрой позицию", hint: "откупи доллары" },
  { id: 4, label: "Увидь убыток", hint: "−81 954 USD" },
];

/** Симулятор валютной позиции — кейс из лекции (USD/JPY). */
export function PositionSim() {
  const [rate, setRate] = useState(ENTRY);
  const [pos, setPos] = useState<Position | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [closed, setClosed] = useState(false);
  const addXp = useStore((s) => s.addXp);
  const unlock = useStore((s) => s.unlock);

  const pnlJPY = pos
    ? (pos.side === "short" ? pos.entry - rate : rate - pos.entry) * pos.size
    : 0;
  const pnlUSD = pos ? pnlJPY / rate : 0;
  const pnlColor =
    pnlUSD > 0
      ? "text-tds-green"
      : pnlUSD < 0
        ? "text-tds-red"
        : "text-tds-muted";
  const delta = pos ? rate - pos.entry : 0;

  const stepDone = (id: number) => {
    if (id === 1) return pos?.side === "short";
    if (id === 2) return pos !== null && rate >= 119.58;
    if (id === 3) return closed;
    if (id === 4) return closed && lastPnlUsd < 0;
    return false;
  };
  // последний PnL при закрытии — храним отдельно
  const [lastPnlUsd, setLastPnlUsd] = useState(0);

  const openShort = () => {
    if (pos) return;
    setPos({ side: "short", size: SIZE, entry: rate });
    unlock("short-trader");
    deal();
    setLog((l) => [
      {
        text: `Шорт: продал ${fmtUSD(SIZE)} по ${rate.toFixed(2)}`,
        kind: "err",
      },
      ...l,
    ]);
  };

  const openLong = () => {
    if (pos) return;
    setPos({ side: "long", size: SIZE, entry: rate });
    unlock("long-trader");
    deal();
    setLog((l) => [
      { text: `Лонг: купил ${fmtUSD(SIZE)} по ${rate.toFixed(2)}`, kind: "ok" },
      ...l,
    ]);
  };

  const close = () => {
    if (!pos) return;
    const pnl = pnlUSD;
    setLastPnlUsd(pnl);
    setPos(null);
    setClosed(true);
    if (!localStorage.getItem("ved-pos-closed")) {
      addXp(10);
      localStorage.setItem("ved-pos-closed", "1");
    }
    if (pnl < 0) {
      buzz();
      setLog((l) => [
        { text: `Закрытие: убыток ${fmtUSD(pnl)}`, kind: "err" },
        ...l,
      ]);
    } else {
      fireConfetti();
      tick();
      setLog((l) => [
        { text: `Закрытие: прибыль ${fmtUSD(pnl)} 🎉`, kind: "ok" },
        ...l,
      ]);
    }
  };

  const jpyOwed = pos?.side === "short" ? pos.size * pos.entry : 0;
  const usdOwed = pos?.side === "long" ? pos.size : 0;

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      {/* Тикер */}
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-bold text-tds-muted">USD/JPY</span>
        <span
          className={`text-4xl font-extrabold tabular-nums tracking-tight ${delta > 0 ? "text-tds-green" : delta < 0 ? "text-tds-red" : "text-tds-text"}`}
        >
          {rate.toFixed(2)}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${delta > 0 ? "text-tds-green" : delta < 0 ? "text-tds-red" : "text-tds-muted"}`}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta).toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={RATE_MIN}
        max={RATE_MAX}
        step={0.01}
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        aria-label="Курс USD/JPY"
        className="mt-3"
      />
      <div className="flex justify-between text-xs tabular-nums text-tds-muted">
        <span>{RATE_MIN}</span>
        <span>{pos ? `вход: ${pos.entry.toFixed(2)}` : "вход: —"}</span>
        <span>{RATE_MAX}</span>
      </div>

      {/* Ящики валют */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <Vault
          label="💵 Доллары"
          note={pos?.side === "short" ? `шорт ${fmtUSD(pos.size)}` : "свои"}
          amount={usdOwed ? fmtUSD(usdOwed) : "1 000 000 USD"}
          debt={!!usdOwed}
        />
        <div className="hidden text-center text-2xl text-tds-muted sm:block">
          ⇄
        </div>
        <Vault
          label="💴 Йены"
          note={
            pos?.side === "long" ? `лонг ${fmtUSD(pos.size)}` : "на балансе"
          }
          amount={jpyOwed ? fmtJPY(jpyOwed) : "0 ¥"}
          debt={pos?.side === "long"}
        />
      </div>

      {/* Позиция и PnL */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-tds-border pt-3">
        <div className="text-sm text-tds-muted">
          {pos ? (
            <>
              Позиция:{" "}
              <span
                className={`font-bold ${pos.side === "short" ? "text-tds-red" : "text-tds-green"}`}
              >
                {pos.side === "short" ? "КОРОТКАЯ" : "ДЛИННАЯ"}
              </span>{" "}
              <span className="tabular-nums">
                {fmtUSD(pos.size)} @ {pos.entry.toFixed(2)}
              </span>
            </>
          ) : (
            <span>
              {closed
                ? "Позиция закрыта — симуляция окончена"
                : "Нет открытой позиции"}
            </span>
          )}
        </div>
        <div className={`text-xl font-extrabold tabular-nums ${pnlColor}`}>
          {pos ? `${fmtUSD(pnlUSD)} · ${fmtJPY(pnlJPY)}` : "PnL: —"}
        </div>
      </div>

      {/* Кнопки */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={openShort}
          disabled={!!pos}
          className="min-h-11 flex-1 rounded-tds-btn border border-tds-red bg-tds-card px-4 py-2.5 text-sm font-bold text-tds-red transition hover:bg-tds-red-soft disabled:opacity-40"
        >
          ⬇️ Продать (шорт)
        </button>
        <button
          type="button"
          onClick={openLong}
          disabled={!!pos}
          className="min-h-11 flex-1 rounded-tds-btn border border-tds-green bg-tds-card px-4 py-2.5 text-sm font-bold text-tds-green transition hover:bg-tds-green-soft disabled:opacity-40"
        >
          ⬆️ Купить (лонг)
        </button>
        <button
          type="button"
          onClick={close}
          disabled={!pos}
          className="min-h-11 flex-1 rounded-tds-btn bg-tds-yellow px-4 py-2.5 text-sm font-bold text-tds-black transition hover:bg-tds-yellow-pressed disabled:opacity-40"
        >
          🔒 Закрыть
        </button>
      </div>

      {/* Сценарий-подсказка */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {steps.map((s) => (
          <span
            key={s.id}
            title={s.hint}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              stepDone(s.id)
                ? "border-tds-green bg-tds-green-soft text-tds-text"
                : "border-tds-border bg-tds-bg text-tds-muted"
            }`}
          >
            {stepDone(s.id) ? "✅" : "⬜"} {s.label}
          </span>
        ))}
      </div>
      {closed && lastPnlUsd < 0 && (
        <div className="mt-2 rounded-tds-btn bg-tds-red-soft p-2.5 text-center text-xs font-semibold text-tds-text">
          Тот самый убыток из лекции: курс вырос → шорт подешевел на{" "}
          {fmtUSD(lastPnlUsd)}. Откупать доллары пришлось дороже. 🐻
        </div>
      )}

      {/* Лог */}
      {log.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded-tds-btn bg-tds-bg p-2 text-[13px] leading-relaxed">
          {log.map((e, i) => (
            <div
              key={i}
              className={
                e.kind === "err"
                  ? "text-tds-red"
                  : e.kind === "ok"
                    ? "text-tds-green"
                    : "text-tds-muted"
              }
            >
              {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Vault({
  label,
  note,
  amount,
  debt,
}: {
  label: string;
  note: string;
  amount: string;
  debt: boolean;
}) {
  return (
    <div className="rounded-tds-btn border border-tds-border bg-tds-bg p-2.5 text-center">
      <div className="text-xs font-semibold text-tds-muted">{label}</div>
      <div
        className={`mt-0.5 text-base font-extrabold tabular-nums sm:text-lg ${debt ? "text-tds-red" : "text-tds-text"}`}
      >
        {amount}
      </div>
      <div className="text-[11px] text-tds-muted">{note}</div>
    </div>
  );
}
