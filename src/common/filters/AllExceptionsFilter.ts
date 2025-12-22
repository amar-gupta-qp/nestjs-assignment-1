import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import {HttpAdapterHost} from '@nestjs/core'
import {ResponseService} from '../services/ResponseService'
import {ErrorLogService} from '../services/ErrorLogService'
import {
  ValidationException,
  IFieldValidationError,
} from '../exceptions/ValidationException'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name)

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly responseService: ResponseService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const http = host.switchToHttp()
    const request = http.getRequest()

    try {
      const user = request.user as {userId?: number} | undefined

      let errorMessage: string
      let httpStatus: number
      let validationErrors: IFieldValidationError[] | undefined

      if (exception instanceof ValidationException) {
        // Don't log validation errors, and format errors
        errorMessage = exception.message
        httpStatus = exception.getStatus()
        validationErrors = exception.getResponse() as IFieldValidationError[]
      } else if (exception instanceof HttpException) {
        errorMessage = exception.message
        httpStatus = exception.getStatus()

        // Log error if http status is >= 500 i.e. server errors
        if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR) {
          this.logger.error((exception as HttpException).stack)
          await this.errorLogService.logToDb(
            exception,
            user,
            request.url,
            request.method,
            httpStatus,
          )
        }
      } else {
        // Handle unexpected errors
        errorMessage = 'Internal server error'
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR

        this.logger.error(exception)
        await this.errorLogService.logToDb(
          exception,
          user,
          request.url,
          request.method,
          httpStatus,
        )
      }

      let errorResponse
      if (validationErrors) {
        errorResponse = this.responseService.validationError(
          validationErrors,
          errorMessage,
        )
      } else {
        errorResponse = this.responseService.serverError(errorMessage)
      }

      this.httpAdapterHost.httpAdapter.reply(
        http.getResponse(),
        errorResponse,
        httpStatus,
      )
    } catch (error) {
      // Handle any errors that occur while handling the exception
      // Log the error to logger and send a generic error response
      this.logger.error(
        'Error occurred while handling application exception',
        error,
      )
      this.httpAdapterHost.httpAdapter.reply(
        http.getResponse(),
        this.responseService.serverError('Internal server error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
