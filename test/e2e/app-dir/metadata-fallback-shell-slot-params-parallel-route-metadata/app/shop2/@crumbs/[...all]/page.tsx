import { Suspense } from 'react'

// Breadcrumb slot without metadata of its own.
export function generateStaticParams() {
  return [{ all: ['products', '1'] }]
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
  // Distinct fallback id — see the comment in the /shop variant.
  return (
    <Suspense fallback={<span id="crumb-text-loading">loading crumbs</span>}>
      <Inner params={params} />
    </Suspense>
  )
}
