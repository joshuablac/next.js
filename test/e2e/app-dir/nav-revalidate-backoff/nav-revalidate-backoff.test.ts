import { nextTestSetup } from 'e2e-utils'

// Regression test: with cacheComponents, a stale `'use cache'` shell entry
// whose background regeneration fails used to be re-prerendered on every
// client-side (RSC) navigation, with no backoff — because the navigation
// path passed `null` as the previous cache entry to avoid a different bug
// (on-demand-revalidation misdetection), which also meant nothing re-armed
// the entry after a failure the way it does for ordinary document requests.
// The failures also never reached `onRequestError`, only `console.error`.
//
// This sends a burst of navigation-style requests to a page whose cached
// data throws, once its entry has gone stale, and checks that only about
// one of them actually re-ran the failing render (matching the
// document-request path's behavior), and that at least one of the failures
// was reported through onRequestError with revalidateReason "stale".
describe('nav-revalidate-backoff', () => {
  const { next, isNextStart } = nextTestSetup({
    files: __dirname,
  })

  if (!isNextStart) {
    // The backoff being tested is ResponseCache's runtime ISR/PPR
    // revalidation path, which only exists for a built, started app.
    test('only relevant for a production server', () => {})
    return
  }

  it('backs off after a failed background revalidation triggered by a navigation, and reports it', async () => {
    await next.fetch('/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    })

    // Prime the entry (built with the fail flag off, so this should already
    // be a cache hit, but this also confirms the fixture is healthy). This
    // may itself trigger a background render if the built entry was already
    // past its stale window by the time the test runs, so reset the render
    // count again afterwards — only renders from the burst below count.
    const warm = await next.fetch('/p/a')
    expect(warm.status).toBe(200)
    await next.fetch('/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    })

    // The upstream goes down, and we wait for the existing entry to age
    // past its 3s `revalidate` window.
    await next.fetch('/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fail: true }),
    })
    await new Promise((resolve) => setTimeout(resolve, 3500))

    // A burst of navigation-style requests, comfortably inside the 3s
    // window a single failure should re-arm the entry for.
    for (let i = 0; i < 8; i++) {
      await next.fetch('/p/a?_rsc', { headers: { RSC: '1' } })
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Give any work registered through waitUntil a moment to finish.
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = await next
      .fetch('/control')
      .then((res) => res.json() as Promise<{
        renders: number
        requestErrors: Array<{ path: string; revalidateReason: unknown }>
      }>)

    // Without backoff this would be close to 8 (one per navigation); with
    // it, only the first stale request should have re-triggered a render.
    expect(result.renders).toBeGreaterThanOrEqual(1)
    expect(result.renders).toBeLessThanOrEqual(3)

    // The failure(s) must have reached onRequestError, not just console.error.
    // The reported path is the navigation's own request URL
    // (`/p/a?_rsc=...`), not the plain pathname a document request would
    // report — match the pathname only.
    expect(result.requestErrors.length).toBeGreaterThan(0)
    expect(result.requestErrors).toContainEqual(
      expect.objectContaining({
        path: expect.stringMatching(/^\/p\/a(\?|$)/),
        revalidateReason: 'stale',
      })
    )
  })
})
