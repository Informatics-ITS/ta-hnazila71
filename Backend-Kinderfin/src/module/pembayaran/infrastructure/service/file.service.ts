import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";
import { ApplicationError } from "../../../../shared/abstract";
import { IFileService } from "../../application/service";
import { PaymentFileEntity, PaymentFileProps } from "../../domain/entity";
import { DokumenEntity, DokumenProps } from "../../../siswa/domain/entity";

export class FileService implements IFileService {
    constructor(private readonly imagekit: ImageKit) { }

    async uploadFile(
        paymentProofFile: Express.Multer.File,
    ): Promise<PaymentFileEntity<PaymentFileProps>> {
        try {
            const newFile = await this.imagekit.upload({
                file: paymentProofFile.buffer,
                fileName: `${uuidv4()}_${paymentProofFile.originalname}`,
            });
            return new PaymentFileEntity<PaymentFileProps>({
                id: newFile.fileId,
                nama: paymentProofFile.originalname,
                url_asli: newFile.url,
                path: newFile.filePath,
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async uploadDokumenFile(aktaKelahiran: Express.Multer.File, kartuKeluarga: Express.Multer.File): Promise<DokumenEntity<DokumenProps>> {
        try {

            const newAktaKelahiran = await this.imagekit.upload({
                file: aktaKelahiran.buffer,
                fileName: `${uuidv4()}_${aktaKelahiran.originalname}`,
            });

            const newKartuKeluarga = await this.imagekit.upload({
                file: kartuKeluarga.buffer,
                fileName: `${uuidv4()}_${kartuKeluarga.originalname}`,
            });

            return new DokumenEntity<DokumenProps>({
                url_akta_kelahiran: newAktaKelahiran.url,
                url_kartu_keluarga: newKartuKeluarga.url,
            } as DokumenProps);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteFile(paymentProofFileId: string): Promise<void> {
        try {
            await this.imagekit.deleteFile(paymentProofFileId);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
