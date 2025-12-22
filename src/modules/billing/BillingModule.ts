import {Module} from '@nestjs/common'
import {HttpModule} from '@nestjs/axios'
import {ConfigModule, ConfigType} from '@nestjs/config'
import {PricingService} from './application/services/PricingService'
import {BillingController} from './application/controllers/BillingController'
import {vendorConfig} from '../../config/VendorConfig'

@Module({
  imports: [HttpModule, ConfigModule.forFeature(vendorConfig)],
  controllers: [BillingController],
  providers: [
    PricingService,
    {
      provide: 'vendor',
      useFactory: (config: ConfigType<typeof vendorConfig>) => config,
      inject: [vendorConfig.KEY],
    },
  ],
  exports: [PricingService],
})
export class BillingModule {}
