declare const _default: (() => {
    port: number;
    nodeEnv: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
}>;
export default _default;
export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}>;
export declare const redisConfig: (() => {
    host: string;
    port: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
}>;
export declare const aiConfig: (() => {
    apiKey: string | undefined;
    baseUrl: string;
    model: string;
    visionApiKey: string | undefined;
    visionBaseUrl: string | undefined;
    visionModel: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    apiKey: string | undefined;
    baseUrl: string;
    model: string;
    visionApiKey: string | undefined;
    visionBaseUrl: string | undefined;
    visionModel: string;
}>;
export declare const ossConfig: (() => {
    endpoint: string | undefined;
    bucket: string;
    accessKey: string | undefined;
    secretKey: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    endpoint: string | undefined;
    bucket: string;
    accessKey: string | undefined;
    secretKey: string | undefined;
}>;
