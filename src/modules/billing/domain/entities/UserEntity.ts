import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity({name: 'user'})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  email: string

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  name: string

  @Column({
    name: 'subscription_tier',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  subscriptionTier: string

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
