export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export const achievements: AchievementDef[] = [
  {
    id: "first-steps",
    icon: "🌱",
    title: "Первые шаги",
    desc: "Пройди первый модуль лекции",
  },
  {
    id: "theme1-done",
    icon: "🏛️",
    title: "Таможенный знаток",
    desc: "Пройди всю тему «Сущность и гос. регулирование ВЭД»",
  },
  {
    id: "theme2-done",
    icon: "💹",
    title: "Валютный рисколог",
    desc: "Пройди всю тему «Анализ валютных рисков»",
  },
  {
    id: "quiz-perfect",
    icon: "🎯",
    title: "Без промаха",
    desc: "Ответь на все вопросы квиза правильно с первой попытки",
  },
  {
    id: "short-trader",
    icon: "🐻",
    title: "Медведь-шортист",
    desc: "Открой шорт в симуляторе валютной позиции",
  },
  {
    id: "long-trader",
    icon: "🐂",
    title: "Бык-лонгист",
    desc: "Открой лонг в симуляторе валютной позиции",
  },
  {
    id: "duty-master",
    icon: "🧮",
    title: "Мастер пошлин",
    desc: "Рассчитай пошлину всеми тремя способами в калькуляторе",
  },
  {
    id: "classifier",
    icon: "🗂️",
    title: "Классификатор",
    desc: "Разложи все карточки в игре-классификации без ошибок",
  },
  {
    id: "xp-100",
    icon: "💯",
    title: "Сотка",
    desc: "Набери 100 очков опыта",
  },
  {
    id: "xp-300",
    icon: "🏆",
    title: "Ветеран ВЭД",
    desc: "Набери 300 очков опыта",
  },
  {
    id: "glossary-read",
    icon: "📖",
    title: "Книжный червь",
    desc: "Открой глоссарий",
  },
  {
    id: "easter-egg",
    icon: "🥚",
    title: "Пасхалка",
    desc: "Найди секретик",
  },
];
