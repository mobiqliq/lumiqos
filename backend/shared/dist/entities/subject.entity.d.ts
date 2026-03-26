import { Board } from './board.entity';
export declare class Subject {
    id: string;
    name: string;
    subject_name: string;
    subject_id: string;
    school_id: string;
    board_id: string;
    category: 'CORE' | 'VOCATIONAL';
    board: Board;
    created_at: Date;
    updated_at: Date;
}
