import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRequestLocale } from '@/lib/i18n/request-locale'
import { pageAlternates } from '@/lib/seo/alternates'
import { getVehicle, getSimilarVehicles } from '@/lib/wp/vehicles'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ImportCarDetail } from '@/components/import-car-detail'
import { ImportCustomCta } from '@/components/import-custom-cta'

// Dynamic rendering — slugs come from WordPress at runtime, not build time.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const car = await getVehicle(slug)
  if (!car) return { title: 'Vehicle not found | ALI FLEET' }

  const locale = await getRequestLocale()
  const name = car.subtitle[locale] || car.model
  const summary = (car.description[locale] || car.description.en || car.subtitle[locale] || car.model).replace(/\s+/g, ' ').trim()
  return {
    title: `${name} · ${car.year} | ALI FLEET`,
    // hreflang + per-language canonical (he at root, ar/en with their suffixes).
    alternates: pageAlternates(`/cars/import/${slug}/`, locale),
    description: summary.length > 158 ? `${summary.slice(0, 155).trimEnd()}…` : summary,
  }
}

export default async function ImportCarPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const car = await getVehicle(slug)
  if (!car) notFound()

  const related = await getSimilarVehicles(car)

  return (
    <>
      <SiteHeader />
      <main>
        <ImportCarDetail car={car} related={related} />
        <ImportCustomCta />
      </main>
      <SiteFooter />
    </>
  )
}
