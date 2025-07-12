import { FundApplicationProps } from "../../domain/entity";
import { MonthlyFundApplicationValue } from "../../domain/event";

export interface AllFundApplicationsResult {
    pengajuan_dana: FundApplicationProps[];
    jumlah: number;
}

export interface IFundApplicationQueryHandler {
    getAllFundApplications(
        bulan: number,
        tahun: number,
    ): Promise<AllFundApplicationsResult>;
    getMonthlyFundApplicationsByYear(
        year: number,
    ): Promise<MonthlyFundApplicationValue[]>;
}
