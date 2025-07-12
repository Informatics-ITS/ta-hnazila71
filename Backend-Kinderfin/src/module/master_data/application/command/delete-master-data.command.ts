import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { IMasterDataRepository } from "../../domain/repository";

export interface DeleteMasterDataCommand {
    id: AggregateId;
}

export class DeleteMasterDataCommandHandler
    implements ICommandHandler<DeleteMasterDataCommand, void>
{
    constructor(private readonly masterDataRepository: IMasterDataRepository) {}

    async execute(command: DeleteMasterDataCommand): Promise<void> {
        const { id } = command;
        try {
            const oldMasterData =
                await this.masterDataRepository.isMasterDataIdExist(id);
            if (!oldMasterData) {
                logger.error("master data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data master tidak ditemukan",
                );
            }
            await this.masterDataRepository.deleteMasterData(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
