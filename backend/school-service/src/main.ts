import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Create HTTP app
  const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug'],
});

  // 2. Connect microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3001 },
  });

  // 3. Start both
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('HTTP server running on http://localhost:3000');
}
bootstrap();