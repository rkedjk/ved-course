export function LawLink({
  title,
  url,
  note,
}: {
  title: string;
  url: string;
  note?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-tds-card border border-tds-border bg-tds-card p-3 text-left text-sm shadow-tds-card transition hover:border-tds-yellow hover:shadow-tds-pop"
    >
      <span className="mt-0.5 text-lg">📜</span>
      <span className="min-w-0">
        <span className="block font-semibold text-tds-text">{title}</span>
        {note && (
          <span className="mt-0.5 block text-xs text-tds-muted">{note}</span>
        )}
        <span className="mt-1 block text-xs font-medium text-tds-yellow-pressed">
          открыть закон ↗
        </span>
      </span>
    </a>
  );
}
