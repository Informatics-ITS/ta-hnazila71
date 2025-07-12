import { AggregateId } from "../../../../shared/abstract";
import { SiswaProps } from "../../../siswa/domain/entity";
import { PPDBEntity, PPDBProps } from "../entity";

export interface IPPDBRepository { 
  getAllPPDB(): Promise<PPDBProps[]>;
  addPPDB(ppdbData: PPDBEntity<PPDBProps>): Promise<void>;
  getPPDBByID(id: AggregateId): Promise<PPDBProps>;
  getPPDBByUserID(user_id: string): Promise<PPDBProps[]>;
  // updatePPDB(id: string, ppdbDataProps: PPDBProps): Promise<void>;
  deletePPDB(id: AggregateId): Promise<void>;
  getPPDBByTahunAjaran(tahun_ajaran: string): Promise<PPDBProps[]>;
  findById(id: string): Promise<PPDBProps>;
  verifPPDBData(id: string): Promise<SiswaProps>;
  rejectPPDBData(id: string): Promise<SiswaProps>
  updatePPDB(id: string, ppdbData: PPDBEntity<PPDBProps>): Promise<void>;
  // rejectPPDBData(id: string): Promise<SiswaProps>
}