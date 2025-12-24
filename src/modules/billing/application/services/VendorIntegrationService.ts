import {Injectable, Logger, Inject} from '@nestjs/common'
import {HttpService} from '@nestjs/axios'
import {firstValueFrom, timeout, catchError} from 'rxjs'
import {VendorConfigType} from '../../../../config/VendorConfig'

@Injectable()
export class VendorIntegrationService {
  private readonly logger = new Logger(VendorIntegrationService.name)

  constructor(
    private readonly httpService: HttpService,
    @Inject('vendor') private readonly vendorConfig: VendorConfigType,
  ) {}

  async verifyThirdPartyCoupon(code: string): Promise<boolean> {
    try {
      const url = `${this.vendorConfig.apiUrl}${this.vendorConfig.verifyPath}?couponCode=${encodeURIComponent(code)}`

      const response = await firstValueFrom(
        this.httpService.get<{valid: boolean}>(url).pipe(
          timeout(this.vendorConfig.timeout),
          catchError((err) => {
            this.logger.error(`Vendor API error for coupon ${code}: ${err.message}`)
            throw err
          }),
        ),
      )

      const isValid = response.data?.valid === true
      this.logger.debug(`Third-party coupon ${code} verification result: ${isValid}`)
      return isValid
    } catch {
      return false
    }
  }
}
