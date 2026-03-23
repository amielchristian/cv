import type { ExperienceEntry } from '../cv-schema'
import { inputClass, labelClass } from './cvDataUi'

export function ExperienceBlock({
  row,
  onChange,
  onRemove
}: {
  row: ExperienceEntry
  onChange: (next: ExperienceEntry) => void
  onRemove: () => void
}): React.JSX.Element {
  return (
    <div className="mb-4 rounded-md border border-border/80 p-3 last:mb-0">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={labelClass}>
          Organization
          <input
            className={inputClass}
            value={row.organization}
            onChange={(e) => onChange({ ...row, organization: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Role
          <input
            className={inputClass}
            value={row.role}
            onChange={(e) => onChange({ ...row, role: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          Start
          <input
            className={inputClass}
            value={row.startDate}
            onChange={(e) => onChange({ ...row, startDate: e.target.value })}
          />
        </label>
        <label className={labelClass}>
          End
          <input
            className={inputClass}
            value={row.endDate}
            onChange={(e) => onChange({ ...row, endDate: e.target.value })}
          />
        </label>
      </div>
      <label className={`${labelClass} mt-2 block`}>
        Bullets (one per line)
        <textarea
          className={`${inputClass} min-h-[5rem] resize-y font-mono text-xs`}
          value={row.bullets}
          onChange={(e) => onChange({ ...row, bullets: e.target.value })}
        />
      </label>
      <button type="button" className="mt-2 text-xs text-destructive hover:underline" onClick={onRemove}>
        Remove entry
      </button>
    </div>
  )
}

