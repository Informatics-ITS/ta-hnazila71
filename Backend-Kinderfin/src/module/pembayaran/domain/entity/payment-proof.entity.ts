import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../shared/abstract";
import { PaymentTypeConstraintFormatter } from "../../../../shared/util";
import { PaymentFileEntity, PaymentFileProps } from "./payment-file.entity";

const ErrorInvalidRegistrationNumberDigit =
    "Input nomor pendaftaran harus terdiri dari 18 karakter";
const ErrorInvalidRegistrationNumberPattern =
    "Input nomor pendaftaran hanya dapat berisi angka";
const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidEmailPattern = "Format email salah";
const ErrorInvalidNrpDigit = "Input nrp harus terdiri dari 10 karakter";
const ErrorInvalidNrpPattern = "Input nrp hanya dapat berisi angka";
const ErrorInvalidPhoneNumberDigit =
    "Input nomor telepon harus terdiri dari 12 karakter";
const ErrorInvalidPhoneNumberPattern =
    "Input nomor telepon hanya dapat berisi angka";

const optionalFields = ["nomor_pendaftaran", "nrp"];

export interface PaymentProofProps {
    id?: AggregateId;
    id_student: string;
    // nomor_pendaftaran?: string | null;
    // status_pembayaran?: string;
    // tanggal_daftar?: Date;
    // nama_lengkap?: string;
    // jenis_pembayaran?: string;
    // nrp?: string | null;
    // email?: string;
    // nomor_telepon?: string;
    file_pembayaran?: PaymentFileEntity<PaymentFileProps>;
}

export class PaymentProofEntity<
    TProps extends PaymentProofProps,
> extends AggregateRoot {
    // private nomor_pendaftaran?: string | null;
    // private status_pembayaran?: string;
    // private tanggal_daftar?: Date;
    // private nama_lengkap?: string;
    // private jenis_pembayaran?: string;
    // private nrp?: string | null;
    // private email?: string;
    // private nomor_telepon?: string;
    private id_student: string;
    private file_pembayaran?: PaymentFileEntity<PaymentFileProps>;

    constructor(props: TProps) {
        super(props.id);
        ({
            // nomor_pendaftaran: this.nomor_pendaftaran,
            // status_pembayaran: this.status_pembayaran,
            // tanggal_daftar: this.tanggal_daftar,
            // nama_lengkap: this.nama_lengkap,
            // jenis_pembayaran: this.jenis_pembayaran,
            // nrp: this.nrp,
            // email: this.email,
            // nomor_telepon: this.nomor_telepon,
            id_student: this.id_student,
            file_pembayaran: this.file_pembayaran,
        } = props);
        this.validateInput();
    }

    // getNomorPendaftaran(): string | undefined | null {
    //     return this.nomor_pendaftaran;
    // }

    // setNomorPendaftaran(registrationNumberValue: string) {
    //     this.nomor_pendaftaran = registrationNumberValue;
    // }

    // getStatusPembayaran(): string | undefined {
    //     return this.status_pembayaran;
    // }

    // setStatusPembayaran(paymentStatus: string) {
    //     this.status_pembayaran = paymentStatus;
    // }

    // getTanggalDaftar(): Date | undefined {
    //     return this.tanggal_daftar;
    // }

    // getNamaLengkap(): string | undefined {
    //     return this.nama_lengkap;
    // }

    // getJenisPembayaran(): string | undefined {
    //     return this.jenis_pembayaran;
    // }

    // setJenisPembayaran(paymentType: string) {
    //     this.jenis_pembayaran = paymentType;
    // }

    // getNrp(): string | undefined | null {
    //     return this.nrp;
    // }

    // setNrp(nrpValue: string) {
    //     this.nrp = nrpValue;
    // }

    // getEmail(): string | undefined {
    //     return this.email;
    // }

    // getNomorTelepon(): string | undefined {
    //     return this.nomor_telepon;
    // }

    getId(): string {
        return this.id;
    }

    getIdStudent(): string {
        return this.id_student;
    }

    getFilePembayaran(): PaymentFileEntity<PaymentFileProps> | undefined {
        return this.file_pembayaran;
    }

    setFilePembayaran(
        filePembayaran: PaymentFileEntity<PaymentFileProps>,
    ): void {
        this.file_pembayaran = filePembayaran;
    }

    deleteFilePembayaran(): void {
        this.file_pembayaran = undefined;
    }

    validateInput() {
        // if (this.nomor_pendaftaran && this.nomor_pendaftaran.length != 18) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidRegistrationNumberDigit,
        //     );
        // }
        // if (this.nomor_pendaftaran && !/^\d*$/.test(this.nomor_pendaftaran)) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidRegistrationNumberPattern,
        //     );
        // }
        // if (this.nama_lengkap && !/^[a-zA-Z., ]*$/.test(this.nama_lengkap)) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidFullNamePattern,
        //     );
        // }
        // if (
        //     this.email &&
        //     !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        //         this.email,
        //     )
        // ) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidEmailPattern,
        //     );
        // }
        // if (this.nrp && this.nrp.length != 10) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidNrpDigit,
        //     );
        // }
        // if (this.nrp && !/^\d*$/.test(this.nrp)) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidNrpPattern,
        //     );
        // }
        // if (this.nomor_telepon && this.nomor_telepon.length != 12) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidPhoneNumberDigit,
        //     );
        // }
        // if (this.nomor_telepon && !/^\d*$/.test(this.nomor_telepon)) {
        //     throw new ApplicationError(
        //         StatusCodes.BAD_REQUEST,
        //         ErrorInvalidPhoneNumberPattern,
        //     );
        // }
    }

    // verifyPaymentTypeMasterData(masterDatas: any): {
    //     constraint: string | undefined;
    //     err: Error | null;
    // } {
    //     const paymentTypeData = masterDatas.find(
    //         (masterData: any) => masterData.nilai == this.getJenisPembayaran(),
    //     );

    //     if (paymentTypeData) {
    //         return { constraint: paymentTypeData.aturan ?? "", err: null };
    //     }
    //     return {
    //         constraint: paymentTypeData,
    //         err: Error("Jenis pembayaran tidak terdaftar"),
    //     };
    // }

    validatePaymentTypeInput(paymentTypeConstraint: string): Error | null {
        const fieldConstraint = PaymentTypeConstraintFormatter(
            paymentTypeConstraint,
        );
        for (const optionalField of optionalFields) {
            if (fieldConstraint.includes(optionalField)) {
                if (!this[optionalField as keyof this]) {
                    return Error(`Data "${optionalField}" perlu dimasukkan`);
                }
            } else {
                this[optionalField as keyof this] = null as any;
            }
        }
        return null;
    }
}
