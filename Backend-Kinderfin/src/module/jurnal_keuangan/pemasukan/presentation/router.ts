import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import { middlewareAuthentication, restrictedTo } from "../../../../shared/middleware";
import { EventBus } from "../../../../shared/util";
import { PemasukanModel } from "../infrastructure/migration";
import { PemasukanQueryHandler } from "../infrastructure/storage/query";
import { PemasukanRepository } from "../infrastructure/storage/repository";
import { PemasukanController } from "./controller";

export const setPemasukanRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
  dbConn.models["pemasukan"] = PemasukanModel;
  dbConn.models["pemasukan"].belongsTo(dbConn.models["user"], {
    foreignKey: {
      name: "id_user",
      allowNull: false,
    },
  });

  dbConn.models["user"].hasMany(dbConn.models["pemasukan"], {
    foreignKey: {
      name: "id_user",
      allowNull: false,
    },
  });
    const pemasukanRepository = new PemasukanRepository(dbConn);
    const pemasukanQuery = new PemasukanQueryHandler(dbConn);
    const pemasukanController = new PemasukanController(
        pemasukanRepository,
        pemasukanQuery,
        eventBus,
    );
  const pemasukanRouter = express.Router();
  
  pemasukanRouter.use(middlewareAuthentication);
  
    pemasukanRouter.get(
      "",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(pemasukanController.getAllPemasukan.bind(pemasukanController)),
    );

    pemasukanRouter.post(
      "/add",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(pemasukanController.addPemasukan.bind(pemasukanController)),
    );

    pemasukanRouter.put(
      "/:id",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(pemasukanController.updatePemasukan.bind(pemasukanController)),
    );

    pemasukanRouter.delete(
      "/:id",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(pemasukanController.deletePemasukan.bind(pemasukanController)),
    );

    return pemasukanRouter;
};