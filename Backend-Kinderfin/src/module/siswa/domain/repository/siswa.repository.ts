import { AggregateId } from "../../../../shared/abstract";
import { SiswaEntity, SiswaProps } from "../entity";
import { DokumenEntity, DokumenProps } from "../entity";

export interface ISiswaRepository {
  addSiswa(dokumenData: DokumenEntity<DokumenProps>, siswaData: SiswaEntity<SiswaProps>): Promise<void>;
  getAllStudents(event: any): Promise<SiswaProps[]>;
  addSiswa(dokumenData: DokumenEntity<DokumenProps> ,siswaData: SiswaEntity<SiswaProps>): Promise<void>;
  getAllSiswa(): Promise<SiswaEntity<SiswaProps>[]>;
}