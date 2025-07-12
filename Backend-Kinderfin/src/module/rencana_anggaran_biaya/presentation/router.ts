import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { BudgetEstimatePlanModel } from "../infrastructure/migration";
import { BudgetEstimatePlanQueryHandler } from "../infrastructure/storage/query";
import { BudgetEstimatePlanRepository } from "../infrastructure/storage/repository";
import { BudgetEstimatePlanController } from "./controller";

export const setBudgetEstimatePlanRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["rencana_anggaran_biaya"] = BudgetEstimatePlanModel;
    const budgetEstimatePlanRepository = new BudgetEstimatePlanRepository(
        dbConn,
    );
    const budgetEstimatePlanQuery = new BudgetEstimatePlanQueryHandler(dbConn);
    const budgetEstimatePlanController = new BudgetEstimatePlanController(
        budgetEstimatePlanRepository,
        budgetEstimatePlanQuery,
        eventBus,
    );
    const budgetEstimatePlanRouter = express.Router();

    budgetEstimatePlanRouter.use(middlewareAuthentication);

    budgetEstimatePlanRouter.post(
        "/generate",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            budgetEstimatePlanController.generateBudgetEstimatePlans.bind(
                budgetEstimatePlanController,
            ),
        ),
    );

    budgetEstimatePlanRouter.get(
        "",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            budgetEstimatePlanController.viewAllBudgetEstimatePlans.bind(
                budgetEstimatePlanController,
            ),
        ),
    );

    return budgetEstimatePlanRouter;
};
