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
    DeleteFundUsageCommand,
    DeleteFundUsageCommandHandler,
    ReportFundUsageCommand,
    ReportFundUsageCommandHandler,
    UpdateFundUsageCommand,
    UpdateFundUsageCommandHandler,
} from "../../application/command";
import { IFundUsageQueryHandler } from "../../application/query";
import {
    BudgetEstimatePlanRetrievedEvent,
    MonthlyFundUsageRetrievedEvent,
} from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import {
    deleteFundUsageSchema,
    reportFundUsageSchema,
    updateFundUsageSchema,
    viewAllFundUsagesSchema,
} from "../mapper";

export class FundUsageController {
    constructor(
        private readonly fundUsageRepository: IFundUsageRepository,
        private readonly fundUsageQueryHandler: IFundUsageQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "BudgetEstimatePlanRequested",
            this.sendBudgetEstimatePlan.bind(this),
        );
        this.eventBus.subscribe(
            "MonthlyFundUsagesRequested",
            this.sendMonthlyFundUsages.bind(this),
        );
    }

    async reportFundUsage(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(
                body,
                reportFundUsageSchema,
            ) as ReportFundUsageCommand;
            const reportFundUsageHandler = new ReportFundUsageCommandHandler(
                this.fundUsageRepository,
                this.eventBus,
            );
            await reportFundUsageHandler.execute(validData);
            logger.info("fund usage data has been successfully reported");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to report fund usage data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllFundUsages(req: Request, res: Response): Promise<void> {
        const bulan = parseInt(req.query.bulan as string);
        const tahun = parseInt(req.query.tahun as string);
        try {
            const validData: any = validate(
                { bulan, tahun },
                viewAllFundUsagesSchema,
            );
            const fundUsages =
                await this.fundUsageQueryHandler.getAllFundUsages(
                    validData.bulan,
                    validData.tahun,
                );
            logger.info("all fund usage data has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                fundUsages,
            );
        } catch (error) {
            logger.error("failed to get all fund usage data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async sendBudgetEstimatePlan(eventData: any): Promise<void> {
        const { tahun } = eventData.data;
        try {
            const simplifiedFundUsages =
                await this.fundUsageQueryHandler.getSimplifiedFundUsages(tahun);
            this.eventBus.publish(
                "BudgetEstimatePlanRetrieved",
                new BudgetEstimatePlanRetrievedEvent(
                    simplifiedFundUsages,
                    "BudgetEstimatePlanRetrieved",
                ),
            );
            logger.info(
                "simplified fund usage data has been successfully retrieved",
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("BudgetEstimatePlanRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "BudgetEstimatePlanRetrieved",
            });
            logger.error("failed to get simplified fund usage data");
        }
    }

    async sendMonthlyFundUsages(eventData: any): Promise<void> {
        const { tahun } = eventData.data;
        try {
            const monthlyFundUsages =
                await this.fundUsageQueryHandler.getMonthlyFundUsagesByYear(
                    tahun,
                );
            this.eventBus.publish(
                "MonthlyFundUsagesRetrieved",
                new MonthlyFundUsageRetrievedEvent(
                    monthlyFundUsages,
                    "MonthlyFundUsagesRetrieved",
                ),
            );
            logger.info(
                "monthly fund usage data has been successfully retrieved",
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("MonthlyFundUsagesRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "MonthlyFundUsagesRetrieved",
            });
            logger.error("failed to get monthly fund usage data");
        }
    }

    async updateFundUsage(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateFundUsageSchema,
            ) as UpdateFundUsageCommand;
            const updateFundUsageHandler = new UpdateFundUsageCommandHandler(
                this.fundUsageRepository,
                this.eventBus,
            );
            await updateFundUsageHandler.execute(validData);
            logger.info("fund usage data has been successfully updated");
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update fund usage data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteFundUsage(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        try {
            const validData = validate(
                { id },
                deleteFundUsageSchema,
            ) as DeleteFundUsageCommand;
            const deleteFundUsageHandler = new DeleteFundUsageCommandHandler(
                this.fundUsageRepository,
                this.eventBus,
            );
            await deleteFundUsageHandler.execute(validData);
            logger.info("fund usage data has been successfully removed");
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error("failed to delete fund usage data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
