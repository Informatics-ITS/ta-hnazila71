import { PemasukanEntity, PemasukanProps } from "../entity/pemasukan.entity";
import { AggregateId } from "../../../../../shared/abstract";

export interface IPemasukanRepository { 
  isDataExist(pemasukanId: AggregateId): Promise<boolean>;
  addPemasukan(pemasukanData: PemasukanEntity<PemasukanProps>): Promise<void>;
  updatePemasukan(pemasukanData: PemasukanEntity<PemasukanProps>): Promise<void>;
  deletePemasukan(pemasukanId: AggregateId): Promise<void>;
}