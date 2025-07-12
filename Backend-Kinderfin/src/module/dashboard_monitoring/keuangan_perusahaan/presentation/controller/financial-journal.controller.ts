import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../../shared/util";
import {
    MonitorBalanceSheetApplicationService,
    MonitorCashFlowStatisticApplicationService,
} from "../../application/query";
import { monitorFinancialJournalSchema } from "../mapper";

export class FinancialJournalController {
    constructor(private readonly eventBus: EventBus) { }

    async monitorCashFlowStatistic(req: Request, res: Response): Promise<void> {
        const tahun = parseInt(req.query.tahun as string);
        try {
            const validData: any = validate(
                { tahun },
                monitorFinancialJournalSchema,
            );
            const monitorCashFlowStatisticApplicationService =
                new MonitorCashFlowStatisticApplicationService(this.eventBus);
            const cashFlowStatistic =
                await monitorCashFlowStatisticApplicationService.retrieveCashFlowStatistic(
                    validData.tahun,
                );
            logger.info("cash flow statistic has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                "Berhasil mendapatkan statistik arus keuangan",
                cashFlowStatistic,
            );
        } catch (error) {
            logger.error("failed to get cash flow statistic");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async monitorBalanceSheet(req: Request, res: Response): Promise<void> {
        const tahun = parseInt(req.query.tahun as string);
        try {
            const validData: any = validate(
                { tahun },
                monitorFinancialJournalSchema,
            );
            const monitorBalanceSheetApplicationService =
                new MonitorBalanceSheetApplicationService(this.eventBus);
            const balanceSheet =
                await monitorBalanceSheetApplicationService.retrieveBalanceSheetData(
                    validData.tahun,
                );
            logger.info("balance sheet has been successfully retrieved");
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                "Berhasil mendapatkan neraca keuangan",
                balanceSheet,
            );
        } catch (error) {
            logger.error("failed to get balance sheet");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
