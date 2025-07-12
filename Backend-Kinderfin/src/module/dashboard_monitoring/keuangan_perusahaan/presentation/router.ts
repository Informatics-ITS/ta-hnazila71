import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../../shared/middleware";
import { EventBus } from "../../../../shared/util";
import { FinancialJournalController } from "./controller";

export const setFinancialJournalRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    const financialJournalController = new FinancialJournalController(eventBus);
    const financialJournalRouter = express.Router();

    financialJournalRouter.use(middlewareAuthentication);

    financialJournalRouter.get(
        "/cash-flow",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            financialJournalController.monitorCashFlowStatistic.bind(
                financialJournalController,
            ),
        ),
    );

    financialJournalRouter.get(
        "/balance-sheet",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            financialJournalController.monitorBalanceSheet.bind(
                financialJournalController,
            ),
        ),
    );

    return financialJournalRouter;
};
