import express, { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { Sequelize } from "sequelize";
import { middlewareAuthentication, restrictedTo, uploader } from "../../../shared/middleware";
import { EventBus } from "../../../shared/util";
import { PPDBModel } from "../infrastructure/migration";
import { DaftarUlangModel } from "../../pembayaran/infrastructure/migration";
import { PPDBRepository } from "../infrastructure/storage/repository/ppdb.repository";
import { PPDBController } from "./controller";
import { DokumenRepository } from "../../siswa/infrastructure/storage/repository";

export const setPPDBRoutes = (
  dbConn: Sequelize,
  eventBus: EventBus,
): Router => {
  dbConn.models["ppdb"] = PPDBModel;
  dbConn.models["ppdb"].belongsTo(dbConn.models["user"], {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
  });
  
  dbConn.models["user"].hasMany(dbConn.models["ppdb"], {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
  });

  // dbConn.models["daftar_ulang"] = DaftarUlangModel;
  // dbConn.models["ppdb"].hasMany(dbConn.models["daftar_ulang"], {
  //   foreignKey: {
  //     name: "ppdb_id",
  //     allowNull: false,
  //   },
  // });

  // dbConn.models["daftar_ulang"].belongsTo(dbConn.models["ppdb"], {
  //   foreignKey: {
  //     name: "ppdb_id",
  //     allowNull: false,
  //   },
  // });

  const ppdbRepository = new PPDBRepository(dbConn);
  const dokumenRepository = new DokumenRepository(dbConn);
  const ppdbController = new PPDBController(ppdbRepository, dokumenRepository, eventBus);
  const ppdbRouter = express.Router();

  ppdbRouter.use(middlewareAuthentication);
  ppdbRouter.post(
    "/add",
    uploader.fields([
      { name: "akta_kelahiran", maxCount: 1 },
      { name: "kartu_keluarga", maxCount: 1 },
    ]),
    restrictedTo("Orang Tua"),
    expressAsyncHandler(ppdbController.addPPDB.bind(ppdbController)),
  );

  ppdbRouter.get(
    "/",
    restrictedTo("Orang Tua", "Admin", "Sekretaris"),
    expressAsyncHandler(ppdbController.getAllPPDBData.bind(ppdbController)),
  );

  ppdbRouter.get(
    "/orang-tua",
    restrictedTo("Orang Tua", "Admin"),
    expressAsyncHandler(ppdbController.getPPDBDataByUserID.bind(ppdbController)),
  );

  ppdbRouter.get(
    "/:id",
    restrictedTo("Admin", "Orang Tua"),
    expressAsyncHandler(ppdbController.getPPDBDataByID.bind(ppdbController)),
  );

  // update ppdb data by id
  ppdbRouter.put(
    "/:id",
    uploader.fields([
      { name: "akta_kelahiran", maxCount: 1 },
      { name: "kartu_keluarga", maxCount: 1 },
    ]),
    restrictedTo("Orang Tua", "Sekretaris", "Admin"),
    expressAsyncHandler(ppdbController.updatePPDBData.bind(ppdbController)),
  );        

  ppdbRouter.put(
    "/verifikasi/:id",
    restrictedTo("Bendahara", "Sekretaris", "Admin"),
    expressAsyncHandler(ppdbController.verifPPDBData.bind(ppdbController))
  )

  ppdbRouter.put(
    "/reject/:id",
    restrictedTo("Sekretaris", "Admin"),
    expressAsyncHandler(ppdbController.rejectPPDBData.bind(ppdbController))
  )

  // delete ppdb data by id
  ppdbRouter.delete(
    "/:id",
    restrictedTo("Admin", "Orang Tua", "Sekretaris"),
    expressAsyncHandler(ppdbController.deletePPDBData.bind(ppdbController)),
  );

  // get ppdb data by user id
  ppdbRouter.get(
    "/user/:user_id",
    restrictedTo("Admin"),
    expressAsyncHandler(ppdbController.getPPDBDataByUserID.bind(ppdbController)),
  );

  // get ppdb data by tahun ajaran
  ppdbRouter.get(
    "/tahun-ajaran/:tahun_ajaran",
    restrictedTo("Admin", "Sekretaris", "Bendahara"),
    expressAsyncHandler(ppdbController.getPPDBDataByTahunAjaran.bind(ppdbController)),
  );

  return ppdbRouter;
}