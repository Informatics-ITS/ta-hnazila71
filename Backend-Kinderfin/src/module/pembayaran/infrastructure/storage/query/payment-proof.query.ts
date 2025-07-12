import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IPaymentProofQueryHandler } from "../../../application/query";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofProps,
} from "../../../domain/entity";

export class PaymentProofQueryHandler implements IPaymentProofQueryHandler {
    constructor(private readonly dbConn: Sequelize) {}

    async getAllPaymentProofs(): Promise<PaymentProofProps[]> {
        try {
            const paymentProofDatas = await this.dbConn.models[
                "file_pembayaran"
            ].findAll({
                include: {
                    model: this.dbConn.models["bukti_pembayaran"],
                    as: "bukti_pembayaran",
                },
                nest: true,
            });
            return paymentProofDatas.map(
                (paymentProofData: any): PaymentProofProps => {
                    return {
                        // id: paymentProofData.bukti_pembayaran.id,
                        // nomor_pendaftaran:
                        //     paymentProofData.bukti_pembayaran.nomor_pendaftaran,
                        // tanggal_daftar:
                        //     paymentProofData.bukti_pembayaran.tanggal_daftar,
                        // nama_lengkap:
                        //     paymentProofData.bukti_pembayaran.nama_lengkap,
                        // jenis_pembayaran:
                        //     paymentProofData.bukti_pembayaran.jenis_pembayaran,
                        // nrp: paymentProofData.bukti_pembayaran.nrp,
                        // email: paymentProofData.bukti_pembayaran.email,
                        // nomor_telepon:
                        //     paymentProofData.bukti_pembayaran.nomor_telepon,
                        // file_pembayaran:
                        //     new PaymentFileEntity<PaymentFileProps>({
                        //         id: paymentProofData.id,
                        //         nama: paymentProofData.nama,
                        //         url_asli: paymentProofData.url_asli,
                        //         path: paymentProofData.path,
                        //     }),
                    } as PaymentProofProps;
                },
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
