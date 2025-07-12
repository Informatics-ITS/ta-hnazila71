import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../../shared/middleware";
import { EventBus } from "../../../../shared/util";
import { FundApplicationModel } from "../infrastructure/migration";
import { FundApplicationQueryHandler } from "../infrastructure/storage/query";
import { FundApplicationRepository } from "../infrastructure/storage/repository";
import { FundApplicationController } from "./controller";

export const setFundApplicationRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["pengajuan_dana"] = FundApplicationModel;
    const fundApplicationRepository = new FundApplicationRepository(dbConn);
    const fundApplicationQuery = new FundApplicationQueryHandler(dbConn);
    const fundApplicationController = new FundApplicationController(
        fundApplicationRepository,
        fundApplicationQuery,
        eventBus,
    );
    const fundApplicationRouter = express.Router();

    fundApplicationRouter.use(middlewareAuthentication);

    fundApplicationRouter.post(
        "",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundApplicationController.inputFundApplication.bind(
                fundApplicationController,
            ),
        ),
    );

    fundApplicationRouter.get(
        "",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            fundApplicationController.viewAllFundApplications.bind(
                fundApplicationController,
            ),
        ),
    );

    fundApplicationRouter.put(
        "/:id",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundApplicationController.updateFundApplication.bind(
                fundApplicationController,
            ),
        ),
    );

    fundApplicationRouter.delete(
        "/:id",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            fundApplicationController.deleteFundApplication.bind(
                fundApplicationController,
            ),
        ),
    );

    return fundApplicationRouter;
};
