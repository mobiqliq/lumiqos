import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Optional: Enable CORS, Global validation pipes, etc.
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
