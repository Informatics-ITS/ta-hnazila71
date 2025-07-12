import { SalaryHistoryEntity, SalaryHistoryProps } from "../entity";

export interface ISalaryFilterService {
    filterSalaryPaid(salaryDatas: SalaryHistoryProps[]): SalaryHistoryEntity<SalaryHistoryProps>[];
}

export class SalaryFilterService implements ISalaryFilterService {
    filterSalaryPaid(salaryDatas: SalaryHistoryProps[]): SalaryHistoryEntity<SalaryHistoryProps>[] {
        return salaryDatas
            .map((salaryData: SalaryHistoryProps) => {
                return new SalaryHistoryEntity<SalaryHistoryProps>(salaryData);
            })
            .filter((salaryResult) => salaryResult.id != "");
    }
}
