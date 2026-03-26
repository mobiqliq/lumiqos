import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('--- LUMIQ OS: SCHOOL SERVICE STARTING (V-PEDAGOGICAL-POUR) ---');
  const app = await NestFactory.create(AppModule);

  // 1. Setup Microservice (TCP) for Gateway communication
  const tcpPort = parseInt(process.env.TCP_PORT || '4001', 10);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  // 2. Start Microservice
  await app.startAllMicroservices();

  // 3. Setup HTTP for direct testing/health check
  const httpPort = process.env.PORT || 3001;
  await app.listen(httpPort);

  console.log(`School Service (HTTP) running on port ${httpPort}`);
  console.log(`School Service (TCP) running on port ${tcpPort}`);
}
bootstrap();
