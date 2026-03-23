import { useEffect, useMemo, useState } from 'react'

interface PDFPreviewProps {
  pdfBase64: string | null
  error: string | null
  isCompiling: boolean
}

const PDF_VIEWER_FRAGMENT = '#toolbar=0&navpanes=0'
const RESIZE_PAUSE_MS = 150

export default function PDFPreview({
  pdfBase64,
  error,
  isCompiling
}: PDFPreviewProps): React.JSX.Element {
  const { displayUrl, revokeUrl } = useMemo(() => {
    if (!pdfBase64) return { displayUrl: null, revokeUrl: null }
    try {
      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const baseUrl = URL.createObjectURL(blob)
      return {
        displayUrl: `${baseUrl}${PDF_VIEWER_FRAGMENT}`,
        revokeUrl: baseUrl
      }
    } catch {
      return { displayUrl: null, revokeUrl: null }
    }
  }, [pdfBase64])

  useEffect(() => {
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
  }, [revokeUrl])

  // The browser's built-in PDF viewer inside the iframe can be very expensive
  // to re-layout while the Electron window is actively resizing. To keep the
  // resize animation smooth, we unmount the iframe while resizing and restore it
  // shortly after the resize settles.
  const [isWindowResizing, setIsWindowResizing] = useState(false)
  useEffect(() => {
    if (!displayUrl) return

    let timeout: ReturnType<typeof setTimeout> | null = null

    const onResize = (): void => {
      setIsWindowResizing(true)
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => setIsWindowResizing(false), RESIZE_PAUSE_MS)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (timeout) clearTimeout(timeout)
    }
  }, [displayUrl])

  if (isCompiling) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        <p className="mt-3 text-sm">Compiling LaTeX…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-2xl font-bold text-destructive">
          !
        </div>
        <p className="mt-3 font-semibold text-foreground">Compilation failed</p>
        <pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-left text-sm text-destructive">
          {error}
        </pre>
      </div>
    )
  }

  if (!displayUrl) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <p className="text-sm">Edit the source to generate a PDF preview.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-[#525659]">
      {isWindowResizing ? (
        // Lightweight placeholder to avoid iframe/PDF viewer repaint costs.
        <div
          className="flex-1 w-full border border-border bg-[#525659]"
          aria-label="PDF preview paused during resize"
        />
      ) : (
        <iframe
          src={displayUrl}
          title="CV PDF Preview"
          className="flex-1 w-full border border-border bg-[#525659]"
        />
      )}
    </div>
  )
}
