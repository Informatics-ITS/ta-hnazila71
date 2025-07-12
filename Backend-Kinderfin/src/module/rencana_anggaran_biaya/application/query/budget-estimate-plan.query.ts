export interface BudgetEstimatePlanResult {
    aktivitas: string;
    sub_aktivitas: string[];
    jumlah: number[];
    total: number;
}

export interface AllBudgetEstimatePlansResult {
    rencana_anggaran_biaya: BudgetEstimatePlanResult[];
    total: number;
}

export interface IBudgetEstimatePlanQueryHandler {
    getAllBudgetEstimatePlans(
        year: number,
    ): Promise<AllBudgetEstimatePlansResult>;
}
