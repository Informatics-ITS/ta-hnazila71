import { Op, Sequelize } from "sequelize";
import {
    ApplicationError,
} from "../../../../../../shared/abstract";
import {
    AllFundUsagesResult,
    IFundUsageQueryHandler,
} from "../../../application/query";
import { FundUsageProps } from "../../../domain/entity";
import { MonthlyFundUsageValue, SimplifiedFundUsagesResult } from "../../../domain/event";

export class FundUsageQueryHandler implements IFundUsageQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllFundUsages(
        bulan: number,
        tahun: number,
    ): Promise<AllFundUsagesResult> {
        try {
            const fundUsages = await this.dbConn.models[
                "penggunaan_dana"
            ].findAll({
                where: {
                    [Op.and]: [
                        this.dbConn.fn('EXTRACT(MONTH from "tanggal")=', bulan),
                        this.dbConn.fn('EXTRACT(YEAR from "tanggal")=', tahun),
                    ],
                },
            });
            return {
                penggunaan_dana: fundUsages.map(
                    (fundUsage: any): FundUsageProps => {
                        return fundUsage as FundUsageProps;
                    },
                ),
                jumlah: fundUsages.reduce(
                    (total, row: any) => total + row.jumlah,
                    0,
                ),
            };
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getMonthlyFundUsagesByYear(
        year: number,
    ): Promise<MonthlyFundUsageValue[]> {
        try {
            const monthlyFundUsages = await this.dbConn.models[
                "penggunaan_dana"
            ].findAll({
                attributes: [
                    [
                        this.dbConn.fn(
                            "EXTRACT",
                            this.dbConn.literal('MONTH FROM "tanggal"'),
                        ),
                        "month",
                    ],
                    [this.dbConn.fn("SUM", this.dbConn.col("jumlah")), "total"],
                ],
                where: {
                    [Op.and]: [
                        this.dbConn.fn('EXTRACT(YEAR from "tanggal")=', year),
                    ],
                },
                group: this.dbConn.fn(
                    "EXTRACT",
                    this.dbConn.literal('MONTH FROM "tanggal"'),
                ),
                order: this.dbConn.fn(
                    "EXTRACT",
                    this.dbConn.literal('MONTH FROM "tanggal"'),
                ),
                raw: true,
            });
            return monthlyFundUsages.map(
                (monthlyFundUsage: any): MonthlyFundUsageValue => {
                    return {
                        bulan: parseInt(monthlyFundUsage.month),
                        total: parseInt(monthlyFundUsage.total),
                    };
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getSimplifiedFundUsages(
        year: number,
    ): Promise<SimplifiedFundUsagesResult[]> {
        try {
            const simplifiedFundUsages = await this.dbConn.models[
                "penggunaan_dana"
            ].findAll({
                attributes: [
                    "aktivitas",
                    "sub_aktivitas",
                    [this.dbConn.fn("SUM", this.dbConn.col("jumlah")), "total"],
                ],
                where: {
                    [Op.and]: [
                        this.dbConn.fn('EXTRACT(YEAR from "tanggal")=', year),
                    ],
                },
                group: ["aktivitas", "sub_aktivitas"],
                raw: true,
            });
            return simplifiedFundUsages.map(
                (simplifiedFundUsage: any): SimplifiedFundUsagesResult => {
                    return {
                        aktivitas: simplifiedFundUsage.aktivitas,
                        sub_aktivitas: simplifiedFundUsage.sub_aktivitas,
                        tahun: year,
                        jumlah: parseInt(simplifiedFundUsage.total),
                    };
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
