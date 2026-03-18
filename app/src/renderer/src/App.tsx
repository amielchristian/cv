import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import LaTeXEditor from './components/LaTeXEditor'
import PDFPreview from './components/PDFPreview'
import { DEFAULT_CV } from './constants/defaultCv'

const COMPILE_DEBOUNCE_MS = 800

function App(): React.JSX.Element {
  const [latex, setLatex] = useState(DEFAULT_CV)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const compile = useCallback(async (tex: string) => {
    if (!tex.trim()) {
      setPdfBase64(null)
      setError(null)
      return
    }
    setIsCompiling(true)
    setError(null)
    try {
      const result = await window.api.compileLaTeX(tex)
      if (result.success && result.pdfBase64) {
        setPdfBase64(result.pdfBase64)
        setError(null)
      } else {
        setPdfBase64(null)
        setError(result.error ?? 'Unknown compilation error')
      }
    } catch (err) {
      setPdfBase64(null)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsCompiling(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      compile(latex)
      debounceRef.current = null
    }, COMPILE_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [latex, compile])

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex-shrink-0 border-b border-border bg-muted/50 px-5 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          CV Builder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          LaTeX-powered • PDF preview updates as you type
        </p>
      </header>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 min-h-0"
      >
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full flex-col">
            <div className="flex-shrink-0 border-b border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              LaTeX
            </div>
            <LaTeXEditor value={latex} onChange={setLatex} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full flex-col">
            <div className="flex-shrink-0 border-b border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Preview
            </div>
            <PDFPreview
              pdfBase64={pdfBase64}
              error={error}
              isCompiling={isCompiling}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
