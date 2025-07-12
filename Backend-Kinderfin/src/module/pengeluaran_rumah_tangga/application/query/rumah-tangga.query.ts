import { AggregateId } from "../../../../shared/abstract";
import { RumahTanggaProps } from "../../domain/entity";

export interface IRumahTanggaQueryHandler {
    getAllRumahTangga(viewAccessOption: object): Promise<RumahTanggaProps[]>;
    getRumahTanggaById(rumahTanggaId: any): Promise<RumahTanggaProps>;
    getRumahTanggaByJenisPengeluaran(jenisPengeluaran: string): Promise<RumahTanggaProps[]>;
    getRumahTanggaByNama(nama: string): Promise<RumahTanggaProps[]>;
    getRumahTanggaByNominal(nominal: number): Promise<RumahTanggaProps[]>;
}