import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";
import { PotonganController } from "./controller/potongan.controller";

import { PotonganKeterlambatan } from '../domain/entity/potongan.entity'; // Asumsi path ini benar
import { MasterJabatan } from '../../master_jabatan/domain/entity/master_jabatan.entity'; // Asumsi path ini benar

export function setPotonganRoutes(app: any, dbConn: Sequelize, eventBus: EventBus) {
  const router = Router();
  const controller = new PotonganController();

  dbConn.models["potongan_keterlambatan"] = PotonganKeterlambatan;
  dbConn.models["master_jabatan"] = MasterJabatan;

  dbConn.models["master_jabatan"].hasMany(dbConn.models["potongan_keterlambatan"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    sourceKey: "jabatan",
  });
  dbConn.models["potongan_keterlambatan"].belongsTo(dbConn.models["master_jabatan"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    targetKey: "jabatan",
  });

  router.use(middlewareAuthentication);

  router.post("/", restrictedTo("Admin", "Bendahara"), controller.create.bind(controller));

  router.get("/", restrictedTo("Admin", "Bendahara"), controller.findAll.bind(controller));

  router.get("/:id", restrictedTo("Admin", "Bendahara"), controller.findById.bind(controller));

  router.delete("/:id", restrictedTo("Admin", "Bendahara"), controller.delete.bind(controller));

  app.use("/api/v1/potongan-keterlambatan", router);
  return router;
}
