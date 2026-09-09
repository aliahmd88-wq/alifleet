import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { pageAlternates } from '@/lib/seo/alternates'
import { getRequestLocale } from '@/lib/i18n/request-locale'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CarsHero } from '@/components/cars-hero'
import { ImportSteps } from '@/components/import-steps'
import { VehicleLineup } from '@/components/vehicle-lineup'
import { VehicleFaq } from '@/components/vehicle-faq'
import { ImportCustomCta } from '@/components/import-custom-cta'
import { getVehicles } from '@/lib/wp/vehicles'
import { getSaleCars } from '@/lib/wp/sale-cars'
import { getCarsPageCopy } from '@/lib/wp/cars-page'

/** Title and description follow the visitor's language (see t.seo). */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const t = getDictionary(locale)
  return {
    title: t.seo.carsTitle,
    description: t.seo.carsDescription,
    alternates: pageAlternates('/cars/', locale),
  }
}

/**
 * One page, one lineup: new vehicles to order and used vehicles from the lot
 * share a grid with a new/used switch and a category row (see VehicleLineup).
 * The ordering steps and the "another vehicle" prompt follow the grid.
 *
 * Both inventories are fetched in parallel with the page's editable copy: they
 * hit different post types and none blocks the others, so a slow or broken
 * half never delays the page — each browser renders its own status
 * independently, and the copy fetch degrades to the bundled dictionaries.
 */
export default async function CarsPage() {
  const [sale, imports, copy] = await Promise.all([
    getSaleCars(),
    getVehicles(),
    getCarsPageCopy(),
  ])

  return (
    <>
      <SiteHeader />
      <main>
        <CarsHero copy={copy.hero} />
        <VehicleLineup
          newCars={imports.cars}
          newStatus={imports.status}
          usedCars={sale.cars}
          usedStatus={sale.status}
        />
        <VehicleFaq />
        <ImportSteps />
        <ImportCustomCta />
      </main>
      <SiteFooter />
    </>
  )
}
