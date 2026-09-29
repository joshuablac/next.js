import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { cacheLife } from 'next/cache'
import { isFailing, recordRender } from '../../../control-state'

export function generateStaticParams() {
  return [{ slug: 'a' }]
}

// Shell-included cached data (no Suspense boundary of its own) that
// revalidates every 3s. When the fail flag is set, this simulates the
// upstream data source going down: every regeneration attempt fails until
// it's cleared again.
async function Data({ slug }: { slug: string }) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 3, expire: 3600 })
  recordRender()
  if (isFailing()) {
    throw new Error(`upstream down while rendering ${slug}`)
  }
  return <p id="content">content-{slug}</p>
}

// A dynamic hole is required: without one, the whole route is fully
// static, so it's served with a prerendered `.rsc` file
// (`prefetchDataRoute`) and RSC requests never reach the dynamic-RSC /
// Server Action revalidate block this fix changes — they're served
// through the ordinary response-cache path, which already backs off and
// reports. Reading a cookie is enough to force that; its own value isn't
// meaningful here.
async function Dyn() {
  const uid = (await cookies()).get('uid')?.value ?? 'none'
  return <p id="dyn">dyn-{uid}</p>
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main>
      <Data slug={slug} />
      <Suspense fallback={<p id="dyn">loading</p>}>
        <Dyn />
      </Suspense>
    </main>
  )
}
