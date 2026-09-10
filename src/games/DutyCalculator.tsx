import { useState } from "react";
import { useStore } from "../store";
import { tick } from "../lib/haptics";

interface Good {
  id: string;
  icon: string;
  name: string;
  adValorem: number; // %
  specific: number; // € за 1 кг
  price: number; // таможенная стоимость, ₽
  weight: number; // кг
}

const goods: Good[] = [
  {
    id: "phone",
    icon: "📱",
    name: "Смартфон",
    adValorem: 10,
    specific: 0.5,
    price: 50_000,
    weight: 0.3,
  },
  {
    id: "cheese",
    icon: "🧀",
    name: "Сыр",
    adValorem: 5,
    specific: 2,
    price: 12_000,
    weight: 10,
  },
  {
    id: "car",
    icon: "🚗",
    name: "Автомобиль",
    adValorem: 15,
    specific: 3,
    price: 2_400_000,
    weight: 1500,
  },
];

const EUR = 100; // упрощённо: 1 € ≈ 100 ₽ для наглядности

function fmt(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });
}

/** Калькулятор таможенной пошлины: адвалорная / специфическая / комбинированная. */
export function DutyCalculator() {
  const [goodId, setGoodId] = useState(goods[0].id);
  const [price, setPrice] = useState(goods[0].price);
  const [weight, setWeight] = useState(goods[0].weight);
  const [seen, setSeen] = useState<Set<string>>(new Set([goods[0].id]));
  const unlock = useStore((s) => s.unlock);
  const good = goods.find((g) => g.id === goodId)!;

  const pickGood = (g: Good) => {
    setGoodId(g.id);
    setPrice(g.price);
    setWeight(g.weight);
    tick();
    const next = new Set(seen).add(g.id);
    setSeen(next);
    if (next.size === goods.length) unlock("duty-master");
  };

  const adValorem = (price * good.adValorem) / 100;
  const specific = weight * good.specific * EUR;
  const combined = Math.max(adValorem, specific);

  const rows = [
    {
      name: "Адвалорная",
      formula: `${good.adValorem}% от стоимости`,
      sum: adValorem,
    },
    {
      name: "Специфическая",
      formula: `${good.specific} €/кг × ${fmt(weight)} кг`,
      sum: specific,
    },
    { name: "Комбинированная", formula: "максимум из двух", sum: combined },
  ];

  return (
    <div className="rounded-tds-card border border-tds-border bg-tds-card p-4 shadow-tds-card">
      <div className="mb-3 flex gap-1.5">
        {goods.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => pickGood(g)}
            className={`flex-1 rounded-tds-btn border px-2 py-2 text-center text-xs font-bold transition ${
              g.id === goodId
                ? "border-tds-yellow bg-tds-yellow-soft text-tds-text"
                : "border-tds-border bg-tds-bg text-tds-muted hover:border-tds-yellow"
            }`}
          >
            <span className="block text-lg">{g.icon}</span>
            {g.name}
          </button>
        ))}
      </div>

      <div className="rounded-tds-btn bg-tds-bg p-3">
        <div className="flex justify-between text-xs font-semibold text-tds-muted">
          <span>💰 Таможенная стоимость: {fmt(price)} ₽</span>
          <span>⚖️ Вес: {weight} кг</span>
        </div>
        <label className="mt-2 block">
          <input
            type="range"
            min={1000}
            max={Math.max(3_000_000, price * 2)}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Таможенная стоимость"
          />
        </label>
        <label className="block">
          <input
            type="range"
            min={1}
            max={2000}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            aria-label="Вес товара"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {rows.map((r) => {
          const isMax = r.sum === combined;
          return (
            <div
              key={r.name}
              className={`flex items-center justify-between rounded-tds-btn border px-3 py-2.5 ${
                isMax
                  ? "border-tds-yellow bg-tds-yellow-soft"
                  : "border-tds-border bg-tds-bg"
              }`}
            >
              <div>
                <div className="text-sm font-bold text-tds-text">{r.name}</div>
                <div className="text-xs text-tds-muted">{r.formula}</div>
              </div>
              <div className="text-lg font-extrabold tabular-nums text-tds-text">
                {fmt(r.sum)} ₽
                {isMax && (
                  <span className="ml-1 text-xs font-bold text-tds-yellow-pressed">
                    ← платим
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-center text-xs text-tds-muted">
        Комбинированная ставка применяется по наибольшей сумме (1 € ≈ 100 ₽ для
        наглядности)
      </div>
    </div>
  );
}
