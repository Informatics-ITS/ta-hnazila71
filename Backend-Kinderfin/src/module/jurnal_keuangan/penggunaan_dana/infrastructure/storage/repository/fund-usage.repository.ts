import { Op, Sequelize } from "sequelize";
import {
    AggregateId,
    ApplicationError,
} from "../../../../../../shared/abstract";
import { FundUsageEntity, FundUsageProps } from "../../../domain/entity";
import { IFundUsageRepository } from "../../../domain/repository";

export class FundUsageRepository implements IFundUsageRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addFundUsage(
        fundUsageData: FundUsageEntity<FundUsageProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["penggunaan_dana"].create(
                fundUsageData as any,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateFundUsage(
        fundUsageData: FundUsageEntity<FundUsageProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["penggunaan_dana"].update(fundUsageData, {
                where: { id: fundUsageData.id },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteFundUsage(fundUsageId: AggregateId): Promise<void> {
        try {
            await this.dbConn.models["penggunaan_dana"].destroy({
                where: { id: fundUsageId },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isFundUsageIdExist(
        fundUsageId: AggregateId,
    ): Promise<FundUsageProps | null> {
        try {
            const fundUsage = await this.dbConn.models[
                "penggunaan_dana"
            ].findByPk(fundUsageId);
            return fundUsage as FundUsageProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isFundUsageSameHRExist(
        subActivity: string,
        usageMonth: number,
        usageYear: number,
        receiver: string,
    ): Promise<boolean> {
        try {
            const fundUsage = await this.dbConn.models[
                "penggunaan_dana"
            ].findOne({
                where: {
                    sub_aktivitas: subActivity,
                    penerima: receiver,
                    [Op.and]: [
                        this.dbConn.fn(
                            'EXTRACT(MONTH from "tanggal")=',
                            usageMonth,
                        ),
                        this.dbConn.fn(
                            'EXTRACT(YEAR from "tanggal")=',
                            usageYear,
                        ),
                    ],
                },
            });
            return fundUsage != null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
