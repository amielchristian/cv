import { LEFT_PANE_VIEWS, type LeftPaneViewId } from './left-pane-views'

interface LeftPaneViewBarProps {
  activeView: LeftPaneViewId
  onViewChange: (id: LeftPaneViewId) => void
}

function tabButtonClassName(selected: boolean, selectable: boolean): string {
  let state: string
  if (selected && selectable) {
    state = 'bg-background text-foreground shadow-sm ring-1 ring-border'
  } else if (selectable) {
    state = 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
  } else {
    state = 'cursor-not-allowed text-muted-foreground/50'
  }
  return [
    'min-w-0 truncate rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
    state
  ].join(' ')
}

export function LeftPaneViewBar({
  activeView,
  onViewChange
}: LeftPaneViewBarProps): React.JSX.Element {
  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-1"
      role="tablist"
      aria-label="Left pane view"
    >
      {LEFT_PANE_VIEWS.map((def) => {
        const selectable = def.status === 'available'
        const selected = activeView === def.id
        return (
          <button
            key={def.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-disabled={!selectable}
            disabled={!selectable}
            title={
              selectable
                ? def.label
                : `${def.label} — planned (register a renderer in the left pane)`
            }
            onClick={() => onViewChange(def.id)}
            className={tabButtonClassName(selected, selectable)}
          >
            {def.label}
          </button>
        )
      })}
    </div>
  )
}
