import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private readonly config;
    private readonly logger;
    private openai;
    private visionClient;
    constructor(config: ConfigService);
    generateRecipe(options: {
        prompt?: string;
        taste?: string;
        dietary?: string;
        servings?: number;
    }): Promise<any>;
    answerStepQuestion(dto: {
        recipeContext: string;
        stepInstruction: string;
        question: string;
    }): Promise<string>;
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
    generateSpeech(text: string): Promise<string>;
    transcribeAudio(file: Express.Multer.File): Promise<string>;
    parseCommandIntent(text: string): Promise<{
        command: string;
        confidence: number;
        original_text: string;
    }>;
}
