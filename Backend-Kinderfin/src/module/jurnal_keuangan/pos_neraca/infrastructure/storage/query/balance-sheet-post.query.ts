import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../../shared/abstract";
import { IBalanceSheetPostQueryHandler } from "../../../application/query";
import { BalanceSheetPostProps } from "../../../domain/entity";

export class BalanceSheetPostQueryHandler
    implements IBalanceSheetPostQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllBalanceSheetPosts(): Promise<BalanceSheetPostProps[]> {
        try {
            const balanceSheetPosts = await this.dbConn.models[
                "pos_neraca"
            ].findAll();
            return balanceSheetPosts.map(
                (balanceSheetPost): BalanceSheetPostProps => {
                    return balanceSheetPost as BalanceSheetPostProps;
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getBalanceSheetPostDataByBalanceSheetPostYear(
        balanceSheetPostYear: number,
    ): Promise<BalanceSheetPostProps> {
        try {
            const balanceSheetPost = await this.dbConn.models[
                "pos_neraca"
            ].findOne({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            return (balanceSheetPost as BalanceSheetPostProps) ?? {};
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
