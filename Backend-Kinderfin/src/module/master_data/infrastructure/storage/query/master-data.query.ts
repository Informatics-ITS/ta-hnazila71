import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IMasterDataQueryHandler } from "../../../application/query";
import { MasterDataProps } from "../../../domain/entity";

export class MasterDataQueryHandler implements IMasterDataQueryHandler {
    constructor(private readonly dbConn: Sequelize) {}

    async getAllMasterDatasByType(type: string): Promise<MasterDataProps[]> {
        try {
            const masterDatas = await this.dbConn.models["master_data"].findAll(
                {
                    where: { tipe: type },
                },
            );
            return masterDatas.map((masterData: any) => {
                return masterData as MasterDataProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
