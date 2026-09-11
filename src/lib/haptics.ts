import { useStore } from "../store";
import { WebHaptics } from "web-haptics";

/**
 * Вибро-отдача через библиотеку web-haptics (сама решает платформу):
 * - Android/Chrome — navigator.vibrate (PWM-интенсивность)
 * - iOS Safari 17.4–26.4 — трюк со скрытым iOS-свитчем → Taptic Engine
 *   (на iOS 26.5+ Apple запатчила трюк — таптик в браузере невозможен)
 * - Desktop — тихо (можно включить debug-звук)
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
  | "buzz"
  | "success"
  | "warning"
  | "error";

let instance: WebHaptics | null = null;
const getInstance = () => (instance ??= new WebHaptics());

export function haptic(input: HapticInput) {
  const s = useStore.getState();
  if (!s.haptics) return;
  getInstance()
    .trigger(input)
    .catch(() => {
      /* ignore */
    });
}

/** Короткий «тик» — правильный ответ, успешное действие. */
export const tick = () => haptic("light");
/** Ошибка — двойной/тройной «буз». */
export const buzz = () => haptic("error");
/** Празднование — конец уровня/идеальный квиз. */
export const celebrate = () => haptic("success");
/** «Сделка» — открытие/закрытие позиции в симуляторе. */
export const deal = () => haptic("medium");