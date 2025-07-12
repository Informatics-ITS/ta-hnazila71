import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import {
    middlewareAuthentication,
    restrictedTo,
    uploader,
} from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { SiswaModel, DokumenModel } from "../infrastructure/migration";
import {
    DokumenRepository,
    SiswaRepository,
} from "../infrastructure/storage/repository";
import { SiswaQueryHandler } from "../infrastructure/storage/query";
import { SiswaController } from "./controller/siswa.controller";
import { PPDBModel } from "../../ppdb/infrastructure/migration";

export const setSiswaRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
    dbConn.models["students"] = SiswaModel;
    dbConn.models["documents"] = DokumenModel;
    dbConn.models["ppdb"] = PPDBModel;
    dbConn.models["students"].belongsTo(dbConn.models["documents"], {
        foreignKey: {
            name: "id_dokumen",
            allowNull: false,
        },
        as: "document",
    });
    dbConn.models["documents"].belongsTo(dbConn.models["ppdb"], {
        foreignKey: {
            name: "ppdb_id",
            allowNull: true,
        },
        as: "ppdb",
    });
    dbConn.models["students"].belongsTo(dbConn.models["ppdb"], {
        foreignKey: {
            name: "id_ppdb",
            allowNull: true,
        },
    });

    dbConn.models["students"].belongsTo(dbConn.models["user"], {
        foreignKey: "id_orang_tua", 
    });

    dbConn.models["user"].hasMany(dbConn.models["students"], {
        foreignKey: "id_orang_tua", 
        sourceKey: "id_informasi_tambahan", 
    });

    dbConn.models["documents"].hasMany(dbConn.models["students"], {
        foreignKey: {
            name: "id_dokumen",
            allowNull: false,
        },
    });

    const siswaRepository = new SiswaRepository(dbConn);
    const dokumenRepository = new DokumenRepository(dbConn);
    const siswaQuery = new SiswaQueryHandler(dbConn);
    const siswaController = new SiswaController(
        siswaRepository,
        dokumenRepository,
        eventBus,
        siswaQuery,
    );
    const siswaRouter = express.Router();

    siswaRouter.use(middlewareAuthentication);
    siswaRouter.post(
        "/add",
        uploader.fields([
            { name: "akta_kelahiran", maxCount: 1 },
            { name: "kartu_keluarga", maxCount: 1 },
        ]),
        restrictedTo("Orang Tua"),
        expressAsyncHandler(siswaController.addSiswa.bind(siswaController)),
    );

    siswaRouter.get(
        "/all",
        // restrictedTo("Orang Tua"),
        expressAsyncHandler(siswaController.getAllSiswa.bind(siswaController)),
    );

    return siswaRouter;
};
