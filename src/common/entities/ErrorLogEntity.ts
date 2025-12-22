import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm'

@Entity({name: 'error_logs'})
export class ErrorLogEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({name: 'user_id', type: 'int', nullable: true})
  userId: number | null

  @Column({name: 'error_message', type: 'text', nullable: false})
  errorMessage: string

  @Column({name: 'stack_trace', type: 'text', nullable: true})
  stackTrace: string | null

  @Column({name: 'request_url', type: 'varchar', length: 500, nullable: true})
  requestUrl: string | null

  @Column({name: 'request_method', type: 'varchar', length: 10, nullable: true})
  requestMethod: string | null

  @Column({name: 'status_code', type: 'int', nullable: true})
  statusCode: number | null

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date

  static create(
    errorMessage: string,
    stackTrace: string | null,
    userId: number | null = null,
    requestUrl: string | null = null,
    requestMethod: string | null = null,
    statusCode: number | null = null,
  ): ErrorLogEntity {
    const entity = new ErrorLogEntity()
    entity.userId = userId
    entity.errorMessage = errorMessage
    entity.stackTrace = stackTrace
    entity.requestUrl = requestUrl
    entity.requestMethod = requestMethod
    entity.statusCode = statusCode
    return entity
  }
}
