export type LeftPaneViewId = 'source' | 'cvData' | 'chat'

export interface LeftPaneViewDefinition {
  id: LeftPaneViewId
  label: string
}

export const LEFT_PANE_VIEWS: readonly LeftPaneViewDefinition[] = [
  { id: 'source', label: 'Editor' },
  { id: 'cvData', label: 'Data' },
  { id: 'chat', label: 'Chat' }
] as const
