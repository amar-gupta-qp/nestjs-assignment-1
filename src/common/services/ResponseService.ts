import {Injectable} from '@nestjs/common'

export interface IFieldValidationError {
  field: string
  message: string
}

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: IFieldValidationError[]
}

@Injectable()
export class ResponseService {
  success<T>(data: T): IApiResponse<T> {
    return {
      success: true,
      data,
    }
  }

  serverError(message: string): IApiResponse {
    return {
      success: false,
      error: message,
    }
  }

  validationError(
    validationErrors: IFieldValidationError[],
    message: string,
  ): IApiResponse {
    return {
      success: false,
      error: message,
      validationErrors,
    }
  }
}
