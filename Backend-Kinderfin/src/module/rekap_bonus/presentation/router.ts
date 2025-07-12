import { Router } from "express";
import { Sequelize } from "sequelize";
import RekapBonusController from "./controller/rekap_bonus.controller";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";

import { GuruModel } from '../../user/infrastructure/migration/guru-table'; // Ini adalah model untuk tabel 'teachers'
import { RekapBonus } from '../domain/entity/rekap_bonus.entity';

export function setRekapBonusRoutes(app: any, dbConn: Sequelize) {
  const router = Router();

  // Pastikan model terdaftar di instance Sequelize
  dbConn.models["rekap_bonus"] = RekapBonus;
  dbConn.models["teachers"] = GuruModel;

  // Mendefinisikan asosiasi antara RekapBonus dan Teachers
  // RekapBonus (anak) memiliki teacher_id yang merujuk ke id (PK) di Teachers (induk)
  dbConn.models["teachers"].hasMany(dbConn.models["rekap_bonus"], {
    foreignKey: {
      name: "teacher_id", // Nama kolom FK di tabel rekap_bonus
      allowNull: false,
    },
    sourceKey: "id", // Kolom PK di tabel teachers yang menjadi target FK
    as: "rekapBonus", // Alias untuk asosiasi (opsional, tapi disarankan)
  });

  dbConn.models["rekap_bonus"].belongsTo(dbConn.models["teachers"], {
    foreignKey: {
      name: "teacher_id", // Nama kolom FK di tabel rekap_bonus
      allowNull: false,
    },
    targetKey: "id", // Kolom PK di tabel teachers yang menjadi target FK
    as: "teacher", // Alias untuk asosiasi (opsional, tapi disarankan)
  });


  router.use(middlewareAuthentication);

  router.post("/", restrictedTo("Admin", "Bendahara", "Kepala Sekolah"), RekapBonusController.create);
  // Mengubah parameter rute agar jelas menerima 'nip'
  router.get("/:nip", restrictedTo("Admin", "Bendahara", "Guru"), RekapBonusController.getByNip); // Mengubah parameter rute dari :teacherId ke :nip

  app.use("/api/v1/rekap-bonus", router);
  return router;
}