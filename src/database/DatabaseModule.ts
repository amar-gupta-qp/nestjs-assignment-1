import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import {UserEntity} from '../modules/billing/domain/entities/UserEntity'
import {CouponEntity} from '../modules/billing/domain/entities/CouponEntity'
import {UserCouponEntity} from '../modules/billing/domain/entities/UserCouponEntity'
import {SeedService} from './seeds/SeedService'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CouponEntity, UserCouponEntity]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
