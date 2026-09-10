import type { DemoId } from "../data/types";
import { TradeFlow } from "./TradeFlow";
import { TnkDemo } from "./TnkDemo";
import {
  ClassifyGame,
  type ClassifyCategory,
  type ClassifyItem,
} from "./ClassifyGame";
import { CaseGame, type CaseItem } from "./CaseGame";
import { DutyCalculator } from "./DutyCalculator";
import { ScalesDemo } from "./ScalesDemo";
import { PositionSim } from "./PositionSim";

const formsCats: ClassifyCategory[] = [
  { id: "trade", label: "Торговля", emoji: "🛒" },
  { id: "barter", label: "Бартер", emoji: "🔄" },
  { id: "tourism", label: "Туризм", emoji: "🏖️" },
  { id: "franchise", label: "Франчайзинг", emoji: "🍟" },
  { id: "engineering", label: "Инжиниринг", emoji: "🛠️" },
];

const formsItems: ClassifyItem[] = [
  {
    id: "grain",
    label: "Покупка зерна у Канады",
    emoji: "🌾",
    category: "trade",
    explain: "Торговля: деньги за товар.",
  },
  {
    id: "steel",
    label: "Продажа стали в Европу",
    emoji: "🏗️",
    category: "trade",
    explain: "Торговля: товар за деньги.",
  },
  {
    id: "oil-equip",
    label: "Нефть в обмен на оборудование",
    emoji: "🛢️",
    category: "barter",
    explain: "Бартер: обмен без денег.",
  },
  {
    id: "planes",
    label: "Самолёты в обмен на никель",
    emoji: "✈️",
    category: "barter",
    explain: "Бартер: товар на товар.",
  },
  {
    id: "turkey",
    label: "Отпуск в Турции",
    emoji: "🌴",
    category: "tourism",
    explain: "Туризм — форма внешнеэкономических связей.",
  },
  {
    id: "coffee",
    label: "Кофейня под чужим брендом",
    emoji: "☕",
    category: "franchise",
    explain: "Франчайзинг: бренд и модель за плату.",
  },
  {
    id: "ges",
    label: "Проектирование ГЭС за рубежом",
    emoji: "🌊",
    category: "engineering",
    explain: "Инжиниринг: инженерно-консультационные услуги.",
  },
  {
    id: "training",
    label: "Обучение персонала завода",
    emoji: "🎓",
    category: "engineering",
    explain: "Инжиниринг: сопровождение и обучение.",
  },
];

const subjectsCats: ClassifyCategory[] = [
  { id: "general", label: "Общая компетенция", emoji: "🏛️" },
  { id: "special", label: "Специальная компетенция", emoji: "🔎" },
  { id: "business", label: "Предприниматели", emoji: "💼" },
];

const subjectsItems: ClassifyItem[] = [
  {
    id: "president",
    label: "Президент РФ",
    emoji: "👤",
    category: "general",
    explain: "Регулирует ВЭД в целом — общая компетенция.",
  },
  {
    id: "government",
    label: "Правительство РФ",
    emoji: "🏛️",
    category: "general",
    explain: "Общая компетенция.",
  },
  {
    id: "minec",
    label: "Минэкономразвития",
    emoji: "📈",
    category: "general",
    explain: "Общая компетенция: торговля и развитие.",
  },
  {
    id: "fts",
    label: "ФТС",
    emoji: "🛃",
    category: "special",
    explain: "Контроль и надзор в таможенном деле.",
  },
  {
    id: "minfin",
    label: "Минфин",
    emoji: "💰",
    category: "special",
    explain: "Валютные операции, таможенные платежи.",
  },
  {
    id: "fstec",
    label: "ФСТЭК",
    emoji: "🔐",
    category: "special",
    explain: "Федеральная служба: экспортный контроль.",
  },
  {
    id: "exporter",
    label: "Завод-экспортёр",
    emoji: "🏭",
    category: "business",
    explain: "Ведёт предпринимательскую деятельность в ВЭД.",
  },
  {
    id: "broker",
    label: "Фирма-посредник",
    emoji: "🤝",
    category: "business",
    explain: "Посредническая деятельность в ВЭД.",
  },
];

const measuresCases: CaseItem[] = [
  {
    icon: "🚫",
    text: "РФ полностью запретила ввоз сыров из ЕС. Это…",
    options: ["Эмбарго", "Квота", "Лицензия", "Адвалорная пошлина"],
    correct: 0,
    explain: "Эмбарго — полный запрет на ввоз/вывоз.",
  },
  {
    icon: "⚖️",
    text: "Ввезти сахара можно не больше 1000 тонн в год. Это…",
    options: ["Квотирование", "Эмбарго", "Лицензирование", "Таможенный сбор"],
    correct: 0,
    explain: "Квота — количественное ограничение.",
  },
  {
    icon: "📄",
    text: "Для ввоза шифровальной техники нужно разрешение ФСТЭК. Это…",
    options: ["Лицензирование", "Эмбарго", "Квота", "НДС"],
    correct: 0,
    explain: "Разрешительный порядок — лицензирование.",
  },
  {
    icon: "💸",
    text: "С импортных машин берут 15% от таможенной стоимости. Это…",
    options: ["Таможенно-тарифная мера", "Нетарифная мера", "Эмбарго", "Квота"],
    correct: 0,
    explain: "Пошлина — таможенно-тарифное регулирование.",
  },
];

const riskCases: CaseItem[] = [
  {
    icon: "💶",
    text: "Подписали контракт в евро, а к моменту оплаты евро подешевел — на конвертации потеряли. Это…",
    options: [
      "Операционный риск",
      "Трансляционный риск",
      "Экономический риск",
      "Кредитный риск",
    ],
    correct: 0,
    explain:
      "Риск по конкретной сделке между заключением и расчётом — операционный.",
  },
  {
    icon: "📊",
    text: "Дочка в США принесла $10 млн прибыли, курс доллара упал — в рублёвой отчётности стало меньше. Это…",
    options: [
      "Трансляционный риск",
      "Операционный риск",
      "Экономический риск",
      "Валютная позиция",
    ],
    correct: 0,
    explain:
      "Пересчёт активов зарубежных подразделений при консолидации — трансляционный.",
  },
  {
    icon: "🏭",
    text: "Укрепившийся рубль сделал продукцию экспортёра дороже для иностранцев, спрос упал. Это…",
    options: [
      "Экономический риск",
      "Операционный риск",
      "Трансляционный риск",
      "Эмбарго",
    ],
    correct: 0,
    explain:
      "Долгосрочное влияние курса на конкурентоспособность — экономический риск.",
  },
];

const demos: Record<DemoId, () => React.JSX.Element> = {
  "trade-flow": TradeFlow,
  tnk: TnkDemo,
  "classify-forms": () => (
    <ClassifyGame categories={formsCats} items={formsItems} />
  ),
  "classify-subjects": () => (
    <ClassifyGame categories={subjectsCats} items={subjectsItems} />
  ),
  "duty-calc": DutyCalculator,
  "case-measures": () => (
    <CaseGame cases={measuresCases} title="Меры регулирования" />
  ),
  scales: ScalesDemo,
  "position-sim": PositionSim,
  "case-risks": () => (
    <CaseGame cases={riskCases} title="Виды валютных рисков" />
  ),
};

export function DemoRenderer({ demo }: { demo: DemoId }) {
  const C = demos[demo];
  return <C />;
}
