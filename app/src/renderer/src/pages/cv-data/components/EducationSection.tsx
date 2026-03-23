import type { EducationEntry } from '../cv-schema'
import { SectionTitle, inputClass, labelClass } from './cvDataUi'

export function EducationSection({
  rows,
  onPatch,
  onRemove,
  onAdd
}: {
  rows: EducationEntry[]
  onPatch: (id: string, patch: Partial<EducationEntry>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <SectionTitle>Education</SectionTitle>
      {rows.map((row) => (
        <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={labelClass}>
              Institution
              <input
                className={inputClass}
                value={row.institution}
                onChange={(e) => onPatch(row.id, { institution: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Program
              <input
                className={inputClass}
                value={row.program}
                onChange={(e) => onPatch(row.id, { program: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Start
              <input
                className={inputClass}
                value={row.startDate}
                onChange={(e) => onPatch(row.id, { startDate: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              End
              <input
                className={inputClass}
                value={row.endDate}
                onChange={(e) => onPatch(row.id, { endDate: e.target.value })}
              />
            </label>
          </div>
          <label className={`${labelClass} mt-2 block`}>
            Addenda (honors, GWA, etc.)
            <textarea
              className={`${inputClass} min-h-[4rem] resize-y`}
              value={row.addenda}
              onChange={(e) => onPatch(row.id, { addenda: e.target.value })}
            />
          </label>
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
        Add education
      </button>
    </section>
  )
}

