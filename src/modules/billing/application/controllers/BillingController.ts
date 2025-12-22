import {Body, Controller, Post} from '@nestjs/common'
import {PricingService} from '../services/PricingService'
import {ApplyDiscountDto} from '../dtos/ApplyDiscountDto'

@Controller('billing')
export class BillingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('apply-discount')
  async applyDiscount(
    @Body() dto: ApplyDiscountDto,
  ): Promise<{finalPrice: number}> {
    const finalPrice = await this.pricingService.applyDiscount(
      dto.user,
      dto.coupon,
      dto.originalSubscriptionPrice,
    )

    return {finalPrice}
  }
}
