import { SiswaProps } from "../../domain/entity";

export interface ISiswaQueryHandler {
    getAllSiswa(): Promise<SiswaProps[]>;
}