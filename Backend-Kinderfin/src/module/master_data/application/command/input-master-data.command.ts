import { StatusCodes } from "http-status-codes";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { MasterDataEntity, MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { IMasterDataService, MasterDataService } from "../../domain/service";

export interface InputMasterDataCommand {
    tipe: string;
    nilai: string;
    aturan?: string;
    deskripsi?: string;
}

export class InputMasterDataCommandHandler
    implements ICommandHandler<InputMasterDataCommand, void> {
    private readonly masterDataService: IMasterDataService;

    constructor(private readonly masterDataRepository: IMasterDataRepository) {
        this.masterDataService = new MasterDataService();
    }

    async execute(command: InputMasterDataCommand): Promise<void> {
        try {
            const newMasterData = new MasterDataEntity<MasterDataProps>(
                command as MasterDataProps,
            );
            const err = await this.masterDataService.validateUniqueMasterData(
                newMasterData.getTipe(),
                newMasterData.getNilai()!,
                this.masterDataRepository,
            );
            if (err) {
                logger.error("master data has been inputted");
                throw new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    err.message,
                );
            }
            await this.masterDataRepository.addMasterData(newMasterData);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
