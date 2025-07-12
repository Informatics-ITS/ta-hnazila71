import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../../shared/middleware";
import { EventBus } from "../../../../shared/util";
import { FundUsageModel } from "../infrastructure/migration";
import { FundUsageQueryHandler } from "../infrastructure/storage/query";
import { FundUsageRepository } from "../infrastructure/storage/repository";
import { FundUsageController } from "./controller";

export const setFundUsageRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["penggunaan_dana"] = FundUsageModel;
    const fundUsageRepository = new FundUsageRepository(dbConn);
    const fundUsageQuery = new FundUsageQueryHandler(dbConn);
    const fundUsageController = new FundUsageController(
        fundUsageRepository,
        fundUsageQuery,
        eventBus,
    );
    const fundUsageRouter = express.Router();

    fundUsageRouter.use(middlewareAuthentication);

    fundUsageRouter.post(
        "",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundUsageController.reportFundUsage.bind(fundUsageController),
        ),
    );

    fundUsageRouter.get(
        "",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            fundUsageController.viewAllFundUsages.bind(fundUsageController),
        ),
    );

    fundUsageRouter.put(
        "/:id",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundUsageController.updateFundUsage.bind(fundUsageController),
        ),
    );

    fundUsageRouter.delete(
        "/:id",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundUsageController.deleteFundUsage.bind(fundUsageController),
        ),
    );

    return fundUsageRouter;
};
