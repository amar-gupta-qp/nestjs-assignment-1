import {registerAs} from '@nestjs/config'

export const vendorConfig = registerAs('vendor', () => ({
  apiUrl: process.env.VENDOR_API_URL || 'https://vendor.example.com',
  timeout: parseInt(process.env.VENDOR_TIMEOUT_MS || '5000', 10),
  verifyPath: process.env.VENDOR_VERIFY_PATH || '/api/verify',
}))

export type VendorConfigType = ReturnType<typeof vendorConfig>
