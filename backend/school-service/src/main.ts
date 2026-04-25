import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { createWinstonLogger } from '@xceliqos/shared/src/logger/winston.logger';

async function bootstrap() {
  const logger = createWinstonLogger('SchoolService');

  // 1. Create HTTP app
  const app = await NestFactory.create(AppModule, { logger });

  // 2. Connect microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3001 },
  });

  // 3. Start both
  await app.startAllMicroservices();
  await app.listen(3000);
  logger.log('HTTP server running on http://localhost:3000', 'Bootstrap');
}
bootstrap();
