import { AggregateId } from "../../../../shared/abstract";
import { SPPProps, SPPEntity } from "../entity";


export interface ISPPRepository  {
  addSPPBill(sppData: SPPEntity<SPPProps>): Promise<string>;
  getAllSPPBill(): Promise<SPPEntity<SPPProps>[]>;
  getSPPBillById(id: AggregateId): Promise<SPPEntity<SPPProps> | null>;
  editSPPBillById(id: AggregateId, sppData: SPPEntity<SPPProps>): Promise<void>;
  deleteSPPById(id: AggregateId): Promise<void>;
}