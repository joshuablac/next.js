import { nextTestSetup } from 'e2e-utils'

// Regression test: with cacheComponents, a parallel slot's own dynamic
// param (here @crumbs/[...all]) is a fallback param for any id that
// generateStaticParams doesn't cover — the same as `id` is for the
// products page next to it. But unlike `id`, the slot's param resolved to
// `undefined` instead of a hanging placeholder inside generateMetadata, so
// the metadata for that param was computed eagerly, at shell-prerender
// time, from `undefined` — and baked into the static fallback shell HTML
// as if it were final. The symptom: a request for an id outside
// generateStaticParams (served from the fallback shell) gets a `<title>`
// computed from `undefined`, even though the same response's page content
// resolves the real param correctly at request time.
//
// /shop and /shop2 isolate the regression to slot params specifically:
// /shop2's page reads its own (also fallback) param in generateMetadata,
// which already worked before this fix, so it must keep working.
describe('metadata-fallback-shell-slot-params', () => {
  const { next, isNextDev } = nextTestSetup({
    files: __dirname,
  })

  if (isNextDev) {
    // The fallback shell is a `next build`/`next start` artifact; there's
    // nothing to prerender in dev.
    test('disabled in development', () => {})
    return
  }

  it('resolves generateMetadata with the real value of a parallel slot param on a fallback-shell request', async () => {
    // id "999" is not in generateStaticParams, so this is served from the
    // fallback shell + a per-request resume, not a statically generated
    // page.
    const $ = await next.render$('/shop/products/999')
    expect($('title').text()).toBe('crumb ["products","999"]')
    expect($('#product-body').text()).toBe('PRODUCT 999')
    expect($('#crumb-text').text()).toBe('["products","999"]')
  })

  it('control: a page reading its own fallback param in generateMetadata is unaffected', async () => {
    const $ = await next.render$('/shop2/products/999')
    expect($('title').text()).toBe('product "999"')
    expect($('#product-body').text()).toBe('PRODUCT 999')
  })
})
