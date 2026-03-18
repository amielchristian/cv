import { useMemo, useEffect } from 'react'

interface PDFPreviewProps {
  pdfBase64: string | null
  error: string | null
  isCompiling: boolean
}

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
        displayUrl: `${baseUrl}#toolbar=0&navpanes=0`,
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

  if (isCompiling) {
    return (
      <div className="pdf-preview pdf-preview--loading">
        <div className="pdf-preview__spinner" />
        <p>Compiling LaTeX…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pdf-preview pdf-preview--error">
        <div className="pdf-preview__error-icon">!</div>
        <p className="pdf-preview__error-title">Compilation failed</p>
        <pre className="pdf-preview__error-message">{error}</pre>
      </div>
    )
  }

  if (!displayUrl) {
    return (
      <div className="pdf-preview pdf-preview--empty">
        <p>Edit LaTeX on the right to see the PDF preview.</p>
      </div>
    )
  }

  return (
    <div className="pdf-preview">
      <iframe
        src={displayUrl}
        title="CV PDF Preview"
        className="pdf-preview__iframe"
      />
    </div>
  )
}
