import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import {Type} from 'class-transformer'
import {IsDate} from 'class-validator'

export class CouponDto {
  @IsNotEmpty()
  @IsString()
  code: string

  @IsNumber()
  @Min(1)
  @Max(1000)
  discountAmount: number

  @Type(() => Date)
  @IsDate()
  expiryDate: Date

  @IsOptional()
  @IsBoolean()
  isThirdParty?: boolean

  @IsOptional()
  @IsString()
  vendorUrl?: string
}
