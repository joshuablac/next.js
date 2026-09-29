import { ReactNode } from 'react'

// /shop2: the common case — the products page's own generateMetadata reads
// its own (fallback) param, and already worked correctly before this fix.
// Kept alongside /shop as a control: it isolates the regression to slot
// params specifically, not to fallback params in general.
export default function Shop2Layout({
  children,
  crumbs,
}: {
  children: ReactNode
  crumbs: ReactNode
}) {
  return (
    <div>
      <nav id="crumbs">{crumbs}</nav>
      {children}
    </div>
  )
}
