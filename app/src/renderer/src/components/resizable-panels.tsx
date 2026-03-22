import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { cn } from '@/lib/utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof PanelGroup>): React.JSX.Element {
  return (
    <PanelGroup
      className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
      {...props}
    />
  )
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof Panel>): React.JSX.Element {
  return <Panel className={cn(className)} {...props} />
}

function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandle>): React.JSX.Element {
  return (
    <PanelResizeHandle
      className={cn(
        'relative flex w-px items-center justify-center bg-[var(--border-scroll)] transition-colors duration-150 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]]:after:left-0',
        '[&[data-resize-handle-active]]:bg-primary [&[data-resize-handle-active]]:after:bg-[#989898]',
        className
      )}
      {...props}
    />
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
