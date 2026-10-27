import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getLunchPromoValidationError,
  isValidLunchPromoWindow,
  LUNCH_PROMO_CODE,
} from './lunchPromo'

describe('isValidLunchPromoWindow', () => {
  it('accepts Mon–Fri within 11:00–15:00 inclusive', () => {
    // 2026-10-26 = Monday
    assert.equal(isValidLunchPromoWindow('2026-10-26', '11:00'), true)
    assert.equal(isValidLunchPromoWindow('2026-10-26', '12:30'), true)
    assert.equal(isValidLunchPromoWindow('2026-10-26', '15:00'), true)
    // Friday
    assert.equal(isValidLunchPromoWindow('2026-10-30', '14:30'), true)
  })

  it('rejects weekends and times outside the window', () => {
    // Saturday / Sunday
    assert.equal(isValidLunchPromoWindow('2026-10-31', '12:00'), false)
    assert.equal(isValidLunchPromoWindow('2026-10-25', '12:00'), false)
    // Monday but too early / too late
    assert.equal(isValidLunchPromoWindow('2026-10-26', '10:30'), false)
    assert.equal(isValidLunchPromoWindow('2026-10-26', '15:30'), false)
    assert.equal(isValidLunchPromoWindow('2026-10-26', '18:00'), false)
  })
})

describe('getLunchPromoValidationError', () => {
  it('allows empty or unrelated codes', () => {
    assert.equal(getLunchPromoValidationError('', '2026-10-25', '12:00'), null)
    assert.equal(getLunchPromoValidationError('OTHER', '2026-10-25', '12:00'), null)
  })

  it('rejects Acton76 outside the lunch window with a clear message', () => {
    const err = getLunchPromoValidationError(LUNCH_PROMO_CODE, '2026-10-25', '12:00')
    assert.ok(err)
    assert.match(err!, /Monday–Friday/)
    assert.match(err!, /11:00/)
    assert.match(err!, /15:00/)
  })

  it('accepts Acton76 case-insensitively inside the window', () => {
    assert.equal(getLunchPromoValidationError('acton76', '2026-10-26', '11:00'), null)
    assert.equal(getLunchPromoValidationError('Acton76', '2026-10-26', '15:00'), null)
  })
})
