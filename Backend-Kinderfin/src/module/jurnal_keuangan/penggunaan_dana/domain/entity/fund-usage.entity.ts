import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../../shared/abstract";

const ErrorInvalidReceiverPattern =
    "Input penerima hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidTotalAmount = "Input jumlah harus bernilai lebih dari 0";

export interface FundUsageProps {
    id?: AggregateId;
    aktivitas?: string;
    tanggal?: Date;
    penerima?: string;
    sub_aktivitas?: string;
    uraian?: string;
    jumlah?: number;
}

export class FundUsageEntity<
    TProps extends FundUsageProps,
> extends AggregateRoot {
    private aktivitas?: string;
    private tanggal?: Date;
    private penerima?: string;
    private sub_aktivitas?: string;
    private uraian?: string;
    private jumlah?: number;

    constructor(props: TProps) {
        super(props.id);
        ({
            aktivitas: this.aktivitas,
            tanggal: this.tanggal,
            penerima: this.penerima,
            sub_aktivitas: this.sub_aktivitas,
            uraian: this.uraian,
            jumlah: this.jumlah,
        } = props);
        this.validateInput();
    }

    getAktivitas(): string | undefined {
        return this.aktivitas;
    }

    setAktivitas(activityValue: string) {
        this.aktivitas = activityValue;
    }

    getTanggal(): Date | undefined {
        return this.tanggal;
    }

    setTanggal(dateValue: Date) {
        this.tanggal = dateValue;
    }

    getPenerima(): string | undefined {
        return this.penerima;
    }

    setPenerima(receiverValue: string) {
        this.penerima = receiverValue;
    }

    getSubAktivitas(): string | undefined {
        return this.sub_aktivitas;
    }

    setSubAktivitas(subActivityValue: string) {
        this.sub_aktivitas = subActivityValue;
    }

    getUraian(): string | undefined {
        return this.uraian;
    }

    getJumlah(): number | undefined {
        return this.jumlah;
    }

    validateInput() {
        if (this.penerima && !/^[a-zA-Z., ]*$/.test(this.penerima)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidReceiverPattern,
            );
        }
        if (this.jumlah != undefined && this.jumlah <= 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidTotalAmount,
            );
        }
    }

    verifyActivityMasterData(masterDatas: any): Error | null {
        return masterDatas.some(
            (masterData: any) => masterData.nilai == this.getAktivitas(),
        )
            ? null
            : Error("Aktivitas keuangan tidak terdaftar");
    }

    verifySubActivityMasterData(masterDatas: any): Error | null {
        return masterDatas.some(
            (masterData: any) => masterData.nilai == this.getSubAktivitas(),
        )
            ? null
            : Error("Sub aktivitas keuangan tidak terdaftar");
    }
}
