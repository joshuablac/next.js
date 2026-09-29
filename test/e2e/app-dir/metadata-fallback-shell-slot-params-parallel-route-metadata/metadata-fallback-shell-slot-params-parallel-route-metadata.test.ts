import { nextTestSetup } from 'e2e-utils'

// Same regression and fixture as
// ../metadata-fallback-shell-slot-params/metadata-fallback-shell-slot-params.test.ts,
// with experimental.parallelRouteMetadata on. That flag switches metadata
// resolution to a separate implementation (resolve-metadata-parallel.ts)
// that needs the same fallback-param fix independently — it isn't shared
// code with the default resolver.
describe('metadata-fallback-shell-slot-params (parallelRouteMetadata)', () => {
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
