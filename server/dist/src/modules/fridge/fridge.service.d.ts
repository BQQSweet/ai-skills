import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { AiService } from '../../ai/ai.service';
import { CreateFridgeItemDto } from './dto/create-fridge-item.dto';
export declare class FridgeService {
    private readonly prisma;
    private readonly aiService;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService, config: ConfigService);
    recognizeLabel(imageBase64: string): Promise<any>;
    getUserGroupId(userId: string): Promise<string>;
    addItem(groupId: string, dto: CreateFridgeItemDto): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        group_id: string;
        category: string;
        quantity: number;
        unit: string;
        expire_date: Date;
        production_date: Date | null;
        photo_url: string | null;
        source: string;
        status: string;
    }>;
    listItems(groupId: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        group_id: string;
        category: string;
        quantity: number;
        unit: string;
        expire_date: Date;
        production_date: Date | null;
        photo_url: string | null;
        source: string;
        status: string;
    }[]>;
    clearExpired(groupId: string): Promise<{
        cleared: number;
    }>;
    deleteItem(id: string): Promise<{
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        group_id: string;
        category: string;
        quantity: number;
        unit: string;
        expire_date: Date;
        production_date: Date | null;
        photo_url: string | null;
        source: string;
        status: string;
    }>;
    private calcStatus;
}
