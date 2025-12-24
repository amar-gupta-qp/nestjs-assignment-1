import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity({name: 'coupon'})
export class CouponEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  code: string

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  discountAmount: number

  @Column({
    name: 'expiry_date',
    type: 'date',
    nullable: false,
  })
  expiryDate: Date

  @Column({
    name: 'is_third_party',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isThirdParty: boolean

  @Column({
    name: 'max_uses',
    type: 'int',
    nullable: false,
    default: 1,
  })
  maxUses: number

  @Column({
    name: 'current_uses',
    type: 'int',
    nullable: false,
    default: 0,
  })
  currentUses: number

  @Column({
    name: 'created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}
