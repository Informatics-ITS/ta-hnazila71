import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { DokumenProps, DokumenEntity } from "../../domain/entity";
import { IFileService } from "../../../pembayaran/application/service";
import { IDokumenRepository } from "../../domain/repository";

export interface UploadDokumenCommand {
  akta_kelahiran: Express.Multer.File;
  kartu_keluarga: Express.Multer.File;
}

export class UploadDokumenCommandHandler
  implements ICommandHandler<UploadDokumenCommand, DokumenEntity<DokumenProps>>
{
  constructor(
    private readonly fileService: IFileService,
    private readonly dokumenRepository: IDokumenRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadDokumenCommand): Promise<DokumenEntity<DokumenProps>> {
    const { akta_kelahiran, kartu_keluarga } = command;
    logger.info(`Uploading dokumen...`);
    
    try {
      // logger.info(`File Akta Kelahiran: ${akta_kelahiran.originalname}, size: ${akta_kelahiran.size}`);
      // logger.info(`File Kartu Keluarga: ${kartu_keluarga?.originalname}, size: ${kartu_keluarga?.size}`);
      
      const dokumenDatas = await this.fileService.uploadDokumenFile(akta_kelahiran, kartu_keluarga);
      
      logger.info(`Dokumen uploaded successfully.`);
      console.log("Dokumen data:", dokumenDatas);  // Log hasil dari dokumen yang ter-upload

      return dokumenDatas;
    } catch (error) {
      // logger.error(`Error during document upload: ${error.message}`);
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }

}