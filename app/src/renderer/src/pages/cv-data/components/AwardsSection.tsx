import type { AwardEntry } from '../cv-schema'
import { SectionTitle, inputClass, labelClass } from './cvDataUi'

export function AwardsSection({
  rows,
  onPatch,
  onRemove,
  onAdd
}: {
  rows: AwardEntry[]
  onPatch: (id: string, patch: Partial<AwardEntry>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <SectionTitle>Certifications</SectionTitle>
      {rows.map((row) => (
        <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
          <div className="grid gap-2 sm:grid-cols-3">
            <label className={labelClass}>
              Name
              <input
                className={inputClass}
                value={row.name}
                onChange={(e) => onPatch(row.id, { name: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Conferrer
              <input
                className={inputClass}
                value={row.conferrer}
                onChange={(e) => onPatch(row.id, { conferrer: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Date
              <input
                className={inputClass}
                value={row.date}
                onChange={(e) => onPatch(row.id, { date: e.target.value })}
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-2 text-xs text-destructive hover:underline"
            onClick={() => onRemove(row.id)}
          >
            Remove entry
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
        onClick={onAdd}
      >
        Add certification
      </button>
    </section>
  )
}

