'use client'

import { useLanguage } from '@/lib/i18n/language-context'

/**
 * Three answers that decide whether a fleet buyer keeps reading: taxi
 * licensing, parallel vs personal import, and delivery time. Rendered in the
 * visitor's language with FAQPage structured data, so search engines and AI
 * assistants can quote them for "מונית", "יבוא מקביל" and "יבוא אישי" queries.
 */
export function VehicleFaq() {
  const { t } = useLanguage()
  const items = [
    { q: t.cars.faq.q1, a: t.cars.faq.a1 },
    { q: t.cars.faq.q2, a: t.cars.faq.a2 },
    { q: t.cars.faq.q3, a: t.cars.faq.a3 },
  ]

  return (
    <section id="vehicle-faq" className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t.cars.faqEyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-balance font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
        {t.cars.faqTitle}
      </h2>
      <dl className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.q} className="rounded-3xl bg-card p-6 ring-1 ring-border">
            <dt className="text-pretty font-semibold leading-snug text-foreground">{item.q}</dt>
            <dd className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
