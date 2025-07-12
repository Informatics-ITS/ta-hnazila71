import { ApplicationError } from "../../../../shared/abstract";
import { IMasterDataRepository } from "../repository";

const ErrorMasterDataValueAlreadyExist = "Data master telah dimasukkan";

export interface IMasterDataService {
    validateUniqueMasterData(
        type: string,
        value: string,
        masterDataRepository: IMasterDataRepository,
    ): Promise<Error | null>;
}

export class MasterDataService implements IMasterDataService {
    async validateUniqueMasterData(
        type: string,
        value: string,
        masterDataRepository: IMasterDataRepository,
    ): Promise<Error | null> {
        try {
            return (await masterDataRepository.isMasterDataValueExist(
                type,
                value,
            ))
                ? Error(ErrorMasterDataValueAlreadyExist)
                : null;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
