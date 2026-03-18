import { useState, useCallback, useEffect, useRef } from 'react'
import LaTeXEditor from './components/LaTeXEditor'
import PDFPreview from './components/PDFPreview'
import ResizeHandle from './components/ResizeHandle'
import { DEFAULT_CV } from './constants/defaultCv'

const COMPILE_DEBOUNCE_MS = 800
const MIN_PANE_WIDTH = 200
const DEFAULT_EDITOR_WIDTH = 0.5

function App(): React.JSX.Element {
  const [latex, setLatex] = useState(DEFAULT_CV)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [editorWidthRatio, setEditorWidthRatio] = useState(DEFAULT_EDITOR_WIDTH)
  const mainRef = useRef<HTMLElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleResize = useCallback((deltaX: number) => {
    setEditorWidthRatio((prev) => {
      if (!mainRef.current) return prev
      const totalWidth = mainRef.current.clientWidth
      const editorWidth = prev * totalWidth + deltaX
      const newRatio = Math.max(MIN_PANE_WIDTH / totalWidth, Math.min(1 - MIN_PANE_WIDTH / totalWidth, editorWidth / totalWidth))
      return newRatio
    })
  }, [])

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
    <div className="cv-builder">
      <header className="cv-builder__header">
        <h1 className="cv-builder__title">CV Builder</h1>
        <p className="cv-builder__subtitle">
          LaTeX-powered • PDF preview updates as you type
        </p>
      </header>
      <main ref={mainRef} className="cv-builder__main">
        <section
          className="cv-builder__pane cv-builder__pane--editor"
          style={{ flex: `0 0 ${editorWidthRatio * 100}%` }}
        >
          <div className="cv-builder__pane-header">LaTeX</div>
          <LaTeXEditor value={latex} onChange={setLatex} />
        </section>
        <ResizeHandle onResize={handleResize} />
        <section className="cv-builder__pane cv-builder__pane--pdf">
          <div className="cv-builder__pane-header">Preview</div>
          <PDFPreview
            pdfBase64={pdfBase64}
            error={error}
            isCompiling={isCompiling}
          />
        </section>
      </main>
    </div>
  )
}

export default App
