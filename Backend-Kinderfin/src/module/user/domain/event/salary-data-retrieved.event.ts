import { SalaryProps } from "../entity";

export class SalaryDataRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: SalaryProps[], public eventName: string) {
        this.eventOccurred = new Date();
    }
}
