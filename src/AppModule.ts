import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {TypeOrmModule} from '@nestjs/typeorm'
import {HttpModule} from '@nestjs/axios'
import {PrometheusModule} from '@willsoto/nestjs-prometheus'
import {BillingModule} from './modules/billing/BillingModule'
import {HealthModule} from './modules/health/HealthModule'
import {DatabaseModule} from './database/DatabaseModule'
import {ErrorLogEntity} from './common/entities/ErrorLogEntity'
import {ErrorLogService} from './common/services/ErrorLogService'
import {ResponseService} from './common/services/ResponseService'
import {UserEntity} from './modules/billing/domain/entities/UserEntity'
import {CouponEntity} from './modules/billing/domain/entities/CouponEntity'
import {UserCouponEntity} from './modules/billing/domain/entities/UserCouponEntity'
import {databaseConfig} from './config/DatabaseConfig'
import {vendorConfig} from './config/VendorConfig'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, vendorConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'billing',
        entities: [ErrorLogEntity, UserEntity, CouponEntity, UserCouponEntity],
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
      }),
    }),
    TypeOrmModule.forFeature([ErrorLogEntity]),
    HttpModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
      path: '/metrics',
    }),
    HealthModule,
    BillingModule,
    DatabaseModule,
  ],
  providers: [ErrorLogService, ResponseService],
})
export class AppModule {}
