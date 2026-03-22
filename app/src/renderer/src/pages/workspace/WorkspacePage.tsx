import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/resizable-panels'
import { EditorPage } from '@/pages/editor/EditorPage'
import { PreviewPage } from '@/pages/preview/PreviewPage'
import type { LeftPaneViewId } from '@/pages/editor/left-pane-views'

export interface WorkspacePageProps {
  latex: string
  onLatexChange: (value: string) => void
  activeView: LeftPaneViewId
  onViewChange: (id: LeftPaneViewId) => void
  pdfBase64: string | null
  error: string | null
  isCompiling: boolean
}

export function WorkspacePage({
  latex,
  onLatexChange,
  activeView,
  onViewChange,
  pdfBase64,
  error,
  isCompiling
}: WorkspacePageProps): React.JSX.Element {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
      <ResizablePanel defaultSize={50} minSize={20}>
        <EditorPage
          latex={latex}
          onLatexChange={onLatexChange}
          activeView={activeView}
          onViewChange={onViewChange}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <PreviewPage pdfBase64={pdfBase64} error={error} isCompiling={isCompiling} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
