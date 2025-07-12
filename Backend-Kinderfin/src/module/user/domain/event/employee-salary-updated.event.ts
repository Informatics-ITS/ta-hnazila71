export class EmployeeSalaryUpdatedEvent {
    public eventOccurred: Date;

    constructor(public data: string, public eventName: string) {
        this.eventOccurred = new Date();
    }
}
