import { AggregateId } from "../../../../shared/abstract";
import { PaymentProofEntity, PaymentProofProps } from "../entity";

export interface PaymentProofResult
    extends Omit<PaymentProofProps, "file_pembayaran"> {
    // nomor_pendaftaran?: string;
    // tanggal_daftar: Date;
    // nama_lengkap: string;
    // jenis_pembayaran: string;
    // nrp?: string;
    // email: string;
    // nomor_telepon: string;
    id_file_pembayaran: string;
}

export interface IPaymentProofRepository {
    addPaymentProof(
        paymentProofData: PaymentProofEntity<PaymentProofProps>,
    ): Promise<PaymentProofEntity<PaymentProofProps>>;
    updatePaymentProof(
        paymentProofData: PaymentProofEntity<PaymentProofProps>,
        oldPaymentFileId: string,
    ): Promise<void>;
    deletePaymentProof(
        paymentProofId: AggregateId,
        paymentFileId: string,
    ): Promise<void>;
    isPaymentProofIdExist(
        paymentProofId: AggregateId,
    ): Promise<PaymentProofResult | null>;
}
