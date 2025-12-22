import {Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import {Repository} from 'typeorm'
import {ErrorLogEntity} from '../entities/ErrorLogEntity'

interface IUser {
  userId?: number
  emailAddress?: string
}

@Injectable()
export class ErrorLogService {
  private readonly logger = new Logger(ErrorLogService.name)

  constructor(
    @InjectRepository(ErrorLogEntity)
    private readonly errorLogRepository: Repository<ErrorLogEntity>,
  ) {}

  async logToDb(
    exception: unknown,
    user?: IUser,
    requestUrl?: string,
    requestMethod?: string,
    statusCode?: number,
  ): Promise<void> {
    try {
      const errorMessage =
        exception instanceof Error ? exception.message : 'Unknown error'
      const stackTrace =
        exception instanceof Error ? exception.stack || null : null

      const errorLogEntity = ErrorLogEntity.create(
        errorMessage,
        stackTrace,
        user?.userId || null,
        requestUrl || null,
        requestMethod || null,
        statusCode || null,
      )

      await this.errorLogRepository.save(errorLogEntity)
    } catch (error) {
      // Fallback to logger if database logging fails
      this.logger.error('Failed to log error to database', error)
      this.logger.error('Original error', exception)
    }
  }
}
