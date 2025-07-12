export class BalanceSheetPostDataRequestedEvent {
    public eventOccurred: Date;

    constructor(public data: any, public eventName: string) {
        this.eventOccurred = new Date();
    }
}
