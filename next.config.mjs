import dns from 'node:dns'

try {
  dns.setDefaultResultOrder('ipv4first')
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4'])

  const { Resolver } = dns
  const fallbackResolver = new Resolver()
  fallbackResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4'])

  const origLookup = dns.lookup
  dns.lookup = function (hostname, options, callback) {
    let cb = callback
    let opts = options
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    } else if (typeof opts === 'number') {
      opts = { family: opts }
    } else if (!opts) {
      opts = {}
    }

    origLookup.call(dns, hostname, opts, (err, address, family) => {
      if (err) {
        fallbackResolver.resolve4(hostname, (rErr, addresses) => {
          if (rErr || !addresses || addresses.length === 0) {
            return cb(err)
          }
          if (opts.all) {
            return cb(null, addresses.map((addr) => ({ address: addr, family: 4 })))
          }
          return cb(null, addresses[0], 4)
        })
      } else {
        return cb(null, address, family)
      }
    })
  }
} catch {}

/** @type {import('next').NextConfig} */

const privateNoStoreHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
]

const nextConfig = {
  // WooCommerce canonicalizes checkout with a trailing slash while the
  // Next.js proxy route accepts both forms. Let the route handle that
  // canonicalization instead of creating a redirect loop.
  skipTrailingSlashRedirect: true,
  typescript: {
    ignoreBuildErrors: true,
  },
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
      { protocol: 'https', hostname: '*.sslip.io' },
      { protocol: 'http', hostname: '*.sslip.io' },
    ],
    minimumCacheTTL: 604800,
  },
  async redirects() {
    return [
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
      { source: '/checkout/:path*', headers: privateNoStoreHeaders },
      { source: '/wc-ajax', headers: privateNoStoreHeaders },
      { source: '/account/:path*', headers: privateNoStoreHeaders },
      { source: '/my-account', headers: privateNoStoreHeaders },
    ]
  },
}

export default nextConfig
