import EventEmitter from "eventemitter3";

export class EventBus {
    private readonly EventEmitter: EventEmitter;

    constructor() {
        this.EventEmitter = new EventEmitter();
    }

    removeSpecificListener(eventType: string): void {
        const listener = this.EventEmitter.listeners(eventType);
        if (listener.length > 0) {
            this.EventEmitter.removeListener(eventType, listener[0]);
        }
    }

    publish(eventType: string, eventData: any): void {
        this.EventEmitter.emit(eventType, eventData);
    }

    subscribe(eventType: string, listener: (eventData: any) => void): void {
        this.EventEmitter.on(eventType, listener);
    }
}
