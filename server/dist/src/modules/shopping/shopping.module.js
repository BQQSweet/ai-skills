"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const shopping_controller_1 = require("./shopping.controller");
const shopping_service_1 = require("./shopping.service");
const prisma_service_1 = require("../../common/prisma.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ShoppingModule = class ShoppingModule {
};
exports.ShoppingModule = ShoppingModule;
exports.ShoppingModule = ShoppingModule = __decorate([
    (0, common_1.Module)({
        imports: [
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
        controllers: [shopping_controller_1.ShoppingController],
        providers: [shopping_service_1.ShoppingService, prisma_service_1.PrismaService, jwt_auth_guard_1.JwtAuthGuard],
        exports: [shopping_service_1.ShoppingService],
    })
], ShoppingModule);
//# sourceMappingURL=shopping.module.js.map