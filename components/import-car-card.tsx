'use client'

import Image from 'next/image'
import LocaleLink from '@/components/locale-link'
import { ArrowUpRight, Calendar, Gauge, } from 'lucide-react'
import type { ImportCar } from '@/lib/data/import-cars'
import { useLanguage } from '@/lib/i18n/language-context'
import { formatNumber, formatPrice } from '@/lib/format'
import { useStore } from '@/lib/store-context'
import { proxied } from '@/lib/img-proxy'

const statusStyles: Record<ImportCar['status'], string> = {
  available: 'bg-accent text-accent-foreground',
  inTransit: 'bg-foreground text-background',
  reserved: 'bg-secondary text-secondary-foreground ring-1 ring-border',
  sold: 'bg-muted text-muted-foreground ring-1 ring-border',
}

export function ImportCarCard({ car }: { car: ImportCar }) {
  const { t, locale } = useLanguage()
  // Localized name first (what customers search for), the Latin model name underneath.
  const name = car.subtitle[locale] || car.model
  const secondary = name === car.model ? '' : car.model
  const store = useStore()

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-shadow hover:shadow-xl hover:shadow-foreground/5">
      <LocaleLink
        href={`/cars/import/${car.slug}`}
        className="relative block aspect-16/10 overflow-hidden bg-secondary"
      >
        <Image
          src={proxied(car.image)}
          alt={car.alt[locale]}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute start-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[car.status]}`}
        >
          {t.import.status[car.status]}
        </span>
      </LocaleLink>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {car.bodyType[locale]}
        </p>

        <h3 className="mt-2 text-pretty text-lg font-semibold leading-snug text-foreground">
          <LocaleLink href={`/cars/import/${car.slug}`} className="hover:text-accent">
            {name}
          </LocaleLink>
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {secondary}
        </p>
        {car.uses.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t.cars.usesLabel}>
            {car.uses.includes('taxi') && (
              <li className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent">{t.cars.badgeTaxi}</li>
            )}
            {car.uses.includes('parallel_import') && (
              <li className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground">{t.cars.badgeParallel}</li>
            )}
          </ul>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-accent" aria-hidden="true" />
            <dt className="sr-only">{t.import.year}</dt>
            <dd dir="ltr">{car.year}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="size-4 text-accent" aria-hidden="true" />
            <dt className="sr-only">{t.import.mileage}</dt>
            <dd dir="ltr">{formatNumber(car.mileage)} km</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {car.price === null ? t.import.landedPrice : t.common.from}
            </p>
            <p className="font-serif text-2xl text-foreground" dir={car.price === null ? undefined : 'ltr'}>
              {car.price === null
                ? t.common.onRequest
                : formatPrice(car.price, store.currency)}
            </p>
          </div>
          <LocaleLink
            href={`/cars/import/${car.slug}`}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {t.common.viewDetails}
            <ArrowUpRight className="size-4" aria-hidden="true" data-flip-rtl />
          </LocaleLink>
        </div>
      </div>
    </article>
  )
}
