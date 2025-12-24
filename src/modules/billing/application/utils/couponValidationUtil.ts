import {CouponDto} from '../dtos/CouponDto'

const MIN_DISCOUNT = 1
const MAX_DISCOUNT = 1000

export const couponValidationUtil = {
  isValidCouponStructure(coupon: CouponDto): boolean {
    return (
      coupon != null &&
      typeof coupon.code === 'string' &&
      coupon.code.trim().length > 0 &&
      typeof coupon.discountAmount === 'number' &&
      coupon.discountAmount >= MIN_DISCOUNT &&
      coupon.discountAmount <= MAX_DISCOUNT &&
      coupon.expiryDate instanceof Date &&
      !isNaN(coupon.expiryDate.getTime())
    )
  },

  normalizeCouponCode(code: string): string {
    return code.trim().toUpperCase()
  },
} as const
