import { cn } from '@/lib/utils'
import { PANE_HEADER_ROW } from '@/lib/pane-layout'
import PDFPreview from './PDFPreview'

export interface PreviewPageProps {
  pdfBase64: string | null
  error: string | null
  isCompiling: boolean
}

export function PreviewPage({
  pdfBase64,
  error,
  isCompiling
}: PreviewPageProps): React.JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          PANE_HEADER_ROW,
          'text-xs font-semibold uppercase tracking-wide text-muted-foreground'
        )}
      >
        Preview
      </div>
      <PDFPreview pdfBase64={pdfBase64} error={error} isCompiling={isCompiling} />
    </div>
  )
}
