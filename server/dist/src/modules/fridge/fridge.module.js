"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FridgeModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const fridge_controller_1 = require("./fridge.controller");
const fridge_service_1 = require("./fridge.service");
const ai_module_1 = require("../../ai/ai.module");
const prisma_service_1 = require("../../common/prisma.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let FridgeModule = class FridgeModule {
};
exports.FridgeModule = FridgeModule;
exports.FridgeModule = FridgeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ai_module_1.AiModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('jwt.secret'),
                    signOptions: {
                        expiresIn: config.get('jwt.expiresIn'),
                    },
                }),
            }),
        ],
        controllers: [fridge_controller_1.FridgeController],
        providers: [fridge_service_1.FridgeService, prisma_service_1.PrismaService, jwt_auth_guard_1.JwtAuthGuard],
        exports: [fridge_service_1.FridgeService],
    })
], FridgeModule);
//# sourceMappingURL=fridge.module.js.map