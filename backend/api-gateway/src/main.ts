import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();


  // Service URLs — use specific host env vars to match docker-compose.yml
  const authHost = process.env.AUTH_SERVICE_HOST || 'localhost';
  const schoolHost = process.env.SCHOOL_SERVICE_HOST || 'localhost';
  const billingHost = process.env.BILLING_SERVICE_HOST || 'localhost';

  const authUrl = `http://${authHost}:3002`;
  const schoolUrl = `http://${schoolHost}:3001`;
  const billingUrl = `http://${billingHost}:3006`;
  const userUrl = process.env.USER_SERVICE_URL || 'http://localhost:3003';

  // Helper to create simplified proxy
  const proxy = (prefix: string, target: string) => {
    app.use(
      createProxyMiddleware({
        pathFilter: (path) => path.startsWith(`/api${prefix}`),
        target,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      })
    );
  };

  // Service Proxies
  proxy('/auth', authUrl);
  proxy('/users', userUrl);
  proxy('/saas', billingUrl);
  
  // School Service Routes
  [
    '/schools', '/academic', '/academic-years', '/students', '/attendance', 
    '/homework', '/exams', '/report-cards', '/communication', '/finance', 
    '/dashboard', '/curriculum', '/curriculum-orchestrator', '/timetable', 
    '/substitution', '/academic-planning'
  ].forEach(route => {
    app.use(
      createProxyMiddleware({
        pathFilter: (path) => path.startsWith(`/api${route}`),
        target: schoolUrl,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      })
    );
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
