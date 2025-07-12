import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../shared/abstract";

const ErrorInvalidBudgetEstimatePlanYear =
    "Tahun rencana anggaran biaya tidak valid";

export interface BudgetEstimatePlanProps {
    id?: AggregateId;
    tahun: number;
    aktivitas: string;
    sub_aktivitas: string;
    jumlah: number;
}

export class BudgetEstimatePlanEntity<
    TProps extends BudgetEstimatePlanProps,
> extends AggregateRoot {
    private tahun: number;
    private aktivitas: string;
    private sub_aktivitas: string;
    private jumlah: number;

    constructor(props: TProps) {
        super(props.id);
        this.tahun = props.tahun;
        this.aktivitas = props.aktivitas;
        this.sub_aktivitas = props.sub_aktivitas;
        this.jumlah = props.jumlah;
        this.validateInput();
    }

    getTahun(): number {
        return this.tahun;
    }

    getAktivitas(): string {
        return this.aktivitas;
    }

    getSubAktivitas(): string {
        return this.sub_aktivitas;
    }

    getJumlah(): number {
        return this.jumlah;
    }

    validateInput() {
        if (this.tahun < 2000) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidBudgetEstimatePlanYear,
            );
        }
    }
}
