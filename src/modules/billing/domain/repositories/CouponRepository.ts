import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {CouponEntity} from '../entities/CouponEntity'

@Injectable()
export class CouponRepository {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
  ) {}

  async findByCode(code: string): Promise<CouponEntity | null> {
    return await this.couponRepository
      .createQueryBuilder('coupon')
      .where('UPPER(coupon.code) = UPPER(:code)', {code})
      .getOne()
  }

  async save(couponEntity: CouponEntity): Promise<CouponEntity> {
    return await this.couponRepository.save(couponEntity)
  }

  async incrementUsage(couponId: number): Promise<void> {
    await this.couponRepository
      .createQueryBuilder()
      .update(CouponEntity)
      .set({currentUses: () => 'current_uses + 1'})
      .where('id = :couponId', {couponId})
      .execute()
  }
}
