import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../../shared/util";
import {
    DeleteFundApplicationCommand,
    DeleteFundApplicationCommandHandler,
    InputFundApplicationCommand,
    InputFundApplicationCommandHandler,
    UpdateFundApplicationCommand,
    UpdateFundApplicationCommandHandler,
} from "../../application/command";
import { IFundApplicationQueryHandler } from "../../application/query";
import { MonthlyFundApplicationRetrievedEvent } from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
import {
    deleteFundApplicationSchema,
    inputFundApplicationSchema,
    updateFundApplicationSchema,
    viewAllFundApplicationsSchema,
} from "../mapper";

export class FundApplicationController {
    constructor(
        private readonly fundApplicationRepository: IFundApplicationRepository,
        private readonly fundApplicationQueryHandler: IFundApplicationQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "MonthlyFundApplicationsRequested",
            this.sendMonthlyFundApplications.bind(this),
        );
    }

    async inputFundApplication(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(
                body,
                inputFundApplicationSchema,
            ) as InputFundApplicationCommand;
            const inputFundApplicationHandler =
                new InputFundApplicationCommandHandler(
                    this.fundApplicationRepository,
                    this.eventBus,
                );
            await inputFundApplicationHandler.execute(validData);
            logger.info("fund application data has been successfully inputted");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to input fund application data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllFundApplications(req: Request, res: Response): Promise<void> {
        const bulan = parseInt(req.query.bulan as string);
        const tahun = parseInt(req.query.tahun as string);
        try {
            const validData: any = validate(
                { bulan, tahun },
                viewAllFundApplicationsSchema,
            );
            const fundApplications =
                await this.fundApplicationQueryHandler.getAllFundApplications(
                    validData.bulan,
                    validData.tahun,
                );
            logger.info(
                "all fund application data has been successfully retrieved",
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                fundApplications,
            );
        } catch (error) {
            logger.error("failed to get all fund application data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async sendMonthlyFundApplications(eventData: any): Promise<void> {
        const { tahun } = eventData.data;
        try {
            const monthlyFundApplications =
                await this.fundApplicationQueryHandler.getMonthlyFundApplicationsByYear(
                    tahun,
                );
            this.eventBus.publish(
                "MonthlyFundApplicationsRetrieved",
                new MonthlyFundApplicationRetrievedEvent(
                    monthlyFundApplications,
                    "MonthlyFundApplicationsRetrieved",
                ),
            );
            logger.info(
                "monthly fund application data has been successfully retrieved",
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("MonthlyFundApplicationsRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "MonthlyFundApplicationsRetrieved",
            });
            logger.error("failed to get monthly fund application data");
        }
    }

    async updateFundApplication(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateFundApplicationSchema,
            ) as UpdateFundApplicationCommand;
            const updateFundApplicationHandler =
                new UpdateFundApplicationCommandHandler(
                    this.fundApplicationRepository,
                    this.eventBus,
                );
            await updateFundApplicationHandler.execute(validData);
            logger.info("fund application data has been successfully updated");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update fund application data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteFundApplication(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
            const validData = validate(
                { id },
                deleteFundApplicationSchema,
            ) as DeleteFundApplicationCommand;
            const deleteFundApplicationHandler =
                new DeleteFundApplicationCommandHandler(
                    this.fundApplicationRepository,
                );
            await deleteFundApplicationHandler.execute(validData);
            logger.info("fund application data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete fund application data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
