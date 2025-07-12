import { UserProps } from "../entity";

export class UserDataRetrievedEvent {
    public eventOccurred: Date;

    constructor(public data: UserProps, public eventName: string) {
        this.eventOccurred = new Date();
    }
}
