import {Body, Controller, Post} from '@nestjs/common'
import {PricingService} from '../services/PricingService'
import {ResponseService} from '../../../../common/services/ResponseService'
import {ApplyDiscountDto} from '../dtos/ApplyDiscountDto'

@Controller('billing')
export class BillingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('apply-discount')
  async applyDiscount(@Body() dto: ApplyDiscountDto) {
    const finalPrice = await this.pricingService.applyDiscount(
      dto.user,
      dto.coupon,
      dto.originalSubscriptionPrice,
    )

    return this.responseService.success({
      finalPrice,
      originalPrice: dto.originalSubscriptionPrice,
      discountApplied: dto.originalSubscriptionPrice - finalPrice,
      couponCode: dto.coupon.code,
    })
  }
}
