import { installDnsFallback } from './lib/server/dns-fallback.mjs'

installDnsFallback()

/** @type {import('next').NextConfig} */

const privateNoStoreHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
]

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` for scripts is unavoidable without a nonce middleware:
 * Next.js ships its hydration payload inline and the Meta pixel is an inline
 * snippet. The policy still pins script and connection targets to known
 * hosts, forbids plugins, framing and <base> hijacking, and upgrades any
 * stray http:// subresource — which is where the practical risk is (H1).
 * `form-action` is deliberately absent: it would also apply to the redirect
 * a payment gateway performs after the checkout POST.
 */
const wordpressOrigin = (() => {
  const configured = (process.env.WORDPRESS_GRAPHQL_ENDPOINT ?? '').trim()
  try {
    if (configured && !configured.includes('sslip.io')) return new URL(configured).origin
  } catch {}
  return 'https://a-f.site'
})()

const isDevelopment = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://connect.facebook.net https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${wordpressOrigin} https://www.facebook.com https://*.gravatar.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${wordpressOrigin} https://www.facebook.com https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.facebook.com',
  `media-src 'self' ${wordpressOrigin}`,
  "worker-src 'self' blob:",
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ')

const nextConfig = {
  // WooCommerce canonicalizes checkout with a trailing slash while the
  // Next.js proxy route accepts both forms. Let the route handle that
  // canonicalization instead of creating a redirect loop.
  skipTrailingSlashRedirect: true,
  // Type errors fail the build. `pnpm exec tsc --noEmit` is clean and stays
  // that way; silently shipping broken types is how regressions hide.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Do not advertise the framework in every response.
  poweredByHeader: false,
  images: {
    // Optimization is ON: WordPress images arrive through the same-origin
    // proxy and are resized and served as AVIF/WebP instead of raw originals.
    formats: ['image/avif', 'image/webp'],
    // Next.js 16 rejects any quality that is not declared here.
    qualities: [70, 75, 80, 82],
    // HTTP image URLs are served through the same-origin proxy. Declaring
    // `localPatterns` at all opts every other local path out of optimization,
    // so the bundled artwork under /images has to be listed too — without it
    // Next.js answered the footer logo with `"url" parameter is not allowed`
    // and the logo rendered broken (QA-07).
    localPatterns: [
      { pathname: '/api/img' },
      { pathname: '/images/**' },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'a-f.site' },
      { protocol: 'http', hostname: 'a-f.site' },
    ],
    minimumCacheTTL: 604800,
  },
  async redirects() {
    return [
      // One canonical host. www is served by the same deployment, so without
      // this every page exists twice for search engines.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.alifleet.com' }],
        destination: 'https://alifleet.com/:path*',
        permanent: true,
      },
      // /import was the vehicle page until the section was split into "for
      // sale" and "import" under /cars. Preserve indexed and shared URLs.
      { source: '/import', destination: '/cars', permanent: true },
      {
        source: '/import/:slug',
        destination: '/cars/import/:slug',
        permanent: true,
      },
      // Privacy Policy multilingual routes
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/privacy-policy-ar', destination: '/privacy-policy?locale=ar', permanent: true },
      { source: '/privacy-policy-en', destination: '/privacy-policy?locale=en', permanent: true },
      { source: '/privacy-policy-he', destination: '/privacy-policy?locale=he', permanent: true },
      { source: '/ar/privacy-policy', destination: '/privacy-policy?locale=ar', permanent: true },
      { source: '/en/privacy-policy', destination: '/privacy-policy?locale=en', permanent: true },
      { source: '/he/privacy-policy', destination: '/privacy-policy?locale=he', permanent: true },
      { source: '/ar/privacy-policy-ar', destination: '/privacy-policy?locale=ar', permanent: true },
      { source: '/en/privacy-policy-en', destination: '/privacy-policy?locale=en', permanent: true },
      { source: '/he/privacy-policy-he', destination: '/privacy-policy?locale=he', permanent: true },

      // Terms & Conditions multilingual routes
      { source: '/terms-ar', destination: '/terms?locale=ar', permanent: true },
      { source: '/terms-en', destination: '/terms?locale=en', permanent: true },
      { source: '/terms-he', destination: '/terms?locale=he', permanent: true },
      { source: '/ar/terms', destination: '/terms?locale=ar', permanent: true },
      { source: '/en/terms', destination: '/terms?locale=en', permanent: true },
      { source: '/he/terms', destination: '/terms?locale=he', permanent: true },
      { source: '/ar/terms-ar', destination: '/terms?locale=ar', permanent: true },
      { source: '/en/terms-en', destination: '/terms?locale=en', permanent: true },
      { source: '/he/terms-he', destination: '/terms?locale=he', permanent: true },
      { source: '/ar/terms-and-conditions', destination: '/terms?locale=ar', permanent: true },
      { source: '/en/terms-and-conditions', destination: '/terms?locale=en', permanent: true },
      { source: '/he/terms-and-conditions', destination: '/terms?locale=he', permanent: true },
      { source: '/ar/terms-conditions', destination: '/terms?locale=ar', permanent: true },
      { source: '/en/terms-conditions', destination: '/terms?locale=en', permanent: true },
      { source: '/he/terms-conditions', destination: '/terms?locale=he', permanent: true },

      // Refund & Returns multilingual routes
      { source: '/return-policy-ar', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/return-policy-en', destination: '/return-policy?locale=en', permanent: true },
      { source: '/return-policy-he', destination: '/return-policy?locale=he', permanent: true },
      { source: '/refund-returns-ar', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/refund-returns-en', destination: '/return-policy?locale=en', permanent: true },
      { source: '/refund-returns-he', destination: '/return-policy?locale=he', permanent: true },
      { source: '/refund-and-returns-ar', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/refund-and-returns-en', destination: '/return-policy?locale=en', permanent: true },
      { source: '/refund-and-returns-he', destination: '/return-policy?locale=he', permanent: true },
      { source: '/ar/return-policy', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/en/return-policy', destination: '/return-policy?locale=en', permanent: true },
      { source: '/he/return-policy', destination: '/return-policy?locale=he', permanent: true },
      { source: '/ar/return-policy-ar', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/en/return-policy-en', destination: '/return-policy?locale=en', permanent: true },
      { source: '/he/return-policy-he', destination: '/return-policy?locale=he', permanent: true },
      { source: '/ar/refund-returns', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/en/refund-returns', destination: '/return-policy?locale=en', permanent: true },
      { source: '/he/refund-returns', destination: '/return-policy?locale=he', permanent: true },
      { source: '/ar/refund-and-returns', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/en/refund-and-returns', destination: '/return-policy?locale=en', permanent: true },
      { source: '/he/refund-and-returns', destination: '/return-policy?locale=he', permanent: true },
      { source: '/ar/refund_returns', destination: '/return-policy?locale=ar', permanent: true },
      { source: '/en/refund_returns', destination: '/return-policy?locale=en', permanent: true },
      { source: '/he/refund_returns', destination: '/return-policy?locale=he', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Proxied media only: an SVG opened directly would otherwise run its
        // scripts on this origin. Listed after the global rule so it wins.
        source: '/api/img',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          },
        ],
      },
      { source: '/checkout/:path*', headers: privateNoStoreHeaders },
      { source: '/wc-ajax', headers: privateNoStoreHeaders },
      { source: '/account/:path*', headers: privateNoStoreHeaders },
      { source: '/my-account', headers: privateNoStoreHeaders },
    ]
  },
}

export default nextConfig
