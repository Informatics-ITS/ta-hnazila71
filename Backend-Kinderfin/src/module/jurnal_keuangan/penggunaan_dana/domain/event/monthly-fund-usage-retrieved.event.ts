export interface MonthlyFundUsageValue {
    bulan: number;
    total: number;
}

export class MonthlyFundUsageRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: MonthlyFundUsageValue[], public eventName: string) {
        this.eventOccurred = new Date();
    }
}
