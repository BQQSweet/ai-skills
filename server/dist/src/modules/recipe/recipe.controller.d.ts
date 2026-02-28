import { RecipeService } from './recipe.service';
import { CreateRecipeDto, UpdateRecipeDto, QueryRecipeDto } from './dto/recipe.dto';
export declare class RecipeController {
    private readonly recipeService;
    constructor(recipeService: RecipeService);
    create(dto: CreateRecipeDto, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        servings: number;
        description: string | null;
        title: string;
        tags: string[];
        status: string;
        ingredients: import("@prisma/client/runtime/client").JsonValue;
        steps: import("@prisma/client/runtime/client").JsonValue;
        nutrition: import("@prisma/client/runtime/client").JsonValue | null;
        difficulty: string;
        cook_time: number;
        cover_url: string | null;
        source_type: string;
        source_url: string | null;
        created_by: string | null;
    }>;
    findAll(query: QueryRecipeDto): Promise<{
        list: {
            id: string;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            servings: number;
            description: string | null;
            title: string;
            tags: string[];
            status: string;
            ingredients: import("@prisma/client/runtime/client").JsonValue;
            steps: import("@prisma/client/runtime/client").JsonValue;
            nutrition: import("@prisma/client/runtime/client").JsonValue | null;
            difficulty: string;
            cook_time: number;
            cover_url: string | null;
            source_type: string;
            source_url: string | null;
            created_by: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    recommend(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        servings: number;
        description: string | null;
        title: string;
        tags: string[];
        status: string;
        ingredients: import("@prisma/client/runtime/client").JsonValue;
        steps: import("@prisma/client/runtime/client").JsonValue;
        nutrition: import("@prisma/client/runtime/client").JsonValue | null;
        difficulty: string;
        cook_time: number;
        cover_url: string | null;
        source_type: string;
        source_url: string | null;
        created_by: string | null;
    }[]>;
    generateAiRecipe(body: {
        ingredients: string[];
        taste?: string;
        mealType?: string;
        servings?: number;
    }, userId: string): Promise<any>;
    askStep(body: import('./dto/ask-step.dto').AskStepDto): Promise<string>;
    generateVoice(body: {
        text: string;
    }): Promise<{
        audioBase64: string;
    }>;
    parseIntent(body: {
        text: string;
    }): Promise<{
        command: string;
        confidence: number;
        original_text: string;
    }>;
    processVoiceCommand(file: Express.Multer.File): Promise<{
        command: string;
        confidence: number;
        original_text: string;
    }>;
    findOne(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        servings: number;
        description: string | null;
        title: string;
        tags: string[];
        status: string;
        ingredients: import("@prisma/client/runtime/client").JsonValue;
        steps: import("@prisma/client/runtime/client").JsonValue;
        nutrition: import("@prisma/client/runtime/client").JsonValue | null;
        difficulty: string;
        cook_time: number;
        cover_url: string | null;
        source_type: string;
        source_url: string | null;
        created_by: string | null;
    }>;
    update(id: string, dto: UpdateRecipeDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        servings: number;
        description: string | null;
        title: string;
        tags: string[];
        status: string;
        ingredients: import("@prisma/client/runtime/client").JsonValue;
        steps: import("@prisma/client/runtime/client").JsonValue;
        nutrition: import("@prisma/client/runtime/client").JsonValue | null;
        difficulty: string;
        cook_time: number;
        cover_url: string | null;
        source_type: string;
        source_url: string | null;
        created_by: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        servings: number;
        description: string | null;
        title: string;
        tags: string[];
        status: string;
        ingredients: import("@prisma/client/runtime/client").JsonValue;
        steps: import("@prisma/client/runtime/client").JsonValue;
        nutrition: import("@prisma/client/runtime/client").JsonValue | null;
        difficulty: string;
        cook_time: number;
        cover_url: string | null;
        source_type: string;
        source_url: string | null;
        created_by: string | null;
    }>;
}
