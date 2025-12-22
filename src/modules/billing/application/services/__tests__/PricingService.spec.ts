import {Test, TestingModule} from '@nestjs/testing'
import {HttpService} from '@nestjs/axios'
import {of, throwError} from 'rxjs'
import {PricingService} from '../PricingService'
import {UserDto} from '../../dtos/UserDto'
import {CouponDto} from '../../dtos/CouponDto'

describe('PricingService', () => {
  let service: PricingService
  let httpService: HttpService

  const mockVendorConfig = {
    apiUrl: 'https://vendor.example.com',
    timeout: 5000,
    verifyPath: '/api/verify',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: 'vendor',
          useValue: mockVendorConfig,
        },
      ],
    }).compile()

    service = module.get<PricingService>(PricingService)
    httpService = module.get<HttpService>(HttpService)
  })

  describe('applyDiscount', () => {
    const validUser: UserDto = {
      id: 'user123',
      assignedCouponCodes: ['SAVE10', 'SUMMER20'],
    }

    const validCoupon: CouponDto = {
      code: 'SAVE10',
      discountAmount: 10,
      expiryDate: new Date('2099-12-31'),
      isThirdParty: false,
    }

    it('should apply discount when coupon is valid and assigned', async () => {
      const result = await service.applyDiscount(validUser, validCoupon, 100)
      expect(result).toBe(90)
    })

    it('should handle case-insensitive coupon codes', async () => {
      const coupon: CouponDto = {
        ...validCoupon,
        code: 'save10',
      }
      const result = await service.applyDiscount(validUser, coupon, 100)
      expect(result).toBe(90)
    })

    it('should return original price when coupon is not assigned to user', async () => {
      const coupon: CouponDto = {
        ...validCoupon,
        code: 'INVALID',
      }
      const result = await service.applyDiscount(validUser, coupon, 100)
      expect(result).toBe(100)
    })

    it('should return original price when coupon is expired', async () => {
      const expiredCoupon: CouponDto = {
        ...validCoupon,
        expiryDate: new Date('2020-01-01'),
      }
      const result = await service.applyDiscount(
        validUser,
        expiredCoupon,
        100,
      )
      expect(result).toBe(100)
    })

    it('should never return negative price', async () => {
      const largeCoupon: CouponDto = {
        ...validCoupon,
        discountAmount: 200,
      }
      const result = await service.applyDiscount(validUser, largeCoupon, 50)
      expect(result).toBe(0)
    })

    it('should handle invalid coupon object', async () => {
      const invalidCoupon: any = {
        code: '',
        discountAmount: 10,
        expiryDate: new Date(),
      }
      const result = await service.applyDiscount(
        validUser,
        invalidCoupon,
        100,
      )
      expect(result).toBe(100)
    })

    it('should reject coupon with discount amount below minimum', async () => {
      const invalidCoupon: CouponDto = {
        ...validCoupon,
        discountAmount: 0,
      }
      const result = await service.applyDiscount(
        validUser,
        invalidCoupon,
        100,
      )
      expect(result).toBe(100)
    })

    it('should reject coupon with discount amount above maximum', async () => {
      const invalidCoupon: CouponDto = {
        ...validCoupon,
        discountAmount: 1001,
      }
      const result = await service.applyDiscount(
        validUser,
        invalidCoupon,
        100,
      )
      expect(result).toBe(100)
    })

    describe('Third-party coupons', () => {
      it('should verify and apply third-party coupon when valid', async () => {
        const thirdPartyCoupon: CouponDto = {
          ...validCoupon,
          isThirdParty: true,
        }

        jest.spyOn(httpService, 'get').mockReturnValue(
          of({
            data: {valid: true},
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          }),
        )

        const result = await service.applyDiscount(
          validUser,
          thirdPartyCoupon,
          100,
        )
        expect(result).toBe(90)
        expect(httpService.get).toHaveBeenCalledWith(
          expect.stringContaining('SAVE10'),
        )
      })

      it('should return original price when third-party verification fails', async () => {
        const thirdPartyCoupon: CouponDto = {
          ...validCoupon,
          isThirdParty: true,
        }

        jest.spyOn(httpService, 'get').mockReturnValue(
          of({
            data: {valid: false},
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          }),
        )

        const result = await service.applyDiscount(
          validUser,
          thirdPartyCoupon,
          100,
        )
        expect(result).toBe(100)
      })

      it('should return original price when third-party API fails', async () => {
        const thirdPartyCoupon: CouponDto = {
          ...validCoupon,
          isThirdParty: true,
        }

        jest
          .spyOn(httpService, 'get')
          .mockReturnValue(throwError(() => new Error('API Error')))

        const result = await service.applyDiscount(
          validUser,
          thirdPartyCoupon,
          100,
        )
        expect(result).toBe(100)
      })
    })

    describe('Edge cases', () => {
      it('should handle whitespace in coupon codes', async () => {
        const couponWithSpaces: CouponDto = {
          ...validCoupon,
          code: ' SAVE10 ',
        }
        const result = await service.applyDiscount(
          validUser,
          couponWithSpaces,
          100,
        )
        expect(result).toBe(90)
      })

      it('should handle zero original price', async () => {
        const result = await service.applyDiscount(validUser, validCoupon, 0)
        expect(result).toBe(0)
      })

      it('should apply maximum discount correctly', async () => {
        const maxCoupon: CouponDto = {
          ...validCoupon,
          discountAmount: 1000,
        }
        const result = await service.applyDiscount(validUser, maxCoupon, 2000)
        expect(result).toBe(1000)
      })

      it('should apply minimum discount correctly', async () => {
        const minCoupon: CouponDto = {
          ...validCoupon,
          discountAmount: 1,
        }
        const result = await service.applyDiscount(validUser, minCoupon, 100)
        expect(result).toBe(99)
      })
    })
  })
})
