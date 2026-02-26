export declare class SendSmsDto {
    phone: string;
}
export declare enum LoginType {
    CODE = "code",
    PASSWORD = "password"
}
export declare class LoginDto {
    type: LoginType;
    phone?: string;
    code?: string;
    account?: string;
    password?: string;
}
