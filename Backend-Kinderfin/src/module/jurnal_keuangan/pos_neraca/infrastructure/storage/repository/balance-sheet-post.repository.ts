import { Sequelize } from "sequelize";
import {
    AggregateId,
    ApplicationError,
} from "../../../../../../shared/abstract";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../../domain/entity";
import { IBalanceSheetPostRepository } from "../../../domain/repository";

export class BalanceSheetPostRepository implements IBalanceSheetPostRepository {
    constructor(private readonly dbConn: Sequelize) { }

    async addBalanceSheetPost(
        balanceSheetPostData: BalanceSheetPostEntity<BalanceSheetPostProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["pos_neraca"].create({
                ...balanceSheetPostData,
                kas: balanceSheetPostData.getKas()!.getAmount(),
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateBalanceSheetPost(
        balanceSheetPostData: BalanceSheetPostEntity<BalanceSheetPostProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["pos_neraca"].update(
                {
                    ...balanceSheetPostData,
                    kas: balanceSheetPostData.getKas()!.getAmount(),
                },
                {
                    where: { id: balanceSheetPostData.id },
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isBalanceSheetPostDataIdExist(
        balanceSheetPostId: AggregateId,
    ): Promise<BalanceSheetPostProps | null> {
        try {
            const balanceSheetPost = await this.dbConn.models[
                "pos_neraca"
            ].findByPk(balanceSheetPostId);
            return balanceSheetPost as BalanceSheetPostProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isBalanceSheetPostDataYearExist(
        balanceSheetPostYear: number,
    ): Promise<boolean> {
        try {
            const balanceSheetPost = await this.dbConn.models[
                "pos_neraca"
            ].findOne({
                where: { tahun_pos_neraca: balanceSheetPostYear },
            });
            return balanceSheetPost != null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
