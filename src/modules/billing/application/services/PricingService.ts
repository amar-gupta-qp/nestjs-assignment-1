import {Injectable, Logger} from '@nestjs/common'
import {UserDto} from '../dtos/UserDto'
import {CouponDto} from '../dtos/CouponDto'
import {CouponValidationService} from './CouponValidationService'
import {CouponAssignmentService} from './CouponAssignmentService'
import {VendorIntegrationService} from './VendorIntegrationService'

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name)

  constructor(
    private readonly couponValidationService: CouponValidationService,
    private readonly couponAssignmentService: CouponAssignmentService,
    private readonly vendorIntegrationService: VendorIntegrationService,
  ) {}

  async applyDiscount(
    user: UserDto,
    coupon: CouponDto,
    originalSubscriptionPrice: number,
  ): Promise<number> {
    if (!this.couponValidationService.isValidStructure(coupon)) {
      return originalSubscriptionPrice
    }

    const isAssigned = await this.couponAssignmentService.isAssignedToUser(
      user,
      coupon,
    )
    if (!isAssigned) {
      return originalSubscriptionPrice
    }

    if (this.couponValidationService.isExpired(coupon)) {
      return originalSubscriptionPrice
    }

    const hasUses = await this.couponValidationService.hasRemainingUses(
      coupon.code,
    )
    if (!hasUses) {
      return originalSubscriptionPrice
    }

    if (coupon.isThirdParty) {
      const isValid = await this.vendorIntegrationService.verifyThirdPartyCoupon(
        coupon.code,
      )
      if (!isValid) {
        this.logger.debug(`Third-party coupon ${coupon.code} verification failed`)
        return originalSubscriptionPrice
      }
    }

    const finalPrice = this.calculateFinalPrice(
      originalSubscriptionPrice,
      coupon.discountAmount,
    )

    // Mark coupon as used in database (only if numeric user ID)
    const userId = parseInt(user.id, 10)
    if (!isNaN(userId)) {
      await this.couponAssignmentService.markCouponAsUsed(userId, coupon.code)
    }

    this.logger.log(
      `Applied coupon ${coupon.code} for user ${user.id}: ${originalSubscriptionPrice} -> ${finalPrice}`,
    )

    return finalPrice
  }

  private calculateFinalPrice(
    originalPrice: number,
    discountAmount: number,
  ): number {
    return Math.max(0, originalPrice - discountAmount)
  }
}
