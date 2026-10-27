/** Lunch promo Acton76 — Mon–Fri, 11:00–15:00 inclusive. */

export const LUNCH_PROMO_CODE = 'ACTON76'
export const LUNCH_PROMO_DISPLAY = 'Acton76'

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase()
}

export function isLunchPromoCode(code: string): boolean {
  return normalizePromoCode(code) === LUNCH_PROMO_CODE
}

/**
 * Valid when booking date is Mon–Fri and time is between 11:00 and 15:00 inclusive.
 * `date` is YYYY-MM-DD; `time` is HH:MM (24h).
 */
export function isValidLunchPromoWindow(date: string, time: string): boolean {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim())
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (!dateMatch || !timeMatch) return false

  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])
  // UTC calendar day avoids server-local TZ shifting the weekday for a London restaurant date.
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  if (weekday === 0 || weekday === 6) return false

  const hours = Number(timeMatch[1])
  const minutes = Number(timeMatch[2])
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false
  if (minutes < 0 || minutes > 59) return false

  const totalMinutes = hours * 60 + minutes
  const windowStart = 11 * 60
  const windowEnd = 15 * 60
  return totalMinutes >= windowStart && totalMinutes <= windowEnd
}

export const LUNCH_PROMO_INVALID_MESSAGE =
  `Promo code ${LUNCH_PROMO_DISPLAY} is only valid Monday–Friday between 11:00 and 15:00. Please choose a weekday lunch slot or remove the code.`

/** Returns an error message when Acton76 is used outside the lunch window; otherwise null. */
export function getLunchPromoValidationError(
  promoCode: string,
  date: string,
  time: string
): string | null {
  if (!promoCode.trim()) return null
  if (!isLunchPromoCode(promoCode)) return null
  if (!date.trim() || !time.trim()) {
    return `Select a date and time to use promo code ${LUNCH_PROMO_DISPLAY}.`
  }
  if (!isValidLunchPromoWindow(date, time)) {
    return LUNCH_PROMO_INVALID_MESSAGE
  }
  return null
}
