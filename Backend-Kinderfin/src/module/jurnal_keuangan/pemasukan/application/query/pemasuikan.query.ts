import { AggregateId } from "../../../../../shared/abstract";
import { PemasukanProps } from "../../domain/entity";

export interface IPemasukanQueryHandler {
    getAllPemasukan(viewAccessOption: object): Promise<PemasukanProps[]>;
    getPemasukanById(pemasukanId: any): Promise<PemasukanProps>;
    getPemasukanByJenisPemasukan(jenisPemasukan: string): Promise<PemasukanProps[]>;
    getPemasukanByNama(nama: string): Promise<PemasukanProps[]>;
    getPemasukanByNominal(nominal: number): Promise<PemasukanProps[]>;
}