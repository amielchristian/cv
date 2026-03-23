import type { ExperienceEntry } from '../cv-schema'
import { SectionTitle } from './cvDataUi'
import { ExperienceBlock } from './ExperienceBlock'

export function ExperienceSection({
  title,
  rows,
  onChangeRow,
  onRemoveRow,
  onAdd,
  addLabel
}: {
  title: string
  rows: ExperienceEntry[]
  onChangeRow: (next: ExperienceEntry) => void
  onRemoveRow: (id: string) => void
  onAdd: () => void
  addLabel: string
}): React.JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <SectionTitle>{title}</SectionTitle>
      {rows.map((row) => (
        <ExperienceBlock
          key={row.id}
          row={row}
          onChange={onChangeRow}
          onRemove={() => onRemoveRow(row.id)}
        />
      ))}
      <button
        type="button"
        className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
        onClick={onAdd}
      >
        {addLabel}
      </button>
    </section>
  )
}

