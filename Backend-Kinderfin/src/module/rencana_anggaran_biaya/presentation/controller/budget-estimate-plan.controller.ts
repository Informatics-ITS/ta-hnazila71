import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import {
    GenerateBudgetEstimatePlanCommand,
    GenerateBudgetEstimatePlanCommandHandler,
} from "../../application/command";
import { IBudgetEstimatePlanQueryHandler } from "../../application/query";
import { IBudgetEstimatePlanRepository } from "../../domain/repository";
import { generateBudgetEstimatePlansSchema } from "../mapper";

export class BudgetEstimatePlanController {
    constructor(
        private readonly budgetEstimatePlanRepository: IBudgetEstimatePlanRepository,
        private readonly budgetEstimatePlanQueryHandler: IBudgetEstimatePlanQueryHandler,
        private readonly eventBus: EventBus,
    ) {}

    async generateBudgetEstimatePlans(
        req: Request,
        res: Response,
    ): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(
                body,
                generateBudgetEstimatePlansSchema,
            ) as GenerateBudgetEstimatePlanCommand;
            const generateBudgetEstimatePlanHandler =
                new GenerateBudgetEstimatePlanCommandHandler(
                    this.budgetEstimatePlanRepository,
                    this.eventBus,
                );
            if (await generateBudgetEstimatePlanHandler.execute(validData)) {
                logger.info(
                    `budget estimate plan data for ${validData.tahun} has been successfully generated`,
                );
                buildResponseSuccess(
                    res,
                    StatusCodes.CREATED,
                    `Data rencana anggaran biaya tahun ${validData.tahun} berhasil digenerate`,
                );
                return;
            }
            logger.info(
                `data to be generated for budget estimate plan for ${validData.tahun} is not found`,
            );
            buildResponseError(
                res,
                StatusCodes.NOT_FOUND,
                `Data yang akan digenerate untuk rencana anggaran biaya tahun ${validData.tahun} tidak ditemukan`,
            );
        } catch (error) {
            logger.error("failed to generate budget estimate plan data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllBudgetEstimatePlans(
        req: Request,
        res: Response,
    ): Promise<void> {
        const tahun = parseInt(req.query.tahun as string);
        try {
            const validData: any = validate(
                { tahun },
                generateBudgetEstimatePlansSchema,
            );
            const budgetEstimatePlans =
                await this.budgetEstimatePlanQueryHandler.getAllBudgetEstimatePlans(
                    validData.tahun,
                );
            logger.info(
                `all budget estimate plan data has been successfully retrieved`,
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                budgetEstimatePlans,
            );
        } catch (error) {
            logger.error("failed to get all budget estimate plan data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
