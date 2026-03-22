import { LEFT_PANE_VIEWS, type LeftPaneViewId } from './left-pane-views'

interface LeftPaneViewBarProps {
  activeView: LeftPaneViewId
  onViewChange: (id: LeftPaneViewId) => void
}

function tabButtonClassName(selected: boolean): string {
  const state = selected
    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
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
        const selected = activeView === def.id
        return (
          <button
            key={def.id}
            type="button"
            role="tab"
            aria-selected={selected}
            title={def.label}
            onClick={() => onViewChange(def.id)}
            className={tabButtonClassName(selected)}
          >
            {def.label}
          </button>
        )
      })}
    </div>
  )
}
