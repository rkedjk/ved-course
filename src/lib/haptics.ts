import { useStore } from "../store";

/**
 * Вибро-отдача (navigator.vibrate).
 * Android/Chrome поддерживают; iOS Safari — нет (тихо пропускаем).
 * Уважает настройку пользователя и prefers-reduced-motion.
 */
export function haptic(pattern: number | number[]) {
 const s = useStore.getState();
 if (!s.haptics) return;
 if (!navigator.vibrate) return;
 if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
 try {
  navigator.vibrate(pattern);
 } catch {
  /* ignore */
 }
}

/** Короткий «тик» — правильный ответ, успешное действие. */
export const tick = () => haptic(12);
/** Двойной «буз» — ошибка. */
export const buzz = () => haptic([35, 40, 35]);
/** Праздничный паттерн — конец уровня/идеальный квиз. */
export const celebrate = () => haptic([15, 30, 15, 30, 60]);
/** «Сделка» — открытие/закрытие позиции в симуляторе. */
export const deal = () => haptic([25, 35, 25]);
