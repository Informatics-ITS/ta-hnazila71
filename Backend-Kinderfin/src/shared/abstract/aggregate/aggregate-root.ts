import { AggregateId } from "./aggregate-id";
import { v4 as uuidv4 } from "uuid";

export class AggregateRoot {
    id: AggregateId;

    constructor(id?: string) {
        this.id = id ?? uuidv4();
    }
}
