import { useStore } from "../store";
import { WebHaptics } from "web-haptics";

/**
 * Гибридная вибро-отдача:
 * - Android/Chrome — прямые паттерны через navigator.vibrate (как на тестерах),
 *   без PWM-ослабления библиотеки (короткие пресеты иначе превращаются
 *   в 6-мс микро-пульсации, которые не ощущаются).
 * - iOS Safari 17.4–26.4 — Taptic Engine через web-haptics (checkbox trick).
 *   На iOS 26.5+ Apple запатчила трюк — таптик в браузере невозможен.
 */

type HapticInput =
  | number
  | number[]
  | "light"
  | "medium"
  | "heavy"
  | "soft"
  | "rigid"
  | "selection"
  | "nudge"
  | "success"
  | "warning"
  | "error";

// Прямые паттерны для navigator.vibrate (Android).
// Рекомендация il.ly: для тапа идеал ~50мс, всё выше 100мс — уже долго.
const DIRECT: Record<string, number[]> = {
  light: [50],
  medium: [35, 25, 35],
  heavy: [70],
  soft: [30],
  rigid: [40],
  selection: [30],
  nudge: [50, 60, 40],
  success: [30, 50, 40, 50, 60],
  warning: [40, 60, 40],
  error: [40, 50, 40, 50, 40],
};

function toPattern(input: HapticInput): number[] {
  if (typeof input === "number") return [input];
  if (Array.isArray(input)) return input;
  return DIRECT[input] ?? [30];
}

let instance: WebHaptics | null = null;
const getInstance = () => (instance ??= new WebHaptics());

export function haptic(input: HapticInput) {
  const s = useStore.getState();
  if (!s.haptics) return;
  if (navigator.vibrate) {
    try {
      navigator.vibrate(toPattern(input));
    } catch {
      /* ignore */
    }
    return;
  }
  // iOS: настоящий Taptic Engine (checkbox trick)
  getInstance()
    .trigger(input)
    .catch(() => {
      /* ignore */
    });
}

/** Короткий «тик» — правильный ответ, успешное действие. */
export const tick = () => haptic("light");
/** Ошибка — тройной «буз». */
export const buzz = () => haptic("error");
/** Празднование — конец уровня/идеальный квиз. */
export const celebrate = () => haptic("success");
/** «Сделка» — открытие/закрытие позиции в симуляторе. */
export const deal = () => haptic("medium");
