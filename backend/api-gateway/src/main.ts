import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createWinstonLogger } from '@xceliqos/shared';
import { GlobalExceptionFilter } from '@xceliqos/shared';
import { CorrelationMiddleware } from '@xceliqos/shared';

async function bootstrap() {
  const logger = createWinstonLogger('ApiGateway');
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(new CorrelationMiddleware().use.bind(new CorrelationMiddleware()));
  await app.listen(3000, '0.0.0.0');
  logger.log('API Gateway is running on: ' + (await app.getUrl()), 'Bootstrap');
}
bootstrap();
