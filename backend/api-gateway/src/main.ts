import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3000, '0.0.0.0'); // Force bind to all interfaces
  console.log('API Gateway is running on: ' + (await app.getUrl()));
}
bootstrap();
