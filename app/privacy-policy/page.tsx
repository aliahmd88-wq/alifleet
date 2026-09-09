import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PolicyScreen } from '@/components/policy-screen'
import { getPrivacyPolicy } from '@/lib/wp/policies'
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
    title: t.seo.privacyTitle,
    description: t.seo.privacyDescription,
    alternates: pageAlternates('/privacy-policy/', locale),
  }
}

type PageProps = {
  searchParams?: Promise<{ locale?: string }>
}

export default async function PrivacyPolicyPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined
  const rawLocale = resolvedParams?.locale
  const requestedLocale = typeof rawLocale === 'string' ? rawLocale.trim().toLowerCase() : undefined
  const activeLocale = isLocale(requestedLocale) ? requestedLocale : undefined

  const policy = await getPrivacyPolicy(activeLocale)

  return (
    <>
      <SiteHeader />
      <main>
        <PolicyScreen
          policyType="privacy"
          policy={policy}
          initialLocale={activeLocale}
        />
      </main>
      <SiteFooter />
    </>
  )
}
