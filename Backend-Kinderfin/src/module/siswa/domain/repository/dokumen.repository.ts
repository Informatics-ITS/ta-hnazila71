import { AggregateId } from "../../../../shared/abstract";
import { DokumenEntity, DokumenProps } from "../entity";

export interface IDokumenRepository {
  addDokumen(dokumenData: DokumenEntity<DokumenProps>): Promise<string>;
  getAllDokumen(event: any): Promise<DokumenProps[]>;
  saveDokumen(ppdbId: string, urlAkta: string, urlKK: string): Promise<void>;
  findDokumenByPPDBId(ppdbId: AggregateId): Promise<DokumenProps>;
  destroyDokumenByPPDBId(ppdbId: AggregateId): Promise<void>;
}