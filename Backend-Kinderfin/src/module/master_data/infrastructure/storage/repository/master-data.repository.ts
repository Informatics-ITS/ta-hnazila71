import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { MasterDataEntity, MasterDataProps } from "../../../domain/entity";
import { IMasterDataRepository } from "../../../domain/repository";

export class MasterDataRepository implements IMasterDataRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addMasterData(
        masterData: MasterDataEntity<MasterDataProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["master_data"].create(masterData as any);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateMasterData(
        masterData: MasterDataEntity<MasterDataProps>,
    ): Promise<void> {
        try {
            await this.dbConn.models["master_data"].update(masterData, {
                where: { id: masterData.id },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteMasterData(masterDataId: string): Promise<void> {
        try {
            await this.dbConn.models["master_data"].destroy({
                where: { id: masterDataId },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isMasterDataIdExist(
        masterDataId: AggregateId,
    ): Promise<MasterDataProps | null> {
        try {
            const masterData: any = await this.dbConn.models[
                "master_data"
            ].findByPk(masterDataId);
            return masterData as MasterDataProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isMasterDataValueExist(type: string, value: string): Promise<boolean> {
        try {
            const masterData = await this.dbConn.models["master_data"].findOne({
                where: { tipe: type, nilai: value },
            });
            return masterData != null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
