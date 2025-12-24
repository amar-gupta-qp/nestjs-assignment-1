import {Entity, PrimaryGeneratedColumn, Column, Index} from 'typeorm'

@Entity({name: 'user_coupon'})
@Index(['userId', 'couponId'], {unique: true})
export class UserCouponEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number

  @Column({
    name: 'coupon_id',
    type: 'int',
    nullable: false,
  })
  couponId: number

  @Column({
    name: 'assigned_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date

  @Column({
    name: 'is_used',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isUsed: boolean
}
