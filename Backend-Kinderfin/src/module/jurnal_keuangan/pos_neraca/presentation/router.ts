import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../../shared/middleware";
import { EventBus } from "../../../../shared/util";
import { BalanceSheetPostModel } from "../infrastructure/migration";
import { BalanceSheetPostQueryHandler } from "../infrastructure/storage/query";
import { BalanceSheetPostRepository } from "../infrastructure/storage/repository";
import { BalanceSheetPostController } from "./controller";

export const setBalanceSheetPostRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["pos_neraca"] = BalanceSheetPostModel;
    const balanceSheetPostRepository = new BalanceSheetPostRepository(dbConn);
    const balanceSheetPostQuery = new BalanceSheetPostQueryHandler(dbConn);
    const balanceSheetPostController = new BalanceSheetPostController(
        balanceSheetPostRepository,
        balanceSheetPostQuery,
        eventBus,
    );
    const balanceSheetPostRouter = express.Router();

    balanceSheetPostRouter.use(middlewareAuthentication);

    balanceSheetPostRouter.post(
        "",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            balanceSheetPostController.inputBalanceSheetPost.bind(
                balanceSheetPostController,
            ),
        ),
    );

    balanceSheetPostRouter.get(
        "",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            balanceSheetPostController.viewAllBalanceSheetPosts.bind(
                balanceSheetPostController,
            ),
        ),
    );

    balanceSheetPostRouter.put(
        "/:id",
        restrictedTo("Administrator Keuangan"),
        expressAsyncHandler(
            balanceSheetPostController.updateBalanceSheetPost.bind(
                balanceSheetPostController,
            ),
        ),
    );

    return balanceSheetPostRouter;
};
