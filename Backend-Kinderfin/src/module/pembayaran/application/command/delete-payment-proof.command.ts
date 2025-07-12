import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { IPaymentProofRepository } from "../../domain/repository";
import { IFileService } from "../service";

export interface DeletePaymentProofCommand {
    id: AggregateId;
}

export class DeletePaymentProofCommandHandler
    implements ICommandHandler<DeletePaymentProofCommand, void>
{
    constructor(
        private readonly paymentProofRepository: IPaymentProofRepository,
        private readonly fileService: IFileService,
    ) {}

    async execute(command: DeletePaymentProofCommand): Promise<void> {
        const { id } = command;
        try {
            const oldPaymentProof =
                await this.paymentProofRepository.isPaymentProofIdExist(id);
            if (!oldPaymentProof) {
                logger.error("payment proof data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data bukti pembayaran tidak ditemukan",
                );
            }
            await this.paymentProofRepository.deletePaymentProof(
                id,
                oldPaymentProof.id_file_pembayaran,
            );
            await this.fileService.deleteFile(
                oldPaymentProof.id_file_pembayaran,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
