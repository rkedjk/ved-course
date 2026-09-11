import { useRef, useState, type ReactNode } from "react";
import { useStore } from "../store";
import { SubwayVideo } from "../games/adhd/SubwayVideo";
import { Miku } from "../games/adhd/Miku";
import { pop } from "../lib/sound";
import { tick } from "../lib/haptics";

/** ADHD-mode: отвлекающие виджеты поверх контента, каждый включается отдельно. */
export function AdhdMode() {
  const adhd = useStore((s) => s.adhd);
  const setAdhd = useStore((s) => s.setAdhd);

  if (!adhd.on) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40">
        {adhd.subway && (
          <DragWindow
            title="🏃 Subway Surfers"
            start={{ x: window.innerWidth - 170, y: Math.max(12, window.innerHeight - 380) }}
            onClose={() => setAdhd({ subway: false })}
          >
            <SubwayVideo />
          </DragWindow>
        )}
        {adhd.popit && (
          <DragWindow
            title="🔵 Поп-ит"
            start={{ x: Math.max(12, window.innerWidth - 250), y: 80 }}
            onClose={() => setAdhd({ popit: false })}
          >
            <PopIt />
          </DragWindow>
        )}
      </div>
      {adhd.miku && <Miku />}

      {/* Панель управления */}
      <div className="fixed bottom-24 right-3 z-50 flex flex-col items-end gap-1.5 md:bottom-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-tds-card border border-tds-border bg-tds-card/95 p-1.5 shadow-tds-pop backdrop-blur">
          <span className="px-1.5 text-xs font-extrabold text-tds-text">🧠 ADHD</span>
          <Toggle on={adhd.subway} onClick={() => setAdhd({ subway: !adhd.subway })} label="🏃" title="Subway" />
          <Toggle on={adhd.miku} onClick={() => setAdhd({ miku: !adhd.miku })} label="🎀" title="Мику" />
          <Toggle on={adhd.popit} onClick={() => setAdhd({ popit: !adhd.popit })} label="🔵" title="Поп-ит" />
          <button
            type="button"
            onClick={() => setAdhd({ on: false })}
            title="Выключить ADHD-mode"
            className="flex h-9 w-9 items-center justify-center rounded-tds-btn border border-tds-border bg-tds-bg text-sm transition hover:border-tds-red hover:bg-tds-red-soft"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}

function Toggle({
  on,
  onClick,
  label,
  title,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-tds-btn border text-base transition ${
        on
          ? "border-tds-yellow bg-tds-yellow-soft"
          : "border-tds-border bg-tds-bg opacity-45 grayscale"
      }`}
    >
      {label}
    </button>
  );
}

function DragWindow({
  title,
  start,
  onClose,
  children,
}: {
  title: string;
  start: { x: number; y: number };
  onClose: () => void;
  children: ReactNode;
}) {
  const [pos, setPos] = useState(start);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    setPos({
      x: Math.min(Math.max(4, e.clientX - drag.current.dx), w - 120),
      y: Math.min(Math.max(4, e.clientY - drag.current.dy), h - 60),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      className="pointer-events-auto absolute z-40 w-fit rounded-tds-card border border-tds-border bg-tds-card shadow-tds-pop"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="flex cursor-grab touch-none items-center justify-between gap-3 rounded-t-[16px] border-b border-tds-border px-2.5 py-1.5 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="Перетащи"
      >
        <span className="text-[11px] font-bold text-tds-text">{title}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-tds-muted hover:bg-tds-neutral"
        >
          ✕
        </button>
      </div>
      <div className="relative p-2">{children}</div>
    </div>
  );
}

const ROWS = 6;
const COLS = 6;

function PopIt() {
  const [pressed, setPressed] = useState<Set<number>>(new Set());
  const count = pressed.size;

  const toggle = (i: number) => {
    setPressed((p) => {
      const next = new Set(p);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    pop();
    tick();
  };

  return (
    <div className="w-[196px] select-none">
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-tds-muted">
        <span>🫧 Нажимай!</span>
        <span className="tabular-nums">{count}/{ROWS * COLS}</span>
      </div>
      <div
        className="grid gap-1.5 rounded-tds-btn border border-tds-border bg-tds-bg p-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const on = pressed.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-label={`Пузырёк ${i + 1}`}
              className="aspect-square w-full rounded-full transition-transform duration-100"
              style={{
                background: on
                  ? "radial-gradient(circle at 50% 40%, #f6f7f8, #d8dade)"
                  : "radial-gradient(circle at 35% 30%, #fff, #ffdd2d 65%, #fab619)",
                boxShadow: on
                  ? "inset 0 3px 6px rgba(0,0,0,0.25)"
                  : "0 2px 4px rgba(0,0,0,0.18), inset 0 -3px 5px rgba(0,0,0,0.12)",
                transform: on ? "scale(0.86)" : "scale(1)",
              }}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setPressed(new Set())}
        className="mt-1.5 min-h-8 w-full rounded-tds-btn bg-tds-neutral text-[11px] font-bold text-tds-text transition hover:bg-tds-yellow-soft"
      >
        🔁 Сбросить
      </button>
    </div>
  );
}