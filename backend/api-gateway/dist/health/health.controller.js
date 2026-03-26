"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let HealthController = class HealthController {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    getHealth() {
        return {
            status: 'ok',
            service: 'api-gateway',
            timestamp: new Date().toISOString(),
        };
    }
    async getServicesHealth() {
        const services = [
            { name: 'auth', url: `http://${process.env.AUTH_SERVICE_HOST || '127.0.0.1'}:3005/health` },
            { name: 'school', url: `http://${process.env.SCHOOL_SERVICE_HOST || '127.0.0.1'}:3002/health` },
            { name: 'billing', url: `http://${process.env.BILLING_SERVICE_HOST || '127.0.0.1'}:3006/health` },
        ];
        const results = {
            gateway: 'up',
            auth: 'down',
            school: 'down',
            billing: 'down',
        };
        await Promise.all(services.map(async (service) => {
            try {
                const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(service.url, { timeout: 2000 }));
                if (response.status === 200) {
                    results[service.name] = 'up';
                }
            }
            catch (error) {
                results[service.name] = 'down';
            }
        }));
        return results;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('services'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getServicesHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [axios_1.HttpService])
], HealthController);
//# sourceMappingURL=health.controller.js.map