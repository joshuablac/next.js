import type { WorkUnitStore } from '../../server/app-render/work-unit-async-storage.external'
import type { OpaqueFallbackRouteParams } from '../../server/request/fallback-params'
import type { Params } from '../../server/request/params'

/**
 * The fallback route params for the current prerender, if it's a static
 * prerender that has any (i.e. a fallback-shell prerender). Only the two
 * static-prerender work unit types carry them; every other work unit type
 * (a request, a runtime prerender, a cache scope, ...) returns null, which
 * callers treat as "no params are fallback params" — the same as before
 * this function existed for those cases.
 */
export function getFallbackRouteParamsFromWorkUnitStore(
  workUnitStore: WorkUnitStore | undefined
): OpaqueFallbackRouteParams | null {
  if (!workUnitStore) {
    return null
  }
  switch (workUnitStore.type) {
    case 'prerender':
    case 'prerender-client':
      return workUnitStore.fallbackRouteParams
    default:
      return null
  }
}

/**
 * Resolves a segment param's value the same way the component tree does
 * (getDynamicParamFromSegment -> getParamValue in create-component-tree.tsx
 * / get-dynamic-param.ts): a param that's a fallback param for this
 * prerender resolves to its hanging placeholder, not `undefined`. Used by
 * both metadata resolvers (resolve-metadata.ts and
 * resolve-metadata-parallel.ts) in place of a plain
 * `interpolatedParams[paramName]` lookup, so generateMetadata /
 * generateViewport suspend like the page component does for the same
 * param instead of running immediately, during the shared shell prerender,
 * with the param missing.
 *
 * Deliberately not `getParamValue` itself: that function also
 * `encodeURIComponent`s a present (non-fallback) value, which would be an
 * unrelated behavior change here — metadata has never encoded these
 * values, and this fix only needs the fallback-placeholder substitution.
 */
export function resolveMetadataParamValue(
  interpolatedParams: Params,
  paramName: string,
  fallbackRouteParams: OpaqueFallbackRouteParams | null
): Params[string] {
  return fallbackRouteParams?.has(paramName)
    ? fallbackRouteParams.get(paramName)
    : interpolatedParams[paramName]
}
