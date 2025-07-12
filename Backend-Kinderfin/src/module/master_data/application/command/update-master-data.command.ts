import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { MasterDataEntity, MasterDataProps } from "../../domain/entity";
import { IMasterDataRepository } from "../../domain/repository";
import { IMasterDataService, MasterDataService } from "../../domain/service";

export interface UpdateMasterDataCommand {
    id: AggregateId;
    nilai?: string;
    aturan?: string;
    deskripsi?: string;
}

export class UpdateMasterDataCommandHandler
    implements ICommandHandler<UpdateMasterDataCommand, void> {
    private readonly masterDataService: IMasterDataService;

    constructor(private readonly masterDataRepository: IMasterDataRepository) {
        this.masterDataService = new MasterDataService();
    }

    async execute(command: UpdateMasterDataCommand): Promise<void> {
        try {
            const masterData = new MasterDataEntity<MasterDataProps>(
                command as MasterDataProps,
            );
            const oldMasterData =
                await this.masterDataRepository.isMasterDataIdExist(
                    masterData.id,
                );
            if (!oldMasterData) {
                logger.error("master data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data master tidak ditemukan",
                );
            }
            if (
                masterData.getNilai()! &&
                masterData.getNilai() != oldMasterData.nilai
            ) {
                const err =
                    await this.masterDataService.validateUniqueMasterData(
                        oldMasterData.tipe,
                        masterData.getNilai()!,
                        this.masterDataRepository,
                    );
                if (err) {
                    logger.error("master data has been inputted");
                    throw new ApplicationError(
                        StatusCodes.BAD_REQUEST,
                        err.message,
                    );
                }
            }
            await this.masterDataRepository.updateMasterData(masterData);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
