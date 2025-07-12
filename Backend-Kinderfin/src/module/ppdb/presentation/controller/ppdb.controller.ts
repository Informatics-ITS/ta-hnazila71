import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { FileService } from "../../../pembayaran/infrastructure/service";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import ImageKit from "imagekit";
import { IFileService } from "../../../pembayaran/application/service";
import { url } from "inspector";
import { IPPDBRepository } from "../../domain/repository";
import { AddPPDBCommand, AddPPDBCommandHandler } from "../../application/command";
import { UploadDokumenCommandHandler } from "../../../siswa/application/command";
import { IDokumenRepository } from "../../../siswa/domain/repository";
import { EventBus, validate, logger, buildResponseError, buildResponseSuccess } from "../../../../shared/util";
import { addPPDBMapper } from "../mapper";
import { DokumenEntity, DokumenProps } from "../../../siswa/domain/entity";
const imagekit = appConfig.get("/imagekit");

export class PPDBController {
  private readonly fileService: IFileService;

  constructor(
    private readonly ppdbRepository: IPPDBRepository,
    private readonly dokumenRepository: IDokumenRepository,
    private readonly eventBus: EventBus
  ) { 
    this.fileService = new FileService(
      new ImageKit({
        publicKey: imagekit.publicKey,
        privateKey: imagekit.privateKey,
        urlEndpoint: imagekit.urlEndpoint,
      }),
    );
  }

    async addPPDB(req: Request, res: Response): Promise<void> {
        const { body } = req;
        const user_id = res.locals.id_user;
        console.log("FILES", req.files);
        if (req.files && !Array.isArray(req.files)) {
            body["akta_kelahiran"] = req.files["akta_kelahiran"]?.[0].path;
            body["kartu_keluarga"] = req.files["kartu_keluarga"]?.[0].path;
        }
        try {
            const validData = validate(
                {
                    ...body,
                    user_id: user_id,
                    akta_kelahiran: "",
                    kartu_keluarga: "",
                },
                addPPDBMapper,
            ) as AddPPDBCommand;
 
            const addDokumenCommandHandler = new UploadDokumenCommandHandler(
                this.fileService,
                this.dokumenRepository,
                this.eventBus,
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

            const addPPDBCommandHandler = new AddPPDBCommandHandler(
                this.ppdbRepository,
            );
            const ppdbId = await addPPDBCommandHandler.execute({
                ...validData,
                url_file_akta: dokumen?.getUrlAktaKelahiran() as string,
                url_file_kk: dokumen?.getUrlKartuKeluarga() as string,
            });

            logger.info(
                "PPDB Controller - add ppdb siswa: Siswa added successfully",
            );
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            logger.error(`PPDB Controller - addPPDB: ${appErr.message}`);
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async updatePPDBData(req: Request, res: Response): Promise<void> {
        const { body } = req;
        const { id } = req.params;
        try {
            const existingPPDB = await this.ppdbRepository.getPPDBByID(id);
            if (!existingPPDB) {
                throw new ApplicationError(404, "Data PPDB tidak ditemukan");
            }

            if (req.files && !Array.isArray(req.files) && (req.files["akta_kelahiran"] || req.files["kartu_keluarga"])) {
                console.log("FILES", req.files);
                body["akta_kelahiran"] = req.files["akta_kelahiran"]?.[0].path;
                body["kartu_keluarga"] = req.files["kartu_keluarga"]?.[0].path;

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

                    body["url_file_akta"] = dokumen?.getUrlAktaKelahiran() as string;
                    body["url_file_kk"] = dokumen?.getUrlKartuKeluarga() as string;
                } else {
                    throw new Error("Invalid files format");
                }
            }

            await this.ppdbRepository.updatePPDB(
                id,
                {
                    ...body,
                }
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_UPDT
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async getAllPPDBData(req: Request, res: Response): Promise<void> {
        try {
            const ppdbData = await this.ppdbRepository.getAllPPDB();
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_GET,
                ppdbData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async getPPDBDataByID(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const ppdbData = await this.ppdbRepository.getPPDBByID(id);
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_GET,
                ppdbData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async getPPDBDataByUserID(req: Request, res: Response): Promise<void> {
        const user_id = res.locals.id_user;
        try {
            const ppdbData = await this.ppdbRepository.getPPDBByUserID(user_id);
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_GET,
                ppdbData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async getPPDBDataByTahunAjaran(req: Request, res: Response): Promise<void> {
        const { tahun_ajaran } = req.params;
        try {
            const ppdbData = await this.ppdbRepository.getPPDBByTahunAjaran(
                tahun_ajaran,
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_GET,
                ppdbData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deletePPDBData(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            await this.ppdbRepository.deletePPDB(id);
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async verifPPDBData(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const response = await this.ppdbRepository.verifPPDBData(id);
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT)
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async rejectPPDBData(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const response = await this.ppdbRepository.rejectPPDBData(id);
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT)
        } catch (error) {
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
    
    // async updatePPDBData(req: Request, res: Response): Promise<void> { 
    //     const { body } = req;
    //     const { id } = req.params;
    //     try {
    //         if (
    //             req.files &&
    //             !Array.isArray(req.files) &&
    //             (req.files["akta_kelahiran"] || req.files["kartu_keluarga"])
    //         ) {
    //             console.log("FILES", req.files);
    //             if (req.files["akta_kelahiran"]) {
    //                 body["akta_kelahiran"] = req.files["akta_kelahiran"]?.[0]?.path;
    //             }
    //             if (req.files["kartu_keluarga"]) {
    //                 body["kartu_keluarga"] = req.files["kartu_keluarga"]?.[0]?.path;
    //             }
    
    //             const addDokumenCommandHandler = new UploadDokumenCommandHandler(
    //                 this.fileService,
    //                 this.dokumenRepository,
    //                 this.eventBus
    //             );
    
    //             let dokumen: DokumenEntity<DokumenProps>;
    //             if (req.files && !Array.isArray(req.files)) {
    //                 dokumen = await addDokumenCommandHandler.execute({
    //                     akta_kelahiran: req.files["akta_kelahiran"]?.[0] || null,
    //                     kartu_keluarga: req.files["kartu_keluarga"]?.[0] || null,
    //                 });
    
    //                 if (dokumen?.getUrlAktaKelahiran()) {
    //                     body["url_file_akta"] = dokumen?.getUrlAktaKelahiran() as string;
    //                     // console.log("URL AKTA NI BOSSS", dokumen?.getUrlAktaKelahiran());
    //                 }
    //                 if (dokumen?.getUrlKartuKeluarga()) {
    //                     body["url_file_kk"] = dokumen?.getUrlKartuKeluarga() as string;
    //                 }
    //                 console.log("DOKUMEN", dokumen);
    
    //                 const existingDokumen = await this.dokumenRepository.findDokumenByPPDBId(id);
    //                 if (existingDokumen) {
    //                     await this.dokumenRepository.destroyDokumenByPPDBId(id);
    //                 }
    
    //                 await this.dokumenRepository.saveDokumen(
    //                     id, 
    //                     dokumen?.getUrlAktaKelahiran() || "", 
    //                     dokumen?.getUrlKartuKeluarga() || ""  
    //                 );
    //             } else {
    //                 throw new Error("Invalid files format");
    //             }
    //         }

    //         await this.ppdbRepository.updatePPDB(id, {
    //             ...body,
    //         });
    
    //         buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    //     } catch (error) {
    //         const appErr = error as ApplicationError;
    //         buildResponseError(res, appErr.code, appErr.message);
    //     }
    // }       
}