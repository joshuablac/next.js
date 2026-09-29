import { Suspense } from 'react'

// Breadcrumb slot (the documented @breadcrumbs catch-all pattern). Its
// generateMetadata supplies the document title from the slot's own param,
// which the sibling products page does not read.
export function generateStaticParams() {
  return [{ all: ['products', '1'] }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ all: string[] }>
}) {
  const { all } = await params
  return { title: 'crumb ' + JSON.stringify(all) }
}

async function Inner({ params }: { params: Promise<{ all: string[] }> }) {
  const { all } = await params
  return <span id="crumb-text">{JSON.stringify(all)}</span>
}

export default function Crumbs({
  params,
}: {
  params: Promise<{ all: string[] }>
}) {
  // A fallback param must be read inside Suspense, or accessing it forces
  // the whole page dynamic instead of deferring just this subtree to the
  // per-request resume — same reason generateMetadata's own deferral
  // (this fix) matters for the head. The fallback uses a different id than
  // the resolved content (#crumb-text) — see the comment on the sibling
  // products page for why.
  return (
    <Suspense fallback={<span id="crumb-text-loading">loading crumbs</span>}>
      <Inner params={params} />
    </Suspense>
  )
}
