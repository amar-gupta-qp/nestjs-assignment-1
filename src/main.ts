import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'
import {HttpAdapterHost} from '@nestjs/core'
import {AppModule} from './AppModule'
import {AllExceptionsFilter} from './common/filters/AllExceptionsFilter'
import {ResponseService} from './common/services/ResponseService'
import {ErrorLogService} from './common/services/ErrorLogService'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Global exception filter
  const httpAdapter = app.get(HttpAdapterHost)
  const responseService = app.get(ResponseService)
  const errorLogService = app.get(ErrorLogService)

  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapter, responseService, errorLogService),
  )

  // CORS
  app.enableCors()

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`Application is running on: http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`Metrics: http://localhost:${port}/metrics`)
}

bootstrap()
