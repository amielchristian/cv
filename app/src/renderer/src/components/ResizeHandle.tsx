interface ResizeHandleProps {
  onResize: (deltaX: number) => void
}

export default function ResizeHandle({ onResize }: ResizeHandleProps): React.JSX.Element {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    let lastX = e.clientX

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - lastX
      lastX = moveEvent.clientX
      onResize(deltaX)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div
      className="cv-builder__resize-handle"
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  )
}
