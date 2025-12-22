import {Injectable, Logger, Inject} from '@nestjs/common'
import {HttpService} from '@nestjs/axios'
import {firstValueFrom, timeout, catchError} from 'rxjs'
import {UserDto} from '../dtos/UserDto'
import {CouponDto} from '../dtos/CouponDto'
import {VendorConfigType} from '../../../../config/VendorConfig'

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name)
  private readonly MIN_DISCOUNT = 1
  private readonly MAX_DISCOUNT = 1000

  constructor(
    private readonly httpService: HttpService,
    @Inject('vendor') private readonly vendorConfig: VendorConfigType,
  ) {}

  async applyDiscount(
    user: UserDto,
    coupon: CouponDto,
    originalSubscriptionPrice: number,
  ): Promise<number> {
    if (!this.isValidCoupon(coupon)) {
      this.logger.warn('Invalid coupon object')
      return originalSubscriptionPrice
    }

    // Check coupon assignment
    if (!this.isCouponAssigned(user, coupon)) {
      this.logger.debug(
        `Coupon ${coupon.code} not assigned to user ${user.id}`,
      )
      return originalSubscriptionPrice
    }

    // Check expiry
    if (this.isCouponExpired(coupon)) {
      this.logger.debug(`Coupon ${coupon.code} expired`)
      return originalSubscriptionPrice
    }

    // Verify third-party coupon
    if (coupon.isThirdParty) {
      const isValid = await this.verifyThirdPartyCoupon(coupon.code)
      if (!isValid) {
        this.logger.debug(
          `Third-party coupon ${coupon.code} verification failed`,
        )
        return originalSubscriptionPrice
      }
    }

    // Calculate final price (never negative)
    const finalPrice = Math.max(
      0,
      originalSubscriptionPrice - coupon.discountAmount,
    )
    this.logger.debug(
      `Applied ${coupon.code}: ${originalSubscriptionPrice} -> ${finalPrice}`,
    )

    return finalPrice
  }

  private isValidCoupon(coupon: CouponDto): boolean {
    return (
      coupon != null &&
      typeof coupon.code === 'string' &&
      coupon.code.trim().length > 0 &&
      typeof coupon.discountAmount === 'number' &&
      coupon.discountAmount >= this.MIN_DISCOUNT &&
      coupon.discountAmount <= this.MAX_DISCOUNT &&
      coupon.expiryDate instanceof Date &&
      !isNaN(coupon.expiryDate.getTime())
    )
  }

  private isCouponAssigned(user: UserDto, coupon: CouponDto): boolean {
    const normalizedCode = coupon.code.trim().toUpperCase()
    return user.assignedCouponCodes.some(
      (code) => code?.trim().toUpperCase() === normalizedCode,
    )
  }

  private isCouponExpired(coupon: CouponDto): boolean {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return coupon.expiryDate < now
  }

  private async verifyThirdPartyCoupon(code: string): Promise<boolean> {
    try {
      const url = `${this.vendorConfig.apiUrl}${this.vendorConfig.verifyPath}?couponCode=${encodeURIComponent(code)}`

      const response = await firstValueFrom(
        this.httpService.get<{valid: boolean}>(url).pipe(
          timeout(this.vendorConfig.timeout),
          catchError((err) => {
            this.logger.error(`Vendor API error: ${err.message}`)
            throw err
          }),
        ),
      )

      return response.data?.valid === true
    } catch {
      // Fail-safe: reject coupon on API failure
      return false
    }
  }
}
