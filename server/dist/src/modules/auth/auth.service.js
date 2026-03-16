"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../common/prisma.service");
const auth_dto_1 = require("./dto/auth.dto");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    redisClient;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const redisConfig = this.configService.get('redis');
        this.redisClient = new ioredis_1.default({
            host: redisConfig.host,
            port: redisConfig.port,
        });
    }
    async sendSmsCode(dto) {
        const { phone } = dto;
        const ttl = await this.redisClient.ttl(`auth:code:${phone}`);
        if (ttl > 240) {
            throw new common_1.BadRequestException('验证码发送过于频繁，请稍后再试');
        }
        const code = '123456';
        await this.redisClient.setex(`auth:code:${phone}`, 300, code);
        console.log(`[SMS Simulation] Sending code ${code} to phone ${phone}`);
    }
    async login(dto) {
        let user;
        if (dto.type === auth_dto_1.LoginType.CODE) {
            if (!dto.phone || !dto.code) {
                throw new common_1.BadRequestException('手机号和验证码不能为空');
            }
            user = await this.verifyCodeAndGetUser(dto.phone, dto.code);
        }
        else if (dto.type === auth_dto_1.LoginType.PASSWORD) {
            if (!dto.account || !dto.password) {
                throw new common_1.BadRequestException('账号和密码不能为空');
            }
            user = await this.verifyPasswordAndGetUser(dto.account, dto.password);
        }
        if (!user) {
            throw new common_1.UnauthorizedException('登录失败，用户状态异常');
        }
        const payload = { sub: user.id, phone: user.phone, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync({ sub: user.id }, {
            expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        });
        const groupMemberships = await this.prisma.groupMember.findMany({
            where: { user_id: user.id },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        invite_code: true,
                    },
                },
            },
        });
        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                phone: user.phone,
                nickname: user.nickname,
                avatarUrl: user.avatar_url,
                role: user.role,
                preferences: user.preferences,
                createdAt: user.created_at,
            },
            groups: groupMemberships.map((m) => ({
                groupId: m.group.id,
                name: m.group.name,
                inviteCode: m.group.invite_code,
                role: m.role,
            })),
        };
    }
    async logout() {
        return null;
    }
    async verifyCodeAndGetUser(phone, code) {
        const storedCode = await this.redisClient.get(`auth:code:${phone}`);
        if (!storedCode || storedCode !== code) {
            throw new common_1.BadRequestException('验证码不正确或已过期');
        }
        await this.redisClient.del(`auth:code:${phone}`);
        let user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            const defaultPassword = await bcrypt.hash('123456', 10);
            user = await this.prisma.user.create({
                data: {
                    phone,
                    password_hash: defaultPassword,
                    nickname: `CM_${phone.slice(-4)}`,
                },
            });
        }
        return user;
    }
    async verifyPasswordAndGetUser(account, password) {
        const user = await this.prisma.user.findUnique({
            where: { phone: account },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('该账号未注册');
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('密码错误');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map