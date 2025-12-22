import {Type} from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator'
import {UserDto} from './UserDto'
import {CouponDto} from './CouponDto'

export class ApplyDiscountDto {
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto

  @ValidateNested()
  @Type(() => CouponDto)
  coupon: CouponDto

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  originalSubscriptionPrice: number
}
