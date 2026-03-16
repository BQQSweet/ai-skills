import { AuthService } from './auth.service';
import { SendSmsDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendSmsCode(sendSmsDto: SendSmsDto): Promise<null>;
    login(loginDto: LoginDto): Promise<any>;
    logout(): Promise<null>;
}
