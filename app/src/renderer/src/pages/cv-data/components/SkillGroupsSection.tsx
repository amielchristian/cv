import type { SkillGroup } from '../cv-schema'
import { SectionTitle, inputClass, labelClass } from './cvDataUi'

export function SkillGroupsSection({
  rows,
  onPatch,
  onRemove,
  onAdd
}: {
  rows: SkillGroup[]
  onPatch: (id: string, patch: Partial<SkillGroup>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <SectionTitle>Skills</SectionTitle>
      {rows.map((row) => (
        <div key={row.id} className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
          <label className={labelClass}>
            Group name
            <input
              className={inputClass}
              value={row.name}
              onChange={(e) => onPatch(row.id, { name: e.target.value })}
            />
          </label>
          <label className={`${labelClass} mt-2 block`}>
            Skills (comma-separated or one per line)
            <textarea
              className={`${inputClass} min-h-[4rem] resize-y`}
              value={row.skills}
              onChange={(e) => onPatch(row.id, { skills: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="mt-2 text-xs text-destructive hover:underline"
            onClick={() => onRemove(row.id)}
          >
            Remove group
          </button>
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
        onClick={onAdd}
      >
        Add skill group
      </button>
    </section>
  )
}

