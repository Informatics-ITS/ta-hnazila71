import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { EventBus, buildResponseError, buildResponseSuccess, logger, validate } from "../../../../shared/util";
import { AddSiswaCommand, AddSiswaCommandHandler, UploadDokumenCommandHandler } from "../../application/command";
import { ISiswaRepository } from "../../domain/repository/siswa.repository";
import { addSiswaMapper } from "../mapper";
import { FileService } from "../../../pembayaran/infrastructure/service";
import ImageKit from "imagekit";
import { IFileService } from "../../../pembayaran/application/service";
import { IDokumenRepository } from "../../domain/repository";
import { DokumenEntity, DokumenProps } from "../../domain/entity";
import { url } from "inspector";
const imagekit = appConfig.get("/imagekit");

import { ISiswaQueryHandler } from "../../application/query";
import { getAllSiswaMapper } from "../mapper";

export class SiswaController {
  private readonly fileService: IFileService;

  constructor(
    private readonly siswaRepository: ISiswaRepository,
    private readonly dokumenRepository: IDokumenRepository,
    private readonly eventBus: EventBus,
    private readonly siswaQueryHandler: ISiswaQueryHandler,
  ) { 
    this.eventBus.subscribe(
      "AllStudentsDataRequested",
      this.getAllStudents.bind(this),
    )
    this.fileService = new FileService(
      new ImageKit({
        publicKey: imagekit.publicKey,
        privateKey: imagekit.privateKey,
        urlEndpoint: imagekit.urlEndpoint,
      }),
    );
  }

  
  async addSiswa(req: Request, res: Response): Promise<void> {
    const { body } = req;
    const orang_tua_id = res.locals.id_user;
    if (req.files && !Array.isArray(req.files)) {
      body["akta_kelahiran"] = req.files["akta_kelahiran"]?.[0].path;
      body["kartu_keluarga"] = req.files["kartu_keluarga"]?.[0].path;
    }
    try {
      const validData = validate({...body, id_orang_tua: orang_tua_id, akta_kelahiran: "", kartu_keluarga: ""}, addSiswaMapper) as AddSiswaCommand;
      const addSiswaCommandHandler = new AddSiswaCommandHandler(
        this.siswaRepository
      );
      const addDokumenCommandHandler = new UploadDokumenCommandHandler(
        this.fileService,
        this.dokumenRepository,
        this.eventBus
      );

      let dokumen: DokumenEntity<DokumenProps>;
      if (req.files && !Array.isArray(req.files)) {
        dokumen = await addDokumenCommandHandler.execute({
          akta_kelahiran: req.files["akta_kelahiran"]?.[0],
          kartu_keluarga: req.files["kartu_keluarga"]?.[0],
        });
      } else {
        throw new Error("Invalid files format");
      }
      await addSiswaCommandHandler.execute(
        { 
          nama_lengkap: validData.nama_lengkap, tanggal_lahir: validData.tanggal_lahir, alamat: validData.alamat, jenis_kelamin: validData.jenis_kelamin, id_orang_tua: validData.id_orang_tua
          , akta_kelahiran: dokumen?.getUrlAktaKelahiran() ?? '', kartu_keluarga: dokumen?.getUrlKartuKeluarga() ?? ''
        }
      );
      logger.info("SiswaController - addSiswa: Siswa added successfully");
      buildResponseSuccess(
        res,
        StatusCodes.CREATED,
        DefaultMessage.SUC_ADD
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      logger.error(`SiswaController - addSiswa: ${appErr.message}`);
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getAllStudents(event: any): Promise<void> {
    try {
      const students = await this.siswaRepository.getAllStudents(event);
      logger.info("SiswaController - getAllStudents: Students data retrieved successfully", students);
      this.eventBus.publish("AllStudentsDataRetrieved", {
        data: {
          status: "success",
          students,
        },
        eventName: "AllStudentsDataRetrieved",
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      this.eventBus.publish("AllStudentsDataRetrieved", {
          data: {
              status: "error",
              code: appErr.code,
              message: appErr.message,
          },
          eventName: "AllStudentsDataRetrieved",
      });
      logger.error("failed to get student data");
    }
  }
  async getAllSiswa(req: Request, res: Response): Promise<void> {
    try {
      const siswas = await this.siswaRepository.getAllSiswa();
      const mappedSiswas = getAllSiswaMapper(siswas);
      logger.info("SiswaController - getAllSiswa: Siswa retrieved successfully");
      buildResponseSuccess(
        res,
        StatusCodes.OK,
        DefaultMessage.SUC_AGET,
        mappedSiswas
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      logger.error(`SiswaController - getAllSiswa: ${appErr.message}`);
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
  
}