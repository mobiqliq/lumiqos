"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_proxy_middleware_1 = require("http-proxy-middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();
    const authHost = process.env.AUTH_SERVICE_HOST || 'localhost';
    const schoolHost = process.env.SCHOOL_SERVICE_HOST || 'localhost';
    const billingHost = process.env.BILLING_SERVICE_HOST || 'localhost';
    const authUrl = `http://${authHost}:3002`;
    const schoolUrl = `http://${schoolHost}:3001`;
    const billingUrl = `http://${billingHost}:3006`;
    const userUrl = process.env.USER_SERVICE_URL || 'http://localhost:3003';
    const proxy = (prefix, target) => {
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)({
            pathFilter: (path) => path.startsWith(`/api${prefix}`),
            target,
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
        }));
    };
    proxy('/auth', authUrl);
    proxy('/users', userUrl);
    proxy('/saas', billingUrl);
    [
        '/schools', '/academic', '/academic-years', '/students', '/attendance',
        '/homework', '/exams', '/report-cards', '/communication', '/finance',
        '/dashboard', '/curriculum', '/curriculum-orchestrator', '/timetable',
        '/substitution', '/academic-planning'
    ].forEach(route => {
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)({
            pathFilter: (path) => path.startsWith(`/api${route}`),
            target: schoolUrl,
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
        }));
    });
    await app.listen(process.env.PORT ?? 3000);
    console.log(`API Gateway running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map