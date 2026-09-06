import dns from 'node:dns'

/**
 * DNS resolution fallback for the production container.
 *
 * Inside the Docker network the container's stub resolver has, on occasion,
 * failed to resolve the WordPress host, which surfaced as broken images and
 * empty catalogue pages. Public resolvers become the default for explicit
 * queries and, when the system lookup still fails, an A-record query against
 * them is tried before giving up. Behaviour is identical to the inline patch
 * that used to sit at the top of next.config.mjs; it lives here so the config
 * file stays declarative.
 *
 * Set DNS_FALLBACK=off to disable.
 */
const RESOLVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4']

export function installDnsFallback() {
  if (process.env.DNS_FALLBACK === 'off') return
  try {
    dns.setDefaultResultOrder('ipv4first')
    dns.setServers(RESOLVERS)

    const fallback = new dns.Resolver()
    fallback.setServers(RESOLVERS)
    const systemLookup = dns.lookup

    dns.lookup = function lookupWithFallback(hostname, options, callback) {
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

      systemLookup.call(dns, hostname, opts, (err, address, family) => {
        if (!err) return cb(null, address, family)
        fallback.resolve4(hostname, (fallbackErr, addresses) => {
          if (fallbackErr || !addresses?.length) return cb(err)
          if (opts.all) return cb(null, addresses.map((a) => ({ address: a, family: 4 })))
          cb(null, addresses[0], 4)
        })
      })
    }
  } catch {
    // A DNS tweak must never stop the server from starting.
  }
}
