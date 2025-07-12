export class EmployeeSalaryPaidEvent {
    public eventOccurred: Date;

    constructor(public data: string, public eventName: string) {
        this.eventOccurred = new Date();
    }
}
