import { AggregateId } from "../../../../shared/abstract";
import { DaftarUlangEntity, DaftarUlangProps } from "../entity";

export interface IDaftarUlangRepository {
  addDaftarUlang(daftarUlangData: DaftarUlangEntity<DaftarUlangProps>): Promise<string>;
  findDaftarUlangById(id: string): Promise<DaftarUlangEntity<DaftarUlangProps> | null>;
  deleteDaftarUlang(id: string): Promise<void>;
  updateDaftarUlang(id: string, updatedData: Partial<DaftarUlangProps>): Promise<void>;
  getAllDaftarUlang(): Promise<DaftarUlangEntity<DaftarUlangProps>[]>
}