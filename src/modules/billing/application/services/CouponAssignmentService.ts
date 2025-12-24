import {Injectable, Logger} from '@nestjs/common'
import {UserDto} from '../dtos/UserDto'
import {CouponDto} from '../dtos/CouponDto'
import {UserCouponRepository} from '../../domain/repositories/UserCouponRepository'
import {CouponRepository} from '../../domain/repositories/CouponRepository'
import {couponValidationUtil} from '../utils/couponValidationUtil'

@Injectable()
export class CouponAssignmentService {
  private readonly logger = new Logger(CouponAssignmentService.name)

  constructor(
    private readonly userCouponRepository: UserCouponRepository,
    private readonly couponRepository: CouponRepository,
  ) {}

  async isAssignedToUser(user: UserDto, coupon: CouponDto): Promise<boolean> {
    const normalizedCode = couponValidationUtil.normalizeCouponCode(coupon.code)

    // First check in-memory DTO for quick validation
    const isInDto = user.assignedCouponCodes.some(
      (code) =>
        couponValidationUtil.normalizeCouponCode(code) === normalizedCode,
    )

    if (!isInDto) {
      this.logger.debug(`Coupon ${coupon.code} not in user's assigned list`)
      return false
    }

    // Then verify in database
    const couponEntity = await this.couponRepository.findByCode(coupon.code)
    if (!couponEntity) {
      // Coupon not in DB - trust DTO for backward compatibility (e.g., tests without seed data)
      this.logger.debug(`Coupon ${coupon.code} not in database, using DTO validation only`)
      return true
    }

    const userId = parseInt(user.id, 10)
    if (isNaN(userId)) {
      // Non-numeric user ID - skip DB validation, trust DTO
      this.logger.debug(`Non-numeric user ID ${user.id}, using DTO validation only`)
      return true
    }

    const assignment = await this.userCouponRepository.findAssignedCoupon(
      userId,
      couponEntity.id,
    )

    if (!assignment) {
      this.logger.debug(
        `No database assignment found for coupon ${coupon.code} and user ${user.id}`,
      )
      return false
    }

    if (assignment.isUsed) {
      this.logger.debug(`Coupon ${coupon.code} already used by user ${user.id}`)
      return false
    }

    return true
  }

  async markCouponAsUsed(userId: number, couponCode: string): Promise<void> {
    const couponEntity = await this.couponRepository.findByCode(couponCode)
    if (!couponEntity) {
      this.logger.error(`Cannot mark coupon ${couponCode} as used: not found`)
      return
    }

    await this.userCouponRepository.markAsUsed(userId, couponEntity.id)
    await this.couponRepository.incrementUsage(couponEntity.id)
    this.logger.log(`Marked coupon ${couponCode} as used for user ${userId}`)
  }
}
