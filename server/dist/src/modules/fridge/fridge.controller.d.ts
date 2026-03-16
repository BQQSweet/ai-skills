import { FridgeService } from './fridge.service';
import { CreateFridgeItemDto } from './dto/create-fridge-item.dto';
import { RecognizeLabelDto } from './dto/recognize-label.dto';
export declare class FridgeController {
    private readonly fridgeService;
    constructor(fridgeService: FridgeService);
    recognizeLabel(dto: RecognizeLabelDto): Promise<any>;
    addItem(dto: CreateFridgeItemDto): Promise<{
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
    deleteItem(id: string, groupId: string): Promise<{
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
}
