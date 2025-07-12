import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    AllBudgetEstimatePlansResult,
    BudgetEstimatePlanResult,
    IBudgetEstimatePlanQueryHandler,
} from "../../../application/query";

export class BudgetEstimatePlanQueryHandler
    implements IBudgetEstimatePlanQueryHandler
{
    constructor(private readonly dbConn: Sequelize) {}

    async getAllBudgetEstimatePlans(
        year: number,
    ): Promise<AllBudgetEstimatePlansResult> {
        try {
            const budgetEstimatePlans = await this.dbConn.models[
                "rencana_anggaran_biaya"
            ].findAll({
                attributes: [
                    "aktivitas",
                    [
                        this.dbConn.fn(
                            "ARRAY_AGG",
                            this.dbConn.col("sub_aktivitas"),
                        ),
                        "sub_aktivitas",
                    ],
                    [
                        this.dbConn.fn("ARRAY_AGG", this.dbConn.col("jumlah")),
                        "jumlah",
                    ],
                    [this.dbConn.fn("SUM", this.dbConn.col("jumlah")), "total"],
                ],
                where: { tahun: year },
                group: ["aktivitas"],
            });
            return {
                rencana_anggaran_biaya: budgetEstimatePlans.map(
                    (budgetEstimatePlan: any): BudgetEstimatePlanResult => {
                        return {
                            aktivitas: budgetEstimatePlan.aktivitas,
                            sub_aktivitas: budgetEstimatePlan.sub_aktivitas,
                            jumlah: budgetEstimatePlan.jumlah,
                            total: parseInt(budgetEstimatePlan.total),
                        };
                    },
                ),
                total: budgetEstimatePlans.reduce(
                    (total, row: any) => total + parseInt(row.total),
                    0,
                ),
            };
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
