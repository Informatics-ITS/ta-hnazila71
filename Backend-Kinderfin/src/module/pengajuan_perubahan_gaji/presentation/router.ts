// router.ts
import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import PengajuanPerubahanGajiController from "./controller/pengajuan_perubahan_gaji.controller";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";
import { uploadPengajuan } from "../middleware/upload.middleware";
import { PostgresDatabase } from "../../../config/database.config";
import { QueryTypes } from "sequelize";
import { injectNip } from "../../../shared/middleware/injectNip.middleware";

import { PengajuanPerubahanGaji } from '../domain/entity/pengajuan_perubahan_gaji.entity';
import { UserModel } from '../../user/infrastructure/migration/user-table'; // Pastikan UserModel memiliki 'id' sebagai PK

const dbConn = new PostgresDatabase().dbConn;

export function setPengajuanPerubahanGajiRoutes(app: any, db: Sequelize, eventBus: EventBus) {
  const router = Router();

  db.models["pengajuan_perubahan_gaji"] = PengajuanPerubahanGaji;
  db.models["user"] = UserModel;

  db.models["user"].hasMany(db.models["pengajuan_perubahan_gaji"], {
    foreignKey: {
      name: "user_id", 
      allowNull: false,
    },
    sourceKey: "id", // Merujuk ke PK 'id' di tabel users (diubah dari 'email')
    as: "pengajuanPerubahan", // Alias untuk asosiasi
  });

  // PengajuanPerubahanGaji (anak) dimiliki oleh satu UserModel (induk)
  db.models["pengajuan_perubahan_gaji"].belongsTo(db.models["user"], {
    foreignKey: {
      name: "user_id", // Nama kolom FK di tabel pengajuan_perubahan_gaji (diubah dari 'email')
      allowNull: false,
    },
    targetKey: "id", // Merujuk ke PK 'id' di tabel users (diubah dari 'email')
    as: "pengaju", // Alias untuk asosiasi
  });

  router.use(middlewareAuthentication);

  router.post(
    "/",
    restrictedTo("Guru", "Admin", "Bendahara", "Kepala Sekolah"),
    injectNip,
    uploadPengajuan.fields([
      { name: "foto_bukti", maxCount: 1 },
      { name: "foto_gaji", maxCount: 1 },
    ]),
    PengajuanPerubahanGajiController.ajukan
  );

  router.get(
    "/",
    restrictedTo("Guru", "Admin", "Bendahara", "Kepala Sekolah"),
    PengajuanPerubahanGajiController.getAll
  );
  
  router.patch(
    "/:id/status",
    restrictedTo("Admin", "Bendahara", "Kepala Sekolah"),
    PengajuanPerubahanGajiController.updateStatus
  );

  app.use("/api/v1/pengajuan-perubahan-gaji", router);
  return router;
}