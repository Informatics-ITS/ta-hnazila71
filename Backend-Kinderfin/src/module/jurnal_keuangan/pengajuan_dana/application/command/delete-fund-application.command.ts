import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { logger } from "../../../../../shared/util";
import { IFundApplicationRepository } from "../../domain/repository";

export interface DeleteFundApplicationCommand {
    id: AggregateId;
}

export class DeleteFundApplicationCommandHandler
    implements ICommandHandler<DeleteFundApplicationCommand, void>
{
    constructor(
        private readonly fundApplicationRepository: IFundApplicationRepository,
    ) {}

    async execute(command: DeleteFundApplicationCommand): Promise<void> {
        const { id } = command;
        try {
            const oldFundApplication =
                await this.fundApplicationRepository.isFundApplicationIdExist(
                    id,
                );
            if (!oldFundApplication) {
                logger.error("fund application data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data pengajuan dana tidak ditemukan",
                );
            }
            await this.fundApplicationRepository.deleteFundApplication(id);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
