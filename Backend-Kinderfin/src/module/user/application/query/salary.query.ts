import { SalaryProps } from "../../domain/entity";

export interface ISalaryQueryHandler {
    getAllSalaries(page: number, limit: number): Promise<SalaryProps[]>;
    getSalariesById(page: number, limit: number, user_id: string): Promise<SalaryProps[]>;
}