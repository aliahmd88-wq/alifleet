import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PolicyScreen } from '@/components/policy-screen'
import { getTermsPolicy } from '@/lib/wp/policies'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { getRequestLocale } from '@/lib/i18n/request-locale'
import { pageAlternates } from '@/lib/seo/alternates'

export const revalidate = 600

/** Title, description, canonical and hreflang follow the visitor's language. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = getDictionary(locale)
  return {
    title: t.seo.termsTitle,
    description: t.seo.termsDescription,
    alternates: pageAlternates('/terms/', locale),
  }
}

type PageProps = {
  searchParams?: Promise<{ locale?: string }>
}

export default async function TermsPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const rawLocale = resolvedParams?.locale
  const requestedLocale = typeof rawLocale === 'string' ? rawLocale.trim().toLowerCase() : undefined
  const activeLocale = isLocale(requestedLocale) ? requestedLocale : undefined

  const policy = await getTermsPolicy(activeLocale)

  return (
    <>
      <SiteHeader />
      <main>
        <PolicyScreen
          policyType="terms"
          policy={policy}
          initialLocale={activeLocale}
        />
      </main>
      <SiteFooter />
    </>
  )
}
