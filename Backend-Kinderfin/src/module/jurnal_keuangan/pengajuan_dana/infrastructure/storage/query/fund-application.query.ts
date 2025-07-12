import { Sequelize } from "sequelize";
import {
    ApplicationError,
} from "../../../../../../shared/abstract";
import {
    AllFundApplicationsResult,
    IFundApplicationQueryHandler,
} from "../../../application/query";
import { FundApplicationProps } from "../../../domain/entity";
import { MonthlyFundApplicationValue } from "../../../domain/event";

export class FundApplicationQueryHandler
    implements IFundApplicationQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllFundApplications(
        bulan: number,
        tahun: number,
    ): Promise<AllFundApplicationsResult> {
        try {
            const fundApplications = await this.dbConn.models[
                "pengajuan_dana"
            ].findAll({
                where: { bulan: bulan, tahun: tahun },
            });
            return {
                pengajuan_dana: fundApplications.map(
                    (fundApplication: any): FundApplicationProps => {
                        return fundApplication as FundApplicationProps;
                    },
                ),
                jumlah: fundApplications.reduce(
                    (total, row: any) => total + row.jumlah,
                    0,
                ),
            };
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getMonthlyFundApplicationsByYear(
        year: number,
    ): Promise<MonthlyFundApplicationValue[]> {
        try {
            const monthlyFundApplications = await this.dbConn.models[
                "pengajuan_dana"
            ].findAll({
                attributes: [
                    ["bulan", "month"],
                    [this.dbConn.fn("SUM", this.dbConn.col("jumlah")), "total"],
                ],
                where: { tahun: year },
                group: ["bulan"],
                order: ["bulan"],
                raw: true,
            });
            return monthlyFundApplications.map(
                (monthlyFundApplication: any): MonthlyFundApplicationValue => {
                    return {
                        bulan: parseInt(monthlyFundApplication.month),
                        total: parseInt(monthlyFundApplication.total),
                    };
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
