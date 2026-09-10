const lecturer = {
  name: "Карпунина Елена Валерьевна",
  titles: "кандидат экономических наук, доцент",
  position:
    "доцент кафедры «Экономическая безопасность, анализ и учёт» РГРТУ им. В.Ф. Уткина",
  facts: [
    "Учёная степень к.э.н. присуждена в 2010 году",
    "Учёное звание доцента по специальности 08.00.12 «Бухгалтерский учёт, статистика» — 2016",
    "Ведёт дисциплину «Учёт и анализ внешнеэкономической деятельности»",
    "Образование: Рязанская ГСХА им. П.А. Костычева, 2006 (диплом с отличием)",
  ],
  profile:
    "https://rsreu.ru/faculties/ief/kafedri/eau/menu-1131/7292-item-7292",
};

/** Карточки «О лекторе» и «Разработка» — показываются в начале лекции. */
export function Credits() {
  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-3 shadow-tds-card">
        <div className="text-sm font-bold text-tds-text">👩‍🏫 О лекторе</div>
        <div className="mt-1 text-[13px] leading-relaxed text-tds-text">
          <strong>{lecturer.name}</strong> — {lecturer.titles},{" "}
          {lecturer.position}.
        </div>
        <details className="mt-1 text-[12px] leading-relaxed text-tds-muted">
          <summary className="cursor-pointer font-semibold text-tds-yellow-pressed">
            титулы и факты
          </summary>
          <ul className="mt-1.5 list-inside list-disc space-y-1">
            {lecturer.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
        <a
          href={lecturer.profile}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block text-xs font-semibold text-tds-yellow-pressed"
        >
          страница на rsreu.ru ↗
        </a>
      </div>
      <div className="rounded-tds-card border border-tds-border bg-tds-card p-3 shadow-tds-card">
        <div className="text-sm font-bold text-tds-text">👨‍💻 Разработка</div>
        <div className="mt-1 text-[13px] leading-relaxed text-tds-text">
          <strong>Радмир Мустафин</strong> — QA-инженер Т-Банка
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-tds-muted">
          Интерактивная лекция: живые примеры, игры, квизы, вибро-отдача и
          немного валютного риска в футере.
        </div>
      </div>
    </div>
  );
}
