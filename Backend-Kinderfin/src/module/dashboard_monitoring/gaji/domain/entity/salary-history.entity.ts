import { AggregateRoot } from "../../../../../shared/abstract";
import { SalaryStatus } from "../enum";

export interface SalaryHistoryProps {
    nama_lengkap: string;
    tanggal_pembayaran: Date;
    nominal: number;
    status_pembayaran: SalaryStatus;
}

export class SalaryHistoryEntity<
    TProps extends SalaryHistoryProps,
> extends AggregateRoot {
    private nama_lengkap: string;
    private tanggal_pembayaran: Date;
    private nominal: number;
    private status_pembayaran: SalaryStatus;

    constructor(props: TProps) {
        super();
        this.nama_lengkap = props.nama_lengkap;
        this.tanggal_pembayaran = props.tanggal_pembayaran;
        this.nominal = props.nominal;
        this.status_pembayaran = props.status_pembayaran;
        this.validatePaidSalary();
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

    getStatusPembayaran(): SalaryStatus {
        return this.status_pembayaran;
    }

    validatePaidSalary() {
        if (this.status_pembayaran != SalaryStatus.PAID) {
            this.id = "";
        }
    }
}
