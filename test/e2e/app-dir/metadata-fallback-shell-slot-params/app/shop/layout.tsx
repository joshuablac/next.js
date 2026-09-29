import { ReactNode } from 'react'

// /shop: the breadcrumb slot's own generateMetadata supplies the title,
// reading the slot's own catch-all param — which is a fallback (unknown at
// shell-prerender time) param for any id that generateStaticParams doesn't
// cover, same as `id` is for the products page.
export default function ShopLayout({
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
