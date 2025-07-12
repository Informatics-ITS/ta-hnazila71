import { SalaryEntity, SalaryProps } from "../entity";

export interface ISalaryRepository {
    addSalary(
        salaryData: SalaryEntity<SalaryProps>,
    ): Promise<void>;
    updateSalary(
        salaryData: SalaryEntity<SalaryProps>,
        oldSalary: SalaryProps | null,
    ): Promise<void>;
    deleteSalary(id: string): Promise<void>;
    isSalaryDataExist(
        id: string,
    ): Promise<SalaryProps | null>;
}
