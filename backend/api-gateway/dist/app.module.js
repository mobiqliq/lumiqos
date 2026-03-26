"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const microservices_1 = require("@nestjs/microservices");
const axios_1 = require("@nestjs/axios");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'lumiqos_db',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'lumiq',
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            microservices_1.ClientsModule.register([
                {
                    name: 'AUTH_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: process.env.AUTH_SERVICE_HOST || 'auth-service', port: 3002 },
                },
                {
                    name: 'SCHOOL_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.SCHOOL_SERVICE_HOST || 'localhost',
                        port: parseInt(process.env.SCHOOL_SERVICE_PORT || '3001', 10)
                    },
                },
                {
                    name: 'BILLING_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: process.env.BILLING_SERVICE_HOST || 'lumiqos_billing', port: 3006 },
                },
            ]),
            axios_1.HttpModule,
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map