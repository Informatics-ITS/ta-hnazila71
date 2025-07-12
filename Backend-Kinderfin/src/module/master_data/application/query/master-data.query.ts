import { MasterDataProps } from "../../domain/entity";

export interface IMasterDataQueryHandler {
    getAllMasterDatasByType(type: string): Promise<MasterDataProps[]>;
}
