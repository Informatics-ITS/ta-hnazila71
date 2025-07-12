import { AggregateId } from "../../../../shared/abstract";
import { RumahTanggaEntity, RumahTanggaProps } from "../entity/rumah-tangga.entity";

export interface IRumahTanggaRepository { 
  isDataExist(rumahTanggaId: AggregateId): Promise<boolean>;
  addRumahTangga(rumahTanggaData: RumahTanggaEntity<RumahTanggaProps>): Promise<void>;
  updateRumahTangga(rumahTanggaData: RumahTanggaEntity<RumahTanggaProps>): Promise<void>;
  deleteRumahTangga(rumahTanggaId: AggregateId): Promise<void>;
  // isRumahTanggaIdExist(rumahTanggaId: AggregateId): Promise<RumahTanggaProps | null>;
}