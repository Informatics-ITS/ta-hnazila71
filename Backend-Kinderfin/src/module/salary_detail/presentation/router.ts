import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import SalaryDetailController from "./controller/salary_detail.controller";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import MySalaryDetailController from "./controller/my_salary_detail.controller";
import { restrictedTo } from "../../../shared/middleware/authorization";
import uploadRouter from "../uploads/upload.controller";
import FingerspotController from "./controller/fingerspot.controller";

import { SalaryDetail } from '../domain/entity/salary_detail.entity'; // Asumsi path ini benar
import { GuruModel } from '../../user/infrastructure/migration/guru-table'; // Import GuruModel (teachers)
import { MasterJabatan } from '../../master_jabatan/domain/entity/master_jabatan.entity'; // Asumsi path ini benar

export function setSalaryDetailRoutes(app: any, dbConn: Sequelize, eventBus: EventBus) {
  const router = Router();

  dbConn.models["detail_salary"] = SalaryDetail;
  dbConn.models["teachers"] = GuruModel;
  dbConn.models["master_jabatan"] = MasterJabatan;

  // Asosiasi DetailSalary ke Teachers (melalui teacher_id)
  dbConn.models["teachers"].hasMany(dbConn.models["detail_salary"], {
    foreignKey: {
      name: "teacher_id",
      allowNull: false,
    },
    sourceKey: "id",
  });
  dbConn.models["detail_salary"].belongsTo(dbConn.models["teachers"], {
    foreignKey: {
      name: "teacher_id",
      allowNull: false,
    },
    targetKey: "id",
  });

  // Asosiasi DetailSalary ke MasterJabatan (melalui jabatan)
  dbConn.models["master_jabatan"].hasMany(dbConn.models["detail_salary"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    sourceKey: "jabatan",
  });
  dbConn.models["detail_salary"].belongsTo(dbConn.models["master_jabatan"], {
    foreignKey: {
      name: "jabatan",
      allowNull: false,
    },
    targetKey: "jabatan",
  });

  router.use(middlewareAuthentication);

  router.use("/upload", uploadRouter);

  router.post("/manual", SalaryDetailController.manualInput);

  router.get("/my-salary-detail", restrictedTo("Guru", "Admin", "Sekretaris", "Bendahara"), MySalaryDetailController.getMySalaryDetail);
  
  router.get("/:nip", restrictedTo("Admin", "Bendahara"), SalaryDetailController.getAllSalaryByTeacher);

  router.get("/:nip/:bulan", restrictedTo("Admin", "Bendahara"), SalaryDetailController.getMonthlySalaryByTeacher);

  router.delete("/:nip/:tanggal", restrictedTo("Admin", "Bendahara"), SalaryDetailController.removeSalary);

  router.post("/salary/final/pdf", SalaryDetailController.generateFinalPdf);
  
  router.post("/fingerspot/process", restrictedTo("Admin", "Bendahara"), FingerspotController.processAttendanceData);
  router.post("/fingerspot/fetch", restrictedTo("Admin", "Bendahara"), FingerspotController.fetchAndProcessAttendance);

  app.use("/api/v1/salary-detail", router);
  return router;
}
