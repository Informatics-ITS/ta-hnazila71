import { DokumenEntity, DokumenProps } from "../../../siswa/domain/entity";
import { PaymentFileEntity, PaymentFileProps } from "../../domain/entity";

export interface IFileService {
    uploadFile(
        paymentProofFile: Express.Multer.File,
    ): Promise<PaymentFileEntity<PaymentFileProps>>;
    deleteFile(paymentProofFileId: string): Promise<void>;
    uploadDokumenFile(
        aktaKelahiran: Express.Multer.File,
        kartuKeluarga: Express.Multer.File,
    ): Promise<DokumenEntity<DokumenProps>>;
}
