import { Suspense } from 'react'

// The common case: this page's own generateMetadata reads its own
// (fallback) param.
export function generateStaticParams() {
  return [{ id: '1' }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return { title: 'product ' + JSON.stringify(id) }
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
  // Distinct fallback id — see the comment in the /shop variant.
  return (
    <Suspense fallback={<p id="product-body-loading">loading product</p>}>
      <Inner params={params} />
    </Suspense>
  )
}
