import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
} from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { MasterDataModel } from "../infrastructure/migration";
import { MasterDataQueryHandler } from "../infrastructure/storage/query";
import { MasterDataRepository } from "../infrastructure/storage/repository";
import { MasterDataController } from "./controller";

export const setMasterDataRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["master_data"] = MasterDataModel;
    const masterDataRepository = new MasterDataRepository(dbConn);
    const masterDataQuery = new MasterDataQueryHandler(dbConn);
    const masterDataController = new MasterDataController(
        masterDataRepository,
        masterDataQuery,
        eventBus,
    );
    const masterDataRouter = express.Router();

    masterDataRouter.get(
        "/jenis-pembayaran",
        expressAsyncHandler(
            masterDataController.viewAllMasterDatas.bind(masterDataController),
        ),
    );

    masterDataRouter.use(middlewareAuthentication);

    masterDataRouter.post(
        "/jenis-pembayaran",
        restrictedTo(
            "Manajer",
            "Administrator Keuangan",
            "Sekretaris",
            "Front Office",
            "Akademik",
        ),
        expressAsyncHandler(
            masterDataController.inputMasterData.bind(masterDataController),
        ),
    );

    masterDataRouter.put(
        "/jenis-pembayaran/:id",
        restrictedTo(
            "Manajer",
            "Administrator Keuangan",
            "Sekretaris",
            "Front Office",
            "Akademik",
        ),
        expressAsyncHandler(
            masterDataController.updateMasterData.bind(masterDataController),
        ),
    );

    masterDataRouter.delete(
        "/jenis-pembayaran/:id",
        restrictedTo(
            "Manajer",
            "Administrator Keuangan",
            "Sekretaris",
            "Front Office",
            "Akademik",
        ),
        expressAsyncHandler(
            masterDataController.deleteMasterData.bind(masterDataController),
        ),
    );

    masterDataRouter.post(
        "/:type",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            masterDataController.inputMasterData.bind(masterDataController),
        ),
    );

    masterDataRouter.get(
        "/:type",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            masterDataController.viewAllMasterDatas.bind(masterDataController),
        ),
    );

    masterDataRouter.put(
        "/:type/:id",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            masterDataController.updateMasterData.bind(masterDataController),
        ),
    );

    masterDataRouter.delete(
        "/:type/:id",
        restrictedTo("Manajer", "Administrator Keuangan", "Sekretaris"),
        expressAsyncHandler(
            masterDataController.deleteMasterData.bind(masterDataController),
        ),
    );

    return masterDataRouter;
};
