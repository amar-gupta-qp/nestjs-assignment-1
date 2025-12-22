import {IsArray, IsNotEmpty, IsString} from 'class-validator'

export class UserDto {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsArray()
  @IsString({each: true})
  assignedCouponCodes: string[]
}
