import { School } from './school.entity';
export declare class InventoryItem {
    id: string;
    school_id: string;
    name: string;
    category: string;
    current_stock: number;
    unit: string;
    usage_rate: string;
    run_out_prediction: string;
    status: string;
    vendor: string;
    school: School;
    created_at: Date;
    updated_at: Date;
}
