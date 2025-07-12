import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ImageKit from "imagekit";
import { appConfig } from "../../../../config";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import {
    DeletePaymentProofCommand,
    DeletePaymentProofCommandHandler,
    UpdatePaymentProofCommand,
    UpdatePaymentProofCommandHandler,
    UploadPaymentProofCommand,
    UploadPaymentProofCommandHandler,
} from "../../application/command";
import { IPaymentProofQueryHandler } from "../../application/query";
import { IFileService } from "../../application/service";
import { IPaymentProofRepository } from "../../domain/repository";
import { FileService } from "../../infrastructure/service";
import {
    deletePaymentProofSchema,
    updatePaymentProofSchema,
    uploadPaymentProofSchema,
} from "../mapper";
import { DokumenEntity, DokumenProps } from "../../../siswa/domain/entity";
const imagekit = appConfig.get("/imagekit");

export class PaymentProofController {
    private readonly fileService: IFileService;

    constructor(
        private readonly paymentProofRepository: IPaymentProofRepository,
        private readonly paymentProofQueryHandler: IPaymentProofQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.fileService = new FileService(
            new ImageKit({
                publicKey: imagekit.publicKey,
                privateKey: imagekit.privateKey,
                urlEndpoint: imagekit.urlEndpoint,
            }),
        );
    }

    async uploadPaymentProof(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["bukti_pembayaran"] = req.file;
        try {
            const validData = validate(
                body,
                uploadPaymentProofSchema,
            ) as UploadPaymentProofCommand;
            const uploadPaymentProofHandler =
                new UploadPaymentProofCommandHandler(
                    this.paymentProofRepository,
                    this.fileService,
                    this.eventBus,
                );
            await uploadPaymentProofHandler.execute(validData);
            logger.info("payment proof has been successfully uploaded");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to upload payment proof");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }


    async viewAllPaymentProofs(req: Request, res: Response): Promise<void> {
        try {
            const paymentProofs =
                await this.paymentProofQueryHandler.getAllPaymentProofs();
            logger.info(
                "all payment proof data has been successfully retrieved",
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                paymentProofs,
            );
        } catch (error) {
            logger.error("failed to get all payment proof data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async updatePaymentProof(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        body["bukti_pembayaran"] = req.file;
        try {
            const validData = validate(
                body,
                updatePaymentProofSchema,
            ) as UpdatePaymentProofCommand;
            const updatePaymentProofHandler =
                new UpdatePaymentProofCommandHandler(
                    this.paymentProofRepository,
                    this.fileService,
                    this.eventBus,
                );
            await updatePaymentProofHandler.execute(validData);
            logger.info("payment proof data has been successfully updated");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update payment proof data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deletePaymentProof(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
            const validData = validate(
                { id },
                deletePaymentProofSchema,
            ) as DeletePaymentProofCommand;
            const deletePaymentProofHandler =
                new DeletePaymentProofCommandHandler(
                    this.paymentProofRepository,
                    this.fileService,
                );
            await deletePaymentProofHandler.execute(validData);
            logger.info("payment proof data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete payment proof data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
