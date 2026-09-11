# Butter Squish — трендовый сквиш «сливочное масло» (Three.js)

## Context

ADHD-mode в лекции пополняется четвёртым виджетом: трендовый антистресс «Butter squish» (2026, TikTok) — реалистичная пачка сливочного масла из мягкого полиуретана, которую приятно мять: при нажатии остаётся вмятина, которая **медленно** заплывает обратно (slow rise), с ASMR-хлюпом. Пользователь выбрал:

- внешний вид — **пачка с этикеткой «BUTTER»** (как вирусный брикет из магазина),
- восстановление формы — **~3 сек с пружинным перелётом** (не 5–10с как в реале, чтобы не надоедало).

Технология — Three.js (явный запрос пользователя). Виджет встраивается по существующему паттерну ADHD-виджетов (DragWindow + Toggle), включается отдельно от остальных.

## Approach

**Сцена (один меш):** `RoundedBoxGeometry(2.8, 1, 1)` — брусок масла со скруглёнными рёбрами, пропорции реальной пачки ~14×5×5 см. Один меш с **массивом из 6 материалов** (RoundedBoxGeometry имеет 6 групп, как BoxGeometry):

- перед/зад — этикетка: CanvasTexture «BUTTER / SALTED / 150 г» на жёлтом фоне с красными полосами и линиями-складками (рисуется на canvas 512×256, `CanvasTexture`, `colorSpace = SRGBColorSpace`),
- бока — бледно-жёлтая обёртка с красной полосой,
- верх/низ/торцы — «открытое» масло, глянцевый бледно-жёлтый (#f6e6b8, roughness ~0.2).

Материалы — `MeshPhysicalMaterial` (сохраняем PBR-свет), деформация — **инъекция в вершинный шейдер** через `onBeforeCompile` (общая функция-обёртка для всех 6 материалов):

```glsl
// uniform: vec3 uSquishPoint; float uSquishDepth; float uSquishRadius;
// после #include <begin_vertex>:
vec3 d = transformed - uSquishPoint;
float f = 1.0 - smoothstep(0.0, uSquishRadius, length(d));
transformed -= normal * uSquishDepth * f;
```

Вмятина — по нормали внутрь, спадает к нулю на радиусе. GPU-деформация: на мобилке дешевле CPU-перемещения вершин, плавно на 60fps.

**Интерактив («мять пальцем»):**

- `pointerdown` на canvas → `Raycaster` → точка попадания → `worldToLocal` → `uSquishPoint`; глубина плавно растёт к максимуму (~0.22), пока зажато;
- `pointermove` при зажатии — точка вмятины **едет за пальцем** (эффект «месишь масло»);
- `pointerup` — **пружинная симуляция** возврата: `a = -k*u - c*v`, `k≈60, c≈8` → перелёт ~1.5–2% за ~3 сек (выбранный slow rise). Пружинка живёт в rAF-цикле рендера.
- звук `squelch()` (новый, WebAudio) + `tick()` (haptics) на нажатии.

**Камера/свет:** `PerspectiveCamera(40)` на z≈3.5, брусок слегка повёрнут (этикетка + верх видны); ambient + directional + hemisphere. Микро-покачивание объекта (`y = sin(t)*0.02`) — отключается при `prefers-reduced-motion`.

**Ленивая загрузка:** `three` и `RoundedBoxGeometry` — через `await import()` внутри `useEffect` → three уходит в отдельный chunk (~600KB, gzip ~160KB) и грузится только при включении виджета. Пока грузится — лёгкий плейсхолдер «🧈 загружаю…».

**Очистка:** cleanup — `cancelAnimationFrame`, `renderer.dispose()`, dispose геометрии/материалов/текстур, удаление canvas.

## Files to modify

| Файл | Что меняется |
| --- | --- |
| `src/games/adhd/ButterSquish.tsx` | **новый** — вся three.js-сцена (canvas, материалы с шейдером, raycast-интерактив, пружина возврата, ленивый import) |
| `src/lib/sound.ts` | + `squelch()` — мягкий ASMR-хлюп (шум через lowpass 500→150 Гц + низкий sine, ~0.25с), по паттерну `pop()` |
| `src/store.ts` | `AdhdState` + `butter: boolean` (default `true`, как остальные виджеты) |
| `src/components/AdhdMode.tsx` | + Toggle 🧈 (title «Масло») в панели; рендер `<DragWindow title="🧈 Butter squish"><ButterSquish /></DragWindow>` рядом с поп-итом |
| `package.json` | + `three` (deps), `@types/three` (devDeps) |

## Reuse

- `DragWindow` и `Toggle` — уже в `src/components/AdhdMode.tsx` (окно с перетаскиванием за заголовок, кнопка-тоггл);
- `tick()` — `src/lib/haptics.ts` (вибро при нажатии, гибрид Android vibrate / iOS taptic);
- паттерн WebAudio-синтеза — `src/lib/sound.ts` (`pop()`, `swoosh()`, `thud()`);
- паттерн ленивого/асинхронного виджета и `prefers-reduced-motion` guard — `src/games/adhd/SubwayVideo.tsx` / `Miku.tsx`;
- флаг-тоггл виджета — паттерн `adhd.popit` в `src/store.ts` + `AdhdMode.tsx`.

## Steps

- [ ] `npm i three` + `npm i -D @types/three`; `.npmrc` уже форсирует npmjs (artifactory исключён)
- [ ] `src/lib/sound.ts`: `squelch()` (шум+lowpass+низкий sine)
- [ ] `src/store.ts`: `butter` в `AdhdState` и `adhdDefaults`
- [ ] `src/games/adhd/ButterSquish.tsx`: сцена (RoundedBox, 6 материалов, этикетка-CanvasTexture, инъекция шейдера uSquishPoint/uSquishDepth)
- [ ] Интерактив: raycast pointerdown/move/up, пружина возврата (k≈60, c≈8), squelch+tick, микро-покачивание (reduced-motion guard)
- [ ] `src/components/AdhdMode.tsx`: Toggle 🧈 + DragWindow
- [ ] Проверка: сборка, three в отдельном chunk, деплой

## Verification

1. `npx tsc -b` и `npm run build` — без ошибок; в выводе сборки three в отдельном chunk (`ButterSquish`-чанк), основной бандл не вырос
2. `npm run dev` — виджет включается тумблером 🧈 в ADHD-панели, окно перетаскивается за заголовок, закрывается ✕
3. На телефоне (Android Chrome / iPhone): тап по маслу — вмятина, при ведении пальца «едет» за ним; отпускание — пружинный возврат ~3 сек; звук-хлюп + вибро (Android); `prefers-reduced-motion` — без покачивания
4. CI-деплой → <https://rkedjk.github.io/ved-course/> → 200, виджет работает на проде
