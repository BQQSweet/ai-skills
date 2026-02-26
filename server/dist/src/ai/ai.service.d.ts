import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly config;
    private readonly logger;
    private openai;
    constructor(config: ConfigService);
    generateRecipe(prompt: string): Promise<any>;
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, options?: {
        temperature?: number;
        jsonMode?: boolean;
    }): Promise<string>;
    chatStream(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>): AsyncGenerator<string>;
    vision(imageBase64: string, prompt: string): Promise<string>;
}
