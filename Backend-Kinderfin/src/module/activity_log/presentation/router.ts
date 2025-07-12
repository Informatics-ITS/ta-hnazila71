import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";
import { ActivityLogController } from "./controller/activity_log.controller";

// --- START: Tambahkan Import Model yang Dibutuhkan ---
import { ActivityLog } from '../domain/entity/log.entity'; // Import model ActivityLog
import { UserModel } from '../../user/infrastructure/migration/user-table'; // Import UserModel untuk asosiasi
// --- END: Tambahkan Import Model yang Dibutuhkan ---


export function setActivityLogRoutes(app: any, dbConn: Sequelize, eventBus: EventBus) {
  const router = Router();
  const controller = new ActivityLogController();

  // --- START: Pastikan Model Terdaftar dan Definisikan Asosiasi ---
  // Pastikan model ActivityLog terdaftar dengan instance dbConn ini
  // (Jika ActivityLog.ts sudah menggunakan instance dbConn yang sama, baris ini mungkin tidak mutlak diperlukan,
  // tetapi ini memastikan model dikenal oleh instance dbConn yang sedang digunakan di sini)
  dbConn.models["activity_logs"] = ActivityLog;
  dbConn.models["user"] = UserModel; // Pastikan UserModel juga terdaftar di instance dbConn ini

  // Asosiasi untuk user_id
  dbConn.models["user"].hasMany(dbConn.models["activity_logs"], {
    foreignKey: {
      name: "user_id", // Ini adalah kolom FK di tabel 'activity_logs'
      allowNull: false,
    },
    sourceKey: "id", // Ini adalah kolom Primary Key di tabel 'users'
  });
  dbConn.models["activity_logs"].belongsTo(dbConn.models["user"], {
    foreignKey: {
      name: "user_id", // Ini adalah kolom FK di tabel 'activity_logs'
      allowNull: false,
    },
    targetKey: "id", // Ini adalah kolom Primary Key di tabel 'users'
  });

  
  dbConn.models["user"].hasMany(dbConn.models["activity_logs"], {
    foreignKey: {
      name: "email", // Ini adalah kolom FK di tabel 'activity_logs'
      allowNull: false,
    },
    sourceKey: "email", // Ini adalah kolom UNIQUE di tabel 'users'
  });
  dbConn.models["activity_logs"].belongsTo(dbConn.models["user"], {
    foreignKey: {
      name: "email", // Ini adalah kolom FK di tabel 'activity_logs'
      allowNull: false,
    },
    targetKey: "email", // Ini adalah kolom UNIQUE di tabel 'users'
  });


  router.use(middlewareAuthentication);

  router.get("/", restrictedTo("Admin", "Bendahara"), controller.findAll.bind(controller));

  router.post("/", restrictedTo("Admin", "Bendahara"), controller.create.bind(controller));

  app.use("/api/v1/activity-log", router);

  return router;
}