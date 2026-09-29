/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    // Same fixture as ../metadata-fallback-shell-slot-params, with this
    // flag on: it routes through the separate resolve-metadata-parallel.ts
    // implementation, which needs the same fallback-param fix as
    // resolve-metadata.ts (a distinct code path, not just a config toggle
    // on the same one).
    parallelRouteMetadata: true,
  },
}

module.exports = nextConfig
