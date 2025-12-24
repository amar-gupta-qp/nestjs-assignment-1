import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {UserCouponEntity} from '../entities/UserCouponEntity'

@Injectable()
export class UserCouponRepository {
  constructor(
    @InjectRepository(UserCouponEntity)
    private readonly userCouponRepository: Repository<UserCouponEntity>,
  ) {}

  async findAssignedCoupon(
    userId: number,
    couponId: number,
  ): Promise<UserCouponEntity | null> {
    return await this.userCouponRepository
      .createQueryBuilder('uc')
      .where('uc.userId = :userId', {userId})
      .andWhere('uc.couponId = :couponId', {couponId})
      .getOne()
  }

  async findUserAssignedCoupons(userId: number): Promise<UserCouponEntity[]> {
    return await this.userCouponRepository
      .createQueryBuilder('uc')
      .where('uc.userId = :userId', {userId})
      .andWhere('uc.isUsed = :isUsed', {isUsed: false})
      .getMany()
  }

  async save(userCouponEntity: UserCouponEntity): Promise<UserCouponEntity> {
    return await this.userCouponRepository.save(userCouponEntity)
  }

  async markAsUsed(userId: number, couponId: number): Promise<void> {
    await this.userCouponRepository
      .createQueryBuilder()
      .update(UserCouponEntity)
      .set({isUsed: true})
      .where('userId = :userId', {userId})
      .andWhere('couponId = :couponId', {couponId})
      .execute()
  }
}
