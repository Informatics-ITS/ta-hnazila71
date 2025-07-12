import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    BudgetEstimatePlanEntity,
    BudgetEstimatePlanProps,
} from "../../../domain/entity";
import { IBudgetEstimatePlanRepository } from "../../../domain/repository";

export class BudgetEstimatePlanRepository
    implements IBudgetEstimatePlanRepository
{
    constructor(private readonly dbConn: Sequelize) {}

    async refreshBudgetEstimatePlan(
        year: number,
        budgetEstimatePlanDatas?: BudgetEstimatePlanEntity<BudgetEstimatePlanProps>[],
    ): Promise<void> {
        try {
            await this.dbConn.transaction(async (t) => {
                await this.dbConn.models["rencana_anggaran_biaya"].destroy({
                    where: { tahun: year },
                    transaction: t,
                });
                if (budgetEstimatePlanDatas) {
                    await this.dbConn.models[
                        "rencana_anggaran_biaya"
                    ].bulkCreate(budgetEstimatePlanDatas as any, {
                        transaction: t,
                    });
                }
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
