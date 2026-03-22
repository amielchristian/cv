import { LeftPane } from './LeftPane'
import LaTeXEditor from './LaTeXEditor'
import type { LeftPaneViewId } from './left-pane-views'

export interface EditorPageProps {
  latex: string
  onLatexChange: (value: string) => void
  activeView: LeftPaneViewId
  onViewChange: (id: LeftPaneViewId) => void
}

export function EditorPage({
  latex,
  onLatexChange,
  activeView,
  onViewChange
}: EditorPageProps): React.JSX.Element {
  return (
    <LeftPane
      activeView={activeView}
      onViewChange={onViewChange}
      views={{
        source: <LaTeXEditor value={latex} onChange={onLatexChange} />
      }}
    />
  )
}
