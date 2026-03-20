/**
 * Custom title bar for macOS.
 * Renders only when platform is darwin (macOS). Uses titleBarStyle: 'hiddenInset'
 * so native traffic lights remain in the top-left; this bar provides the draggable
 * region and app title below them.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/custom-title-bar
 */

const TITLE_BAR_HEIGHT = 38
const TRAFFIC_LIGHT_LEFT_PADDING = 72 // Space for native traffic lights (14 + ~52px)

export function TitleBar(): React.JSX.Element | null {
  if (typeof window === 'undefined' || window.api?.platform !== 'darwin') {
    return null
  }

  return (
    <header
      className="flex shrink-0 items-center justify-center bg-muted/50 backdrop-blur-xl"
      style={{
        height: TITLE_BAR_HEIGHT,
        paddingLeft: TRAFFIC_LIGHT_LEFT_PADDING,
        paddingRight: TRAFFIC_LIGHT_LEFT_PADDING,
        // @ts-ignore
        WebkitAppRegion: 'drag'
      }}
    >
      <span className="text-[13px] font-medium text-foreground/90">
        CV Builder
      </span>
    </header>
  )
}
