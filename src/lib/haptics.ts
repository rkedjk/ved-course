import { useStore } from "../store";
import { tap } from "./sound";

/**
 * Вибро-отдача.
 * Android/Chrome — navigator.vibrate. iOS Safari не поддерживает вибрацию,
 * поэтому включается звуковой фолбэк (короткий «цок»).
 * Не глушится prefers-reduced-motion (вибрация — не анимация).
 */
export function haptic(pattern: number | number[]) {
  const s = useStore.getState();
  if (!s.haptics) return;
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
    return;
  }
  tap(); // iOS: звуковая имитация таптика
}

/** Короткий «тик» — правильный ответ, успешное действие. */
export const tick = () => haptic([18, 22, 18]);
/** Двойной «буз» — ошибка. */
export const buzz = () => haptic([40, 50, 40]);
/** Праздничный паттерн — конец уровня/идеальный квиз. */
export const celebrate = () => haptic([20, 40, 20, 40, 80]);
/** «Сделка» — открытие/закрытие позиции в симуляторе. */
export const deal = () => haptic([30, 40, 30]);
