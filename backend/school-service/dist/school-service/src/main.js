"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    console.log('--- LUMIQ OS: SCHOOL SERVICE STARTING (V-PEDAGOGICAL-POUR) ---');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const tcpPort = parseInt(process.env.TCP_PORT || '4001', 10);
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: tcpPort,
        },
    });
    await app.startAllMicroservices();
    const httpPort = process.env.PORT || 3001;
    await app.listen(httpPort);
    console.log(`School Service (HTTP) running on port ${httpPort}`);
    console.log(`School Service (TCP) running on port ${tcpPort}`);
}
bootstrap();
//# sourceMappingURL=main.js.map