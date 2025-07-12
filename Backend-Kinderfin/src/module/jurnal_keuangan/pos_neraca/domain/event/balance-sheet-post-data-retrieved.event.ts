import { BalanceSheetPostProps } from "../entity";

export class BalanceSheetPostDataRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: BalanceSheetPostProps | null, public eventName: string) {
        this.eventOccurred = new Date();
    }
}
