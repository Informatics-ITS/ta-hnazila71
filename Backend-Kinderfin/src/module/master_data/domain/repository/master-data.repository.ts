import { AggregateId } from "../../../../shared/abstract";
import { MasterDataEntity, MasterDataProps } from "../entity";

export interface IMasterDataRepository {
    addMasterData(masterData: MasterDataEntity<MasterDataProps>): Promise<void>;
    updateMasterData(
        masterData: MasterDataEntity<MasterDataProps>,
    ): Promise<void>;
    deleteMasterData(masterDataId: string): Promise<void>;
    isMasterDataIdExist(
        masterDataId: AggregateId,
    ): Promise<MasterDataProps | null>;
    isMasterDataValueExist(type: string, value: string): Promise<boolean>;
}
