import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import {
    EventBus,
    MasterDataTypeFormatter,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import {
    DeleteMasterDataCommand,
    DeleteMasterDataCommandHandler,
    InputMasterDataCommand,
    InputMasterDataCommandHandler,
    UpdateMasterDataCommand,
    UpdateMasterDataCommandHandler,
} from "../../application/command";
import { IMasterDataQueryHandler } from "../../application/query";
import { MasterDataRetrievedEvent } from "../../domain/event";
import { IMasterDataRepository } from "../../domain/repository";
import {
    deleteMasterDataSchema,
    inputMasterDataSchema,
    updateMasterDataSchema,
    viewAllMasterDatasSchema,
} from "../mapper";

export class MasterDataController {
    constructor(
        private readonly masterDataRepository: IMasterDataRepository,
        private readonly masterDataQueryHandler: IMasterDataQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "MasterDataRequested",
            this.sendAllMasterDatas.bind(this),
        );
    }

    async inputMasterData(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["tipe"] = MasterDataTypeFormatter(
            req.params.type ?? "jenis-pembayaran",
        );
        try {
            const validData = validate(
                body,
                inputMasterDataSchema,
            ) as InputMasterDataCommand;
            const inputMasterDataHandler = new InputMasterDataCommandHandler(
                this.masterDataRepository,
            );
            await inputMasterDataHandler.execute(validData);
            logger.info("master data has been successfully inputted");
            logger.info(validData);
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to input master data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllMasterDatas(req: Request, res: Response): Promise<void> {
        const tipe = MasterDataTypeFormatter(
            req.params.type ?? "jenis-pembayaran",
        );
        try {
            const validData: any = validate({ tipe }, viewAllMasterDatasSchema);
            const masterDatas =
                await this.masterDataQueryHandler.getAllMasterDatasByType(
                    validData.tipe,
                );
            logger.info("all master data has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                masterDatas,
            );
        } catch (error) {
            logger.error("failed to get all master data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async sendAllMasterDatas(eventData: any): Promise<void> {
        try {
            const masterDatas =
                await this.masterDataQueryHandler.getAllMasterDatasByType(
                    eventData.data.tipe,
                );
            this.eventBus.publish(
                "MasterDataRetrieved",
                new MasterDataRetrievedEvent(
                    masterDatas,
                    "MasterDataRetrieved",
                ),
            );
            logger.info("master data has been successfully retrieved");
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("MasterDataRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "MasterDataRetrieved",
            });
            logger.error("failed to get master data");
        }
    }

    async updateMasterData(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateMasterDataSchema,
            ) as UpdateMasterDataCommand;
            const updateMasterDataHandler = new UpdateMasterDataCommandHandler(
                this.masterDataRepository,
            );
            await updateMasterDataHandler.execute(validData);
            logger.info("master data has been successfully updated");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update master data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteMasterData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
            const validData = validate(
                { id },
                deleteMasterDataSchema,
            ) as DeleteMasterDataCommand;
            const deleteMasterDataHandler = new DeleteMasterDataCommandHandler(
                this.masterDataRepository,
            );
            await deleteMasterDataHandler.execute(validData);
            logger.info("master data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete master data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
