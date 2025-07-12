import { Sequelize } from "sequelize";
import {
    AggregateId,
    ApplicationError,
} from "../../../../../../shared/abstract";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../../domain/entity";
import { IFundApplicationRepository } from "../../../domain/repository";

export class FundApplicationRepository implements IFundApplicationRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addFundApplication(
        fundApplicationData: FundApplicationEntity<FundApplicationProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["pengajuan_dana"].create({
                ...fundApplicationData,
                jumlah: fundApplicationData.getJumlah()!.getAmount(),
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateFundApplication(
        fundApplicationData: FundApplicationEntity<FundApplicationProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["pengajuan_dana"].update(
                {
                    ...fundApplicationData,
                    jumlah: fundApplicationData.getJumlah()!.getAmount(),
                },
                {
                    where: { id: fundApplicationData.id },
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteFundApplication(fundApplicationId: AggregateId): Promise<void> {
        try {
            await this.dbConn.models["pengajuan_dana"].destroy({
                where: { id: fundApplicationId },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isFundApplicationIdExist(
        fundApplicationId: AggregateId,
    ): Promise<FundApplicationProps | null> {
        try {
            const fundApplication: any = await this.dbConn.models[
                "pengajuan_dana"
            ].findByPk(fundApplicationId);
            return fundApplication as FundApplicationProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
