import { cn } from '@/lib/utils'
import { PANE_HEADER_ROW } from '@/lib/pane-layout'
import { LeftPaneViewBar } from './left-pane-view-bar'
import { LEFT_PANE_VIEWS } from './left-pane-views'
import type { LeftPaneViewId } from './left-pane-views'

interface LeftPaneProps {
  activeView: LeftPaneViewId
  onViewChange: (id: LeftPaneViewId) => void
  views: Partial<Record<LeftPaneViewId, React.ReactNode>>
}

export function LeftPane({ activeView, onViewChange, views }: LeftPaneProps): React.JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn(PANE_HEADER_ROW, 'gap-2')}>
        <LeftPaneViewBar activeView={activeView} onViewChange={onViewChange} />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {LEFT_PANE_VIEWS.map(({ id }) => {
          const node = views[id]
          if (node == null) return null
          const isActive = activeView === id
          return (
            <div
              key={id}
              className={cn(
                'min-h-0 flex-1 flex-col overflow-hidden',
                isActive ? 'flex' : 'hidden'
              )}
              aria-hidden={!isActive}
            >
              {node}
            </div>
          )
        })}
      </div>
    </div>
  )
}
