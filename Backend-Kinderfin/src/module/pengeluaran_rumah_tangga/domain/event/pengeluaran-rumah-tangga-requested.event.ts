export class PengeluaranRumahTanggaDataRetrievedEvent {
  public eventOccurred: Date;

  constructor(public data: any, public eventName: string) {
      this.eventOccurred = new Date();
  }
}