import type { ReactNode } from 'react'

export const inputClass =
  'mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export const labelClass = 'text-xs font-medium text-muted-foreground'

export function SectionTitle({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <h2 className="mb-3 border-b border-[var(--border-scroll)] pb-1 text-sm font-semibold uppercase tracking-wide text-foreground">
      {children}
    </h2>
  )
}

