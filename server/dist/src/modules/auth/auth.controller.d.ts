import { AuthService } from './auth.service';
import { SendSmsDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendSmsCode(sendSmsDto: SendSmsDto): Promise<{
        code: number;
        data: null;
        msg: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        code: number;
        data: any;
        msg: string;
    }>;
}
