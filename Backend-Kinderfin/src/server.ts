import cors from "cors";
import path from "path";
import express, { Express, Request, Response, Router } from "express";
import helmet from "helmet";
import { Server } from "http";
import { PostgresDatabase, appConfig } from "./config";
import { setSalaryRoutes } from "./module/dashboard_monitoring/gaji/presentation/router";
import { setFinancialJournalRoutes } from "./module/dashboard_monitoring/keuangan_perusahaan/presentation/router";
import { setFundApplicationRoutes } from "./module/jurnal_keuangan/pengajuan_dana/presentation/router";
import { setFundUsageRoutes } from "./module/jurnal_keuangan/penggunaan_dana/presentation/router";
import { setBalanceSheetPostRoutes } from "./module/jurnal_keuangan/pos_neraca/presentation/router";
import { setMasterJabatanRoutes } from "./module/master_jabatan/presentation/router";
import { setActivityLogRoutes } from "./module/activity_log/presentation/router";
import { setSalaryDetailRoutes } from "./module/salary_detail/presentation/router";
import { setRekapBonusRoutes } from "./module/rekap_bonus/presentation/router";
import { setPotonganRoutes } from "./module/potongan_keterlambatan/presentation/router";
import { setPengajuanPerubahanGajiRoutes } from "./module/pengajuan_perubahan_gaji/presentation/router";
import { setMasterDataRoutes } from "./module/master_data/presentation/router";
import { setPaymentProofRoutes } from "./module/pembayaran/presentation/router";
import { setBudgetEstimatePlanRoutes } from "./module/rencana_anggaran_biaya/presentation/router";
import { setUserRoutes } from "./module/user/presentation/router";
import { setSiswaRoutes } from "./module/siswa/presentation/router";
import { setRumahTanggaRoutes } from "./module/pengeluaran_rumah_tangga/presentation/router";
import { setPPDBRoutes } from "./module/ppdb/presentation/router";
import { setPemasukanRoutes } from "./module/jurnal_keuangan/pemasukan/presentation/router";
import { setPengaturanGajiAktifRoutes } from "./module/pengaturan_gaji_aktif/presentation/router";


import {
  EventBus,
  buildResponseError,
  buildResponseSuccess,
  logger,
} from "./shared/util";

export class AppServer {
  app: Express;
  router: Router;
  port: number;
  pgDatabase: PostgresDatabase;
  eventBus: EventBus;

  constructor() {
    this.app = express();
    this.router = express.Router();
    this.port = appConfig.get("/serverPort");
    this.pgDatabase = new PostgresDatabase();
    this.eventBus = new EventBus();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({
      origin: 'https://fe-kinderfin-new2-oinx.vercel.app', 
      // origin: 'http://localhost:3001',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 200,
      credentials: true
    }));
    
    this.app.use(helmet());


    this.app.use(express.static("public", {
      setHeaders: (res, path) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    }));
    

    this.router.use("/users", setUserRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/gaji", setSalaryRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/pengeluaran-rumah-tangga", setRumahTanggaRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/pemasukan", setPemasukanRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/students", setSiswaRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/ppdb", setPPDBRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/master-datas", setMasterDataRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/payments", setPaymentProofRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/balance-sheet-posts", setBalanceSheetPostRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/fund-applications", setFundApplicationRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/fund-usages", setFundUsageRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/financial-journals", setFinancialJournalRoutes(this.pgDatabase.dbConn, this.eventBus));
    this.router.use("/budget-estimate-plans", setBudgetEstimatePlanRoutes(this.pgDatabase.dbConn, this.eventBus));
    setPengaturanGajiAktifRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);

    setSalaryDetailRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);
    setPotonganRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);
    setMasterJabatanRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);
    setActivityLogRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);
    setPengajuanPerubahanGajiRoutes(this.app, this.pgDatabase.dbConn, this.eventBus);
    setRekapBonusRoutes(this.app, this.pgDatabase.dbConn);

    this.router.get("/health-check", (req: Request, res: Response) => {
      buildResponseSuccess(res, 200, "Welcome to PIKTIFIN");
    });

    this.app.use("/api/v1", this.router);

    this.app.all("*", (req: Request, res: Response) => {
      buildResponseError(res, 404, "Route tidak ditemukan");
    });
  }

  gracefulShutdown(server: Server) {
    server.close(() => {
      (async () => {
        this.pgDatabase.disconnect();
        logger.info("Server is closed");
        process.exit(0);
      })();
    });
  }
}
