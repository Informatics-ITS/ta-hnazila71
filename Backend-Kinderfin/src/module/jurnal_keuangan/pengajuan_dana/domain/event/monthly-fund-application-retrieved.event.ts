export interface MonthlyFundApplicationValue {
    bulan: number;
    total: number;
}

export class MonthlyFundApplicationRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: MonthlyFundApplicationValue[], public eventName: string) {
        this.eventOccurred = new Date();
    }
}
