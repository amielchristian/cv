export type LeftPaneViewId = 'source' | 'outline' | 'snippets'

export type LeftPaneViewStatus = 'available' | 'planned'

export interface LeftPaneViewDefinition {
  id: LeftPaneViewId
  label: string
  status: LeftPaneViewStatus
}

export const LEFT_PANE_VIEWS: readonly LeftPaneViewDefinition[] = [
  { id: 'source', label: 'Source', status: 'available' },
  { id: 'outline', label: 'Outline', status: 'planned' },
  { id: 'snippets', label: 'Snippets', status: 'planned' }
] as const
