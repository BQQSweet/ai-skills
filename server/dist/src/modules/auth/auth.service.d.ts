import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma.service';
import { SendSmsDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private redisClient;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    sendSmsCode(dto: SendSmsDto): Promise<void>;
    login(dto: LoginDto): Promise<any>;
    logout(): Promise<null>;
    private verifyCodeAndGetUser;
    private verifyPasswordAndGetUser;
}
