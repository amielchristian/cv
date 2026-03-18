import { useCallback, useRef, useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { latex } from 'codemirror-lang-latex'

interface LaTeXEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function LaTeXEditor({
  value,
  onChange,
  placeholder
}: LaTeXEditorProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState('400px')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const h = e.contentRect.height
        if (h > 0) setHeight(`${Math.round(h)}px`)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleChange = useCallback(
    (val: string) => {
      onChange(val)
    },
    [onChange]
  )

  return (
    <div ref={containerRef} className="latex-editor">
      <CodeMirror
        value={value}
        height={height}
        minHeight="400px"
        placeholder={placeholder}
        extensions={[latex()]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          indentOnInput: true,
          tabSize: 2
        }}
        theme="dark"
      />
    </div>
  )
}
