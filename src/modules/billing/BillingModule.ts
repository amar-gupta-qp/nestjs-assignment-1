import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigType} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import {BillingController} from './application/controllers/BillingController'
import {PricingService} from './application/services/PricingService'
import {CouponValidationService} from './application/services/CouponValidationService'
import {CouponAssignmentService} from './application/services/CouponAssignmentService'
import {VendorIntegrationService} from './application/services/VendorIntegrationService'
import {ResponseService} from '../../common/services/ResponseService'
import {UserEntity} from './domain/entities/UserEntity'
import {CouponEntity} from './domain/entities/CouponEntity'
import {UserCouponEntity} from './domain/entities/UserCouponEntity'
import {UserRepository} from './domain/repositories/UserRepository'
import {CouponRepository} from './domain/repositories/CouponRepository'
import {UserCouponRepository} from './domain/repositories/UserCouponRepository'
import {vendorConfig} from '../../config/VendorConfig'

@Module({
  imports: [
    HttpModule,
    ConfigModule.forFeature(vendorConfig),
    TypeOrmModule.forFeature([UserEntity, CouponEntity, UserCouponEntity]),
  ],
  controllers: [BillingController],
  providers: [
    // Application Services
    PricingService,
    CouponValidationService,
    CouponAssignmentService,
    VendorIntegrationService,
    ResponseService,

    // Domain Repositories
    UserRepository,
    CouponRepository,
    UserCouponRepository,

    // Config
    {
      provide: 'vendor',
      useFactory: (config: ConfigType<typeof vendorConfig>) => config,
      inject: [vendorConfig.KEY],
    },
  ],
  exports: [PricingService],
})
export class BillingModule {}
