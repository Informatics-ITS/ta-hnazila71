import { Router } from "express";
import { Sequelize } from "sequelize";
import { EventBus } from "../../../shared/util";
import PengaturanGajiAktifController from "./controller/pengaturan_gaji_aktif.controller";
import { middlewareAuthentication } from "../../../shared/middleware/authentication";
import { restrictedTo } from "../../../shared/middleware/authorization";

export function setPengaturanGajiAktifRoutes(app: any, dbConn: Sequelize, eventBus: EventBus) {
  const router = Router();

  router.use(middlewareAuthentication);

  router.get("/", restrictedTo("Admin", "Bendahara", "Kepala Sekolah", "Guru"), PengaturanGajiAktifController.get);
  router.post("/", restrictedTo("Admin", "Bendahara", "Kepala Sekolah"), PengaturanGajiAktifController.save);
  router.delete("/:field", restrictedTo("Admin", "Bendahara", "Kepala Sekolah"), PengaturanGajiAktifController.delete);

  app.use("/api/v1/pengaturan-gaji-aktif", router);
  return router;
}
