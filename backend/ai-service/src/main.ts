import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Health check endpoint
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/health', (req: any, res: any) => {
        res.json({ status: 'ok', service: 'ai-service' });
    });

    const port = process.env.PORT ?? 3005;
    await app.listen(port);
    console.log(`LumiqOS AI Intelligence Layer running on port ${port}`);
}
bootstrap();
