import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import {HttpAdapterHost} from '@nestjs/core'
import request from 'supertest'
import {AppModule} from '../../AppModule'
import {AllExceptionsFilter} from '../../common/filters/AllExceptionsFilter'
import {ResponseService} from '../../common/services/ResponseService'
import {ErrorLogService} from '../../common/services/ErrorLogService'

describe('BillingController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    const httpAdapter = app.get(HttpAdapterHost)
    const responseService = app.get(ResponseService)
    const errorLogService = app.get(ErrorLogService)

    app.useGlobalFilters(
      new AllExceptionsFilter(httpAdapter, responseService, errorLogService),
    )

    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('/billing/apply-discount (POST)', () => {
    const validRequest = {
      user: {
        id: 'user123',
        assignedCouponCodes: ['SAVE10', 'SUMMER20'],
      },
      coupon: {
        code: 'SAVE10',
        discountAmount: 10,
        expiryDate: '2099-12-31',
        isThirdParty: false,
      },
      originalSubscriptionPrice: 100,
    }

    it('should apply discount successfully', () => {
      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(validRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data.finalPrice).toBe(90)
          expect(res.body.data.originalPrice).toBe(100)
          expect(res.body.data.discountApplied).toBe(10)
          expect(res.body.data.couponCode).toBe('SAVE10')
        })
    })

    it('should return original price when coupon is not assigned', () => {
      const invalidRequest = {
        ...validRequest,
        coupon: {
          ...validRequest.coupon,
          code: 'NOTASSIGNED',
        },
      }

      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(invalidRequest)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data.finalPrice).toBe(100)
          expect(res.body.data.discountApplied).toBe(0)
        })
    })

    it('should validate required fields', () => {
      const invalidRequest = {
        user: {
          id: 'user123',
        },
      }

      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(invalidRequest)
        .expect(400)
    })

    it('should validate discount amount range', () => {
      const invalidRequest = {
        ...validRequest,
        coupon: {
          ...validRequest.coupon,
          discountAmount: 1001,
        },
      }

      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(invalidRequest)
        .expect(400)
    })

    it('should validate minimum price', () => {
      const invalidRequest = {
        ...validRequest,
        originalSubscriptionPrice: -10,
      }

      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(invalidRequest)
        .expect(400)
    })

    it('should never return negative final price', () => {
      const requestWithLargeDiscount = {
        ...validRequest,
        coupon: {
          ...validRequest.coupon,
          discountAmount: 200,
        },
        originalSubscriptionPrice: 50,
      }

      return request(app.getHttpServer())
        .post('/billing/apply-discount')
        .send(requestWithLargeDiscount)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data.finalPrice).toBe(0)
        })
    })
  })

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined()
        })
    })
  })

  describe('/metrics (GET)', () => {
    it('should return Prometheus metrics', () => {
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect('Content-Type', /text/)
    })
  })
})
