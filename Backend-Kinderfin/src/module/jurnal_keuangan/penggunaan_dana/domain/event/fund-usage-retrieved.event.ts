export interface SimplifiedFundUsagesResult {
    aktivitas: string;
    sub_aktivitas: string;
    tahun: number;
    jumlah: number;
}

export class BudgetEstimatePlanRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: SimplifiedFundUsagesResult[], public eventName: string) {
        this.eventOccurred = new Date();
    }
}
