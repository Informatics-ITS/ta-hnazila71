import { FundUsageProps } from "../../domain/entity";
import { MonthlyFundUsageValue, SimplifiedFundUsagesResult } from "../../domain/event";

export interface AllFundUsagesResult {
    penggunaan_dana: FundUsageProps[];
    jumlah: number;
}

export interface IFundUsageQueryHandler {
    getAllFundUsages(
        bulan: number,
        tahun: number,
    ): Promise<AllFundUsagesResult>;
    getMonthlyFundUsagesByYear(year: number): Promise<MonthlyFundUsageValue[]>;
    getSimplifiedFundUsages(
        year: number,
    ): Promise<SimplifiedFundUsagesResult[]>;
}
