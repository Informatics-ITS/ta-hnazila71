import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import { middlewareAuthentication, restrictedTo } from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { RumahTanggaModel } from "../infrastructure/migration";
import { RumahTanggaQueryHandler } from "../infrastructure/storage/query";
import { RumahTanggaRepository } from "../infrastructure/storage/repository"; 
import { RumahTanggaController } from "./controller";

export const setRumahTanggaRoutes = (
    dbConn: Sequelize,
    eventBus: EventBus,
): Router => {
  dbConn.models["pengeluaran_rumah_tangga"] = RumahTanggaModel;
  dbConn.models["pengeluaran_rumah_tangga"].belongsTo(dbConn.models["user"], {
    foreignKey: {
      name: "id_user",
      allowNull: false,
    },
  });

  dbConn.models["user"].hasMany(dbConn.models["pengeluaran_rumah_tangga"], {
    foreignKey: {
      name: "id_user",
      allowNull: false,
    },
  });
    const rumahTanggaRepository = new RumahTanggaRepository(dbConn);
    const rumahTanggaQuery = new RumahTanggaQueryHandler(dbConn);
    const rumahTanggaController = new RumahTanggaController(
        rumahTanggaRepository,
        rumahTanggaQuery,
        eventBus,
    );
  const rumahTanggaRouter = express.Router();
  
  rumahTanggaRouter.use(middlewareAuthentication);
  
    rumahTanggaRouter.get(
      "",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(rumahTanggaController.getAllRumahTangga.bind(rumahTanggaController)),
    );

    rumahTanggaRouter.post(
      "/add",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(rumahTanggaController.addRumahTangga.bind(rumahTanggaController)),
    );

    rumahTanggaRouter.put(
      "/:id",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(rumahTanggaController.updateRumahTangga.bind(rumahTanggaController)),
    );

    rumahTanggaRouter.delete(
      "/:id",
      restrictedTo("Kepala Sekolah", "Admin", "Sekretaris", "Bendahara"),
        expressAsyncHandler(rumahTanggaController.deleteRumahTangga.bind(rumahTanggaController)),
    );

    return rumahTanggaRouter;
};