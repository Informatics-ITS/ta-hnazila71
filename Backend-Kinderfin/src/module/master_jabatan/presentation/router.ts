import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import MasterJabatanController from "./controller/master_jabatan.controller";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";

import { MasterJabatan } from '../domain/entity/master_jabatan.entity';
import { MasterJabatanPokok } from '../domain/entity/master_jabatan_pokok.entity';
import { GuruModel } from '../../user/infrastructure/migration/guru-table';

export function setMasterJabatanRoutes(app: any, dbConn: Sequelize, eventBus: EventBus) {
  const router = Router();

  dbConn.models["master_jabatan"] = MasterJabatan;
  dbConn.models["master_jabatan_pokok_fk"] = MasterJabatanPokok;
  dbConn.models["teachers"] = GuruModel;

  dbConn.models["master_jabatan"].hasMany(dbConn.models["master_jabatan_pokok_fk"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    sourceKey: "jabatan",
  });

  dbConn.models["master_jabatan_pokok_fk"].belongsTo(dbConn.models["master_jabatan"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    targetKey: "jabatan",
  });

  dbConn.models["master_jabatan"].hasMany(dbConn.models["teachers"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    sourceKey: "jabatan",
    as: "guruTerkait",
  });

  dbConn.models["teachers"].belongsTo(dbConn.models["master_jabatan"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    targetKey: "jabatan",
    as: "detailJabatan",
  });

  router.use(middlewareAuthentication);

  router.get("/", restrictedTo("Admin", "Bendahara", "Sekretaris"), MasterJabatanController.getAll);
  router.get("/:jabatan", restrictedTo("Admin", "Bendahara", "Guru"), MasterJabatanController.getByJabatan);
  router.post("/", restrictedTo("Admin", "Bendahara"), MasterJabatanController.createFull);
  router.put("/:jabatan", restrictedTo("Admin", "Bendahara"), MasterJabatanController.update);
  router.delete("/:jabatan", restrictedTo("Admin", "Bendahara"), MasterJabatanController.delete);

  app.use("/api/v1/master-jabatan", router);
  return router;
}