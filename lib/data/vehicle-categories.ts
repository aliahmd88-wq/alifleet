/**
 * The /cars page groups vehicles the way the owner sells them, not the way ACF
 * stores them. ACF keeps one `body_type` per vehicle (van, pickup, truck …);
 * the page shows two tabs — new vehicles to order and used vehicles from the
 * lot — each with its own, coarser set of categories. The maps below are the
 * only place that translation lives, so adding a body type in the ACF schema
 * means adding one line here.
 */
export type NewCategory = 'trucks' | 'work' | 'buses' | 'cars'
export type UsedCategory = 'trucks' | 'cars'

export const NEW_CATEGORIES: NewCategory[] = ['trucks', 'work', 'buses', 'cars']
export const USED_CATEGORIES: UsedCategory[] = ['trucks', 'cars']

const NEW_BY_BODY: Record<string, NewCategory> = {
  truck: 'trucks',
  van: 'work',
  pickup: 'work',
  minivan: 'buses',
  suv: 'cars',
  luxury_mpv: 'cars',
}

const USED_BY_BODY: Record<string, UsedCategory> = {
  truck: 'trucks',
  van: 'trucks',
  pickup: 'trucks',
  minivan: 'trucks',
  suv: 'cars',
  luxury_mpv: 'cars',
}

/** Unknown or empty body types land with the cars, never in a hidden bucket. */
export function newCategoryOf(bodyTypeKey: string): NewCategory {
  return NEW_BY_BODY[bodyTypeKey] ?? 'cars'
}

export function usedCategoryOf(bodyTypeKey: string): UsedCategory {
  return USED_BY_BODY[bodyTypeKey] ?? 'cars'
}

/**
 * What a vehicle can be used or imported for, beyond its body type. Editors
 * tick these in ACF (`vehicle_uses`); when the field is empty the site falls
 * back to what is typical for the body type, so a minibus reads as taxi-ready
 * and a passenger car as open to parallel or personal import without anyone
 * touching WordPress.
 */
export type VehicleUse = 'taxi' | 'parallel_import'
export const VEHICLE_USES: VehicleUse[] = ['taxi', 'parallel_import']

export function defaultUses(bodyTypeKey: string): VehicleUse[] {
  if (bodyTypeKey === 'minivan') return ['taxi']
  if (bodyTypeKey === 'suv' || bodyTypeKey === 'luxury_mpv') return ['taxi', 'parallel_import']
  return []
}

export function usesOf(raw: unknown, bodyTypeKey: string): VehicleUse[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : []
  const picked = list.filter((v): v is VehicleUse => VEHICLE_USES.includes(v as VehicleUse))
  return picked.length > 0 ? picked : defaultUses(bodyTypeKey)
}
