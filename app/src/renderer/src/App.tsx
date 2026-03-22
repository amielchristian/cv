import { useCallback, useEffect, useRef, useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/resizable-panels'
import { EditorPage } from './pages/editor/EditorPage'
import { PreviewPage } from './pages/preview/PreviewPage'
import { TitleBar } from './components/TitleBar'
import { DEFAULT_CV } from './constants/defaultCv'
import type { LeftPaneViewId } from './pages/editor/left-pane-views'

const COMPILE_DEBOUNCE_MS = 800
const SAVE_DEBOUNCE_MS = 500

function App(): React.JSX.Element {
  const [latex, setLatex] = useState(DEFAULT_CV)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [leftPaneView, setLeftPaneView] = useState<LeftPaneViewId>('source')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let isMounted = true
    const load = async (): Promise<void> => {
      try {
        const savedLatex = await window.api.loadLaTeX()
        if (isMounted && savedLatex !== null) {
          setLatex(savedLatex)
        }
      } catch {
        // Ignore load failures and fall back to default content.
      } finally {
        if (isMounted) setIsLoaded(true)
      }
    }
    load()
    return () => {
      isMounted = false
    }
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
    if (!isLoaded) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      compile(latex)
      debounceRef.current = null
    }, COMPILE_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [latex, compile, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
    saveDebounceRef.current = setTimeout(() => {
      void window.api.saveLaTeX(latex).catch((err) => {
        console.error('Failed to save LaTeX:', err)
      })
      saveDebounceRef.current = null
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current)
    }
  }, [latex, isLoaded])

  useEffect(() => {
    const flushOnClose = (): void => {
      const result = window.api.saveLaTeXSync(latex)
      if (!result.ok) {
        console.error('Failed to synchronously save LaTeX:', result.error)
      }
    }
    window.addEventListener('beforeunload', flushOnClose)
    return () => {
      window.removeEventListener('beforeunload', flushOnClose)
    }
  }, [latex])

  return (
    <div className="flex h-screen flex-col bg-background">
      <TitleBar />
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={50} minSize={20}>
          <EditorPage
            latex={latex}
            onLatexChange={setLatex}
            activeView={leftPaneView}
            onViewChange={setLeftPaneView}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50} minSize={20}>
          <PreviewPage pdfBase64={pdfBase64} error={error} isCompiling={isCompiling} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default App
