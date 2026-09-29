import { Suspense } from 'react'

// No generateMetadata of its own — this page's title comes entirely from
// the parallel @crumbs slot.
export function generateStaticParams() {
  return [{ id: '1' }]
}

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <p id="product-body">PRODUCT {id}</p>
}

export default function Product({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // The fallback uses a different id than the resolved content
  // (#product-body): a raw HTML fetch (no browser, no hydration) sees both
  // in the same document, and a shared id would make `$('#product-body')`
  // match two elements and concatenate their text.
  return (
    <Suspense fallback={<p id="product-body-loading">loading product</p>}>
      <Inner params={params} />
    </Suspense>
  )
}
