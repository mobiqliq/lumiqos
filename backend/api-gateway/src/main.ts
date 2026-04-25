import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createWinstonLogger } from '@xceliqos/shared/src/logger/winston.logger';
import { CorrelationMiddleware } from '@xceliqos/shared/src/logger/correlation.middleware';

async function bootstrap() {
  const logger = createWinstonLogger('ApiGateway');
  const app = await NestFactory.create(AppModule, { logger });
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(new CorrelationMiddleware().use.bind(new CorrelationMiddleware()));
  await app.listen(3000, '0.0.0.0');
  logger.log('API Gateway is running on: ' + (await app.getUrl()), 'Bootstrap');
}
bootstrap();
