import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    chat(messages: Array<{
        role: string;
        content: string;
    }>, options?: {
        temperature?: number;
        maxTokens?: number;
        jsonMode?: boolean;
    }): Promise<string>;
    chatStream(messages: Array<{
        role: string;
        content: string;
    }>): AsyncGenerator<string>;
    vision(imageBase64: string, prompt: string): Promise<string>;
}
