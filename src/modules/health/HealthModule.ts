import {Module} from '@nestjs/common'
import {TerminusModule} from '@nestjs/terminus'
import {HealthController} from './application/controllers/HealthController'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
