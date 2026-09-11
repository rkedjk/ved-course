import { useEffect, useRef } from "react";

const BASE = import.meta.env.BASE_URL;
const FRAME = 64; // ширина кадра
const SCALE = 0.72; // 100px → ~72px высоты

/** Мику Хацунэ бегает по нижней кромке экрана (спрайты: MikuPet, GPL-3.0). */
export function Miku() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const right = new Image();
    const left = new Image();
    const idle = new Image();
    right.src = BASE + "miku/walk_right.png";
    left.src = BASE + "miku/walk_left.png";
    idle.src = BASE + "miku/walk_idle.png";

    let raf = 0;
    let last = performance.now();

    // состояние бегуна
    const miku = {
      x: -80,
      dir: 1 as 1 | -1,
      vy: 0,
      y: 0, // подъём прыжка
      state: "run" as "run" | "idle",
      idleUntil: 0,
      jumpUntil: 0,
      t: 0,
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 96;
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;
      miku.t += dt;

      if (!right.complete || !left.complete || !idle.complete) {
        raf = requestAnimationFrame(frame);
        return;
      }

      // поведение
      if (miku.state === "run") {
        miku.x += miku.dir * 2.6 * dt;
        // прыжок: каждые 4–8 с
        if (miku.t > miku.jumpUntil) {
          miku.vy = -9;
          miku.jumpUntil = miku.t + 240 + Math.random() * 240;
        }
        // idle-пауза изредка
        if (miku.t > miku.idleUntil && Math.random() < 0.004) {
          miku.state = "idle";
          miku.idleUntil = miku.t + 150 + Math.random() * 120;
        }
        // разворот у краёв
        const w = FRAME * SCALE;
        if (miku.dir === 1 && miku.x > canvas.width - w) miku.dir = -1;
        if (miku.dir === -1 && miku.x < -20) miku.dir = 1;
      } else if (miku.t > miku.idleUntil) miku.state = "run";

      // гравитация прыжка
      miku.vy += 0.5 * dt;
      miku.y += miku.vy * dt;
      if (miku.y >= 0) {
        miku.y = 0;
        miku.vy = 0;
      }

      // отрисовка
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sheet = miku.dir === 1 ? right : left;
      let frameIndex: number;
      if (miku.state === "idle") {
        frameIndex = Math.floor(miku.t / 5) % 20;
      } else {
        frameIndex = Math.floor(miku.t / 4) % 3;
      }
      const y = canvas.height - 16 - FRAME * SCALE - miku.y;
      ctx.drawImage(
        sheet,
        frameIndex * FRAME,
        0,
        FRAME,
        100,
        miku.x,
        y,
        FRAME * SCALE,
        100 * SCALE,
      );
      // тень
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(
        miku.x + (FRAME * SCALE) / 2,
        canvas.height - 12,
        (FRAME * SCALE) / 2 - 2,
        4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-24 w-full"
      aria-hidden
    />
  );
}
