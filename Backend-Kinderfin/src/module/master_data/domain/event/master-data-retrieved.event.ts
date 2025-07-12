import { MasterDataProps } from "../entity";

export class MasterDataRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: MasterDataProps[], public eventName: string) {
        this.eventOccurred = new Date();
    }
}
