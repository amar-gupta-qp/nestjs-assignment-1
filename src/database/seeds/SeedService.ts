import {Injectable, Logger, OnModuleInit} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {UserEntity} from '../../modules/billing/domain/entities/UserEntity'
import {CouponEntity} from '../../modules/billing/domain/entities/CouponEntity'
import {UserCouponEntity} from '../../modules/billing/domain/entities/UserCouponEntity'

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(UserCouponEntity)
    private readonly userCouponRepository: Repository<UserCouponEntity>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_DATA === 'true') {
      await this.seed()
    }
  }

  async seed() {
    this.logger.log('Starting database seeding...')

    await this.seedUsers()
    await this.seedCoupons()
    await this.seedUserCoupons()

    this.logger.log('Database seeding completed!')
  }

  private async seedUsers() {
    const users = [
      {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        subscriptionTier: 'premium',
      },
      {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Smith',
        subscriptionTier: 'basic',
      },
      {
        id: 3,
        email: 'bob@example.com',
        name: 'Bob Wilson',
        subscriptionTier: 'enterprise',
      },
    ]

    for (const userData of users) {
      const exists = await this.userRepository.findOne({
        where: {id: userData.id},
      })

      if (!exists) {
        await this.userRepository.save(userData)
        this.logger.log(`Created user: ${userData.email}`)
      }
    }
  }

  private async seedCoupons() {
    const coupons = [
      {
        id: 1,
        code: 'SAVE10',
        discountAmount: 10,
        expiryDate: new Date('2099-12-31'),
        isThirdParty: false,
        maxUses: 100,
        currentUses: 0,
      },
      {
        id: 2,
        code: 'SAVE20',
        discountAmount: 20,
        expiryDate: new Date('2099-12-31'),
        isThirdParty: false,
        maxUses: 50,
        currentUses: 0,
      },
      {
        id: 3,
        code: 'SUMMER50',
        discountAmount: 50,
        expiryDate: new Date('2099-12-31'),
        isThirdParty: false,
        maxUses: 25,
        currentUses: 0,
      },
      {
        id: 4,
        code: 'EXPIRED10',
        discountAmount: 10,
        expiryDate: new Date('2020-01-01'),
        isThirdParty: false,
        maxUses: 100,
        currentUses: 0,
      },
      {
        id: 5,
        code: 'MAXUSED',
        discountAmount: 15,
        expiryDate: new Date('2099-12-31'),
        isThirdParty: false,
        maxUses: 1,
        currentUses: 1,
      },
      {
        id: 6,
        code: 'THIRDPARTY25',
        discountAmount: 25,
        expiryDate: new Date('2099-12-31'),
        isThirdParty: true,
        maxUses: 100,
        currentUses: 0,
      },
    ]

    for (const couponData of coupons) {
      const exists = await this.couponRepository.findOne({
        where: {id: couponData.id},
      })

      if (!exists) {
        await this.couponRepository.save(couponData)
        this.logger.log(`Created coupon: ${couponData.code}`)
      }
    }
  }

  private async seedUserCoupons() {
    const assignments = [
      {userId: 1, couponId: 1, isUsed: false}, // John -> SAVE10
      {userId: 1, couponId: 2, isUsed: false}, // John -> SAVE20
      {userId: 1, couponId: 4, isUsed: false}, // John -> EXPIRED10
      {userId: 1, couponId: 5, isUsed: false}, // John -> MAXUSED
      {userId: 1, couponId: 6, isUsed: false}, // John -> THIRDPARTY25
      {userId: 2, couponId: 1, isUsed: false}, // Jane -> SAVE10
      {userId: 2, couponId: 3, isUsed: false}, // Jane -> SUMMER50
      {userId: 3, couponId: 2, isUsed: false}, // Bob -> SAVE20
      {userId: 3, couponId: 3, isUsed: false}, // Bob -> SUMMER50
    ]

    for (const assignment of assignments) {
      const exists = await this.userCouponRepository.findOne({
        where: {userId: assignment.userId, couponId: assignment.couponId},
      })

      if (!exists) {
        await this.userCouponRepository.save(assignment)
        this.logger.log(
          `Assigned coupon ${assignment.couponId} to user ${assignment.userId}`,
        )
      }
    }
  }
}
