'use client'

import { useEffect, useMemo, useState } from 'react'
import LocaleLink from '@/components/locale-link'
import { Paginator } from '@/components/paginator'
import { ImportCarCard } from '@/components/import-car-card'
import { SaleCarCard } from '@/components/sale-car-card'
import { useLanguage } from '@/lib/i18n/language-context'
import type { ImportCar } from '@/lib/data/import-cars'
import type { SaleCar } from '@/lib/data/sale-cars'
import type { VehiclesStatus } from '@/lib/wp/vehicles'
import type { SaleCarsStatus } from '@/lib/wp/sale-cars'
import {
  NEW_CATEGORIES,
  USED_CATEGORIES,
  newCategoryOf,
  usedCategoryOf,
  type NewCategory,
  type UsedCategory,
} from '@/lib/data/vehicle-categories'

type Tab = 'new' | 'used'

type Props = {
  newCars: ImportCar[]
  newStatus: VehiclesStatus
  usedCars: SaleCar[]
  usedStatus: SaleCarsStatus
}

const PAGE_SIZE = 24 // 8 rows × 3 cols

/**
 * The vehicle lineup on /cars: one grid, two tabs (new vehicles to order, used
 * vehicles from the lot), and a category row per tab. The hero's buttons link
 * to `#new` / `#used`, so the hash picks the tab on arrival and the browser's
 * back button keeps working.
 */
export function VehicleLineup({ newCars, newStatus, usedCars, usedStatus }: Props) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('new')
  const [newCategory, setNewCategory] = useState<NewCategory | 'all'>('all')
  const [usedCategory, setUsedCategory] = useState<UsedCategory | 'all'>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'new' || hash === 'used') {
        setTab(hash)
        setPage(1)
      }
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  const newCounts = useMemo(() => {
    const counts: Record<NewCategory, number> = { trucks: 0, work: 0, buses: 0, cars: 0 }
    for (const car of newCars) counts[newCategoryOf(car.bodyTypeKey)] += 1
    return counts
  }, [newCars])

  const usedCounts = useMemo(() => {
    const counts: Record<UsedCategory, number> = { trucks: 0, cars: 0 }
    for (const car of usedCars) counts[usedCategoryOf(car.bodyTypeKey)] += 1
    return counts
  }, [usedCars])

  const filteredNew = useMemo(
    () => newCars.filter((car) => newCategory === 'all' || newCategoryOf(car.bodyTypeKey) === newCategory),
    [newCars, newCategory]
  )
  const filteredUsed = useMemo(
    () => usedCars.filter((car) => usedCategory === 'all' || usedCategoryOf(car.bodyTypeKey) === usedCategory),
    [usedCars, usedCategory]
  )

  const total = tab === 'new' ? filteredNew.length : filteredUsed.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const slice = <T,>(items: T[]) => items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const goToPage = (p: number) => {
    setPage(p)
    document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectTab = (next: Tab) => {
    setTab(next)
    setPage(1)
    if (typeof window !== 'undefined') window.history.replaceState(null, '', `#${next}`)
  }

  const chip = (active: boolean) =>
    active
      ? 'rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background'
      : 'rounded-full bg-card px-4 py-2 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-secondary hover:text-foreground'

  const tabButton = (active: boolean) =>
    active
      ? 'rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background'
      : 'rounded-full bg-card px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-secondary'

  const NEW_LABELS: Record<NewCategory, string> = {
    trucks: t.cars.catTrucks,
    work: t.cars.catWork,
    buses: t.cars.catBuses,
    cars: t.cars.catCars,
  }
  const USED_LABELS: Record<UsedCategory, string> = {
    trucks: t.cars.usedCatTrucks,
    cars: t.cars.usedCatCars,
  }

  const contactButton = (
    <LocaleLink
      href="/contact"
      className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
    >
      {t.common.callUs}
    </LocaleLink>
  )

  const notice = (title: string, lead: string, withContact = true) => (
    <div className="mt-10 rounded-3xl bg-card p-12 text-center ring-1 ring-border">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{lead}</p>
      {withContact && contactButton}
    </div>
  )

  /* ---------- what the active tab shows ---------- */
  let body: React.ReactNode
  if (tab === 'new') {
    if (newStatus === 'not_configured' || newStatus === 'unreachable') {
      body = notice(t.import.inventoryUnavailable, t.import.inventoryUnavailableLead)
    } else if (newStatus === 'acf_missing') {
      body = notice(t.import.inventoryAcfMissing, t.import.inventoryAcfMissingLead, false)
    } else if (newCars.length === 0) {
      body = notice(t.cars.newEmpty, t.cars.newEmptyLead)
    } else if (filteredNew.length === 0) {
      body = notice(t.common.noResults, '', false)
    } else {
      body = (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {slice(filteredNew).map((car) => (
            <ImportCarCard key={car.slug} car={car} />
          ))}
        </div>
      )
    }
  } else if (usedStatus === 'not_configured' || usedStatus === 'unreachable') {
    body = notice(t.cars.saleUnavailable, t.cars.saleUnavailableLead)
  } else if (usedStatus === 'acf_missing') {
    body = notice(t.cars.saleAcfMissing, t.cars.saleAcfMissingLead, false)
  } else if (usedCars.length === 0) {
    body = notice(t.cars.saleEmpty, t.cars.saleEmptyLead)
  } else if (filteredUsed.length === 0) {
    body = notice(t.common.noResults, '', false)
  } else {
    body = (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {slice(filteredUsed).map((car) => (
          <SaleCarCard key={car.slug} car={car} />
        ))}
      </div>
    )
  }

  return (
    <section id="lineup" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t.cars.lineupEyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-balance font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
        {t.cars.lineupTitle}
      </h2>
      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{t.cars.lineupLead}</p>

      {/* New / used switch. The ids give the hero's anchors somewhere to land. */}
      <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label={t.cars.lineupEyebrow}>
        <button id="new" type="button" role="tab" aria-selected={tab === 'new'} onClick={() => selectTab('new')} className={tabButton(tab === 'new')}>
          {t.cars.tabNew} <span dir="ltr" className="opacity-70">({newCars.length})</span>
        </button>
        <button id="used" type="button" role="tab" aria-selected={tab === 'used'} onClick={() => selectTab('used')} className={tabButton(tab === 'used')}>
          {t.cars.tabUsed} <span dir="ltr" className="opacity-70">({usedCars.length})</span>
        </button>
      </div>

      {/* Category row for the active tab, with live counts so an empty category is never a surprise. */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-border py-5">
        {tab === 'new' ? (
          <>
            <button type="button" onClick={() => { setNewCategory('all'); setPage(1) }} className={chip(newCategory === 'all')}>
              {t.common.all}
            </button>
            {NEW_CATEGORIES.map((category) => (
              <button key={category} type="button" onClick={() => { setNewCategory(category); setPage(1) }} className={chip(newCategory === category)}>
                {NEW_LABELS[category]} <span dir="ltr" className="opacity-70">({newCounts[category]})</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <button type="button" onClick={() => { setUsedCategory('all'); setPage(1) }} className={chip(usedCategory === 'all')}>
              {t.common.all}
            </button>
            {USED_CATEGORIES.map((category) => (
              <button key={category} type="button" onClick={() => { setUsedCategory(category); setPage(1) }} className={chip(usedCategory === category)}>
                {USED_LABELS[category]} <span dir="ltr" className="opacity-70">({usedCounts[category]})</span>
              </button>
            ))}
          </>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        <span dir="ltr">{total}</span> {t.common.resultsCount}
      </p>

      {body}

      {totalPages > 1 && (
        <Paginator current={safePage} total={totalPages} onChange={goToPage} prevLabel={t.common.prevPage} nextLabel={t.common.nextPage} />
      )}
    </section>
  )
}
