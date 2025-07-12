import { StatusCodes } from "http-status-codes";
import {
    AggregateRoot,
    ApplicationError,
} from "../../../../../shared/abstract";
import { FinancialStatictic } from "../value_object";

const ErrorInvalidCashFlowStatisticYear =
    "Tahun statistik arus keuangan tidak valid";

export class CashFlowStatisticEntity extends AggregateRoot {
    private tahun: number;
    private rekapitulasi_pengajuan_dana?: FinancialStatictic[];
    private rekapitulasi_penggunaan_dana?: FinancialStatictic[];

    constructor(year: number) {
        super();
        this.tahun = year;
        this.validateInput();
    }

    getTahun(): number {
        return this.tahun;
    }

    getRekapitulasiPengajuanDana(): FinancialStatictic[] | undefined {
        return this.rekapitulasi_pengajuan_dana;
    }

    setRekapitulasiPengajuanDana(
        fundApplicationRecapitulation: FinancialStatictic[],
    ) {
        this.rekapitulasi_pengajuan_dana = fundApplicationRecapitulation;
    }

    getRekapitulasiPenggunaanDana(): FinancialStatictic[] | undefined {
        return this.rekapitulasi_penggunaan_dana;
    }

    setRekapitulasiPenggunaanDana(
        fundUsageRecapitulation: FinancialStatictic[],
    ) {
        this.rekapitulasi_penggunaan_dana = fundUsageRecapitulation;
    }

    validateInput() {
        if (this.tahun < 2000) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidCashFlowStatisticYear,
            );
        }
    }
}
