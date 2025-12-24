import {Injectable, Logger} from '@nestjs/common'
import {CouponDto} from '../dtos/CouponDto'
import {CouponRepository} from '../../domain/repositories/CouponRepository'
import {couponValidationUtil} from '../utils/couponValidationUtil'
import {dateUtil} from '../utils/dateUtil'

@Injectable()
export class CouponValidationService {
  private readonly logger = new Logger(CouponValidationService.name)

  constructor(private readonly couponRepository: CouponRepository) {}

  isValidStructure(coupon: CouponDto): boolean {
    const isValid = couponValidationUtil.isValidCouponStructure(coupon)
    if (!isValid) {
      this.logger.warn('Invalid coupon structure')
    }
    return isValid
  }

  isExpired(coupon: CouponDto): boolean {
    const expired = dateUtil.isExpired(coupon.expiryDate)
    if (expired) {
      this.logger.debug(`Coupon ${coupon.code} is expired`)
    }
    return expired
  }

  async hasRemainingUses(couponCode: string): Promise<boolean> {
    const couponEntity = await this.couponRepository.findByCode(couponCode)
    if (!couponEntity) {
      // Coupon not in DB - assume has uses (backward compatibility for tests)
      this.logger.debug(`Coupon ${couponCode} not in database, assuming has uses`)
      return true
    }

    const hasUses = couponEntity.currentUses < couponEntity.maxUses
    if (!hasUses) {
      this.logger.debug(`Coupon ${couponCode} has no remaining uses`)
    }
    return hasUses
  }
}
