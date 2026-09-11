# План: ADHD-mode в интерактивной лекции (ved-course)

## Context

Пользователь хочет забавный «ADHD-mode»: кнопку, которая включает режим с отвлекающими виджетами — как в мемах про «study with me». Подтверждённый набор: **Subway-подобный бегунок в углу**, **аниме-девочка, бегающая по экрану**, **поп-ит (squish)**. Место — лекция `ved-course` (React SPA). **Без YouTube**: всё рисуется кодом (canvas/спрайты), без внешних ассетов и зависимостей.

## Approach

1. Кнопка 🧠 в шапке (рядом с 📳/🌙/📖/🏆) — toggle ADHD-mode; флаг в `store.ts` (zustand persist).
2. `AdhdMode.tsx` — контейнер `position: fixed; inset: 0; pointer-events: none; z-50`; виджеты — `pointer-events: auto`, каждый перетаскивается мышью/пальцем и закрывается кнопкой ✕.
3. Виджеты (всё кодом, без картинок):
   - **SubwayRunner** — мини-раннер на `<canvas>` в перетаскиваемом окне «Subway Surfers 🏃»: пиксель-арт бегуна, три дорожки туннеля метро, препятствия (поезд/барьер), переключение дорожек стрелками/свайпом, счёт. Как «игра в углу экрана».
   - **RunGirl** — аниме-девочка (canvas-пиксель-арт: волосы, платье, бегущие ножки) бегает по нижней кромке экрана слева направо, иногда подпрыгивает; цикл.
   - **PopIt** — сетка пузырьков (CSS grid, radial-gradient), клик → вдавливание с анимацией + WebAudio-синтез «поп» (без файлов) + вибро `tick`.
4. Звуки: `src/lib/sound.ts` — WebAudio-синтез «pop» (короткий низкий удар + шум), без аудиофайлов.
5. Уважаем `prefers-reduced-motion` (без анимаций) и тёмную/светлую тему (рамки виджетов — TDS-токены).

## Files to modify

- `src/store.ts` — флаг `adhd: boolean` + `toggleAdhd` (+ persist)
- `src/App.tsx` — кнопка 🧠 в шапке, рендер `<AdhdMode />` поверх контента
- `src/components/AdhdMode.tsx` — контейнер + drag-обёртка + PopIt + ✕
- `src/games/adhd/SubwayRunner.tsx` — canvas-раннер
- `src/games/adhd/RunGirl.tsx` — canvas-девочка по кромке
- `src/lib/sound.ts` — WebAudio «pop»

## Reuse

- `src/lib/haptics.ts` — `tick()` для поп-ита
- Токены TDS (`bg-tds-card`, `border-tds-border`, `shadow-tds-pop`, радиусы) — рамки виджетов
- `src/store.ts` persist — флаг как остальные настройки

## Steps

- [ ] store: флаг `adhd` + toggle
- [ ] `lib/sound.ts`: WebAudio «pop»
- [ ] Кнопка 🧠 в шапке + рендер AdhdMode
- [ ] AdhdMode: контейнер, drag, ✕, PopIt
- [ ] SubwayRunner: canvas-раннер (бегун, дорожки, препятствия, управление)
- [ ] RunGirl: аниме-девочка по кромке экрана
- [ ] prefers-reduced-motion, тёмная тема, сборка
- [ ] Деплой на Pages

## Verification

- `npm run build` — чистая сборка
- Включить ADHD-mode: SubwayRunner играется в углу (стрелки/свайп меняют дорожку), девочка бегает по кромке, поп-ит кликается со звуком и вибро
- Виджеты перетаскиваются и закрываются; флаг переживает перезагрузку
- `prefers-reduced-motion` выключает анимации
- Деплой на Pages, проверка
