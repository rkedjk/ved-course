// WebAudio-синтез звуков без аудиофайлов.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Короткий «поп» (низкий удар + щелчок) — поп-ит, кнопки. */
export function pop() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;

  // удар: синус 180 → 70 Гц за 90 мс
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.11);

  // щелчок: короткий шум
  const noise = ac.createBufferSource();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.08, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  noise.buffer = buf;
  noise.connect(ng).connect(ac.destination);
  noise.start(t);
}

/** «Вжух» (свип вверх) — появление виджета, прыжок. */
export function swoosh() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(240, t);
  osc.frequency.exponentialRampToValueAtTime(900, t + 0.18);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.22);
}

/** Низкий «дум» — столкновение в раннере. */
export function thud() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** Микро-«цок» — имитация таптика на iOS (где нет navigator.vibrate). */
export function tap() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(900, t);
  gain.gain.setValueAtTime(0.06, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.03);
}

/** Мягкий ASMR-«хлюп» — сжимание масла (шум через lowpass + низкий sine). */
export function squelch() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;

  // шум с затуханием через низкочастотный фильтр — «мокрый» хлюп
  const noise = ac.createBufferSource();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.28, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(520, t);
  lp.frequency.exponentialRampToValueAtTime(140, t + 0.24);
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.22, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  noise.buffer = buf;
  noise.connect(lp).connect(ng).connect(ac.destination);
  noise.start(t);

  // низкий «мясистый» тон
  const osc = ac.createOscillator();
  const og = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.2);
  og.gain.setValueAtTime(0.14, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.connect(og).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.24);
}
