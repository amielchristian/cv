import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PANE_HEADER_ROW } from '@/lib/pane-layout'

const linkClass =
  'rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground'

const activeClass = 'bg-background text-foreground shadow-sm ring-1 ring-border'

export function PrimaryNav(): React.JSX.Element {
  return (
    <nav className={cn(PANE_HEADER_ROW, 'gap-1 border-t-0')} aria-label="Primary">
      <NavLink to="/" end className={({ isActive }) => cn(linkClass, isActive && activeClass)}>
        Workspace
      </NavLink>
      <NavLink to="/cv" className={({ isActive }) => cn(linkClass, isActive && activeClass)}>
        CV data
      </NavLink>
      <NavLink to="/chat" className={({ isActive }) => cn(linkClass, isActive && activeClass)}>
        Chat
      </NavLink>
    </nav>
  )
}
