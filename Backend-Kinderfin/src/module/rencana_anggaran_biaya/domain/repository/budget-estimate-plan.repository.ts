import { BudgetEstimatePlanEntity, BudgetEstimatePlanProps } from "../entity";

export interface IBudgetEstimatePlanRepository {
    refreshBudgetEstimatePlan(
        year: number,
        budgetEstimatePlanDatas?: BudgetEstimatePlanEntity<BudgetEstimatePlanProps>[],
    ): Promise<void>;
}
