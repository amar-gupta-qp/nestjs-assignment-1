import {HttpException, HttpStatus} from '@nestjs/common'

export interface IFieldValidationError {
  field: string
  message: string
}

export class ValidationException extends HttpException {
  constructor(validationErrors: IFieldValidationError[], message?: string) {
    super(validationErrors, HttpStatus.BAD_REQUEST)
    this.message = message || 'Validation failed'
  }
}
