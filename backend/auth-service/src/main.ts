import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createWinstonLogger } from '@xceliqos/shared/src/logger/winston.logger';

async function bootstrap() {
  const logger = createWinstonLogger('AuthService');
  const app = await NestFactory.create(AppModule, { logger });
  const port = process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3002;
  await app.listen(port);
  logger.log(`Auth Service running on port ${port}`, 'Bootstrap');
}
bootstrap();
