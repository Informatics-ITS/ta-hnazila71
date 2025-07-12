import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../shared/abstract";
import { SalaryStatus } from "../enum";

const ErrorInvalidFullNamePattern =
    "Nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidSalaryAmount = "Nominal gaji tidak boleh bernilai negatif";

export interface SalaryProps {
    id?: AggregateId;
    nama_lengkap: string;
    tanggal_pembayaran: Date;
    nominal: number;
    status_pembayaran?: SalaryStatus;
    user_id: AggregateId;
}

export class SalaryEntity<TProps extends SalaryProps> extends AggregateRoot {
    private nama_lengkap: string;
    private tanggal_pembayaran: Date;
    private nominal: number;
    private status_pembayaran?: SalaryStatus;
    private user_id: AggregateId;

    constructor(props: TProps) {
        super(props.id);
        this.nama_lengkap = props.nama_lengkap;
        this.tanggal_pembayaran = props.tanggal_pembayaran;
        this.nominal = props.nominal;
        this.user_id = props.user_id;
        ({ status_pembayaran: this.status_pembayaran } = props);
        this.validateInput();
    }

    getNamaLengkap(): string {
        return this.nama_lengkap;
    }

    getTanggalPembayaran(): Date {
        return this.tanggal_pembayaran;
    }

    getNominal(): number {
        return this.nominal;
    }

    getStatusPembayaran(): SalaryStatus | undefined {
        return this.status_pembayaran;
    }

    getUserId(): AggregateId {
        return this.user_id;
    }

    validateInput() {
        if (this.nama_lengkap && !/^[a-zA-Z., ]*$/.test(this.nama_lengkap)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidFullNamePattern,
            );
        }
        if (this.nominal < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidSalaryAmount,
            );
        }
    }
}
