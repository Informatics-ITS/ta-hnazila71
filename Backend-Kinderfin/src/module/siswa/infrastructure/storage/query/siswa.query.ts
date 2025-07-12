import { Sequelize } from "sequelize";
import {
    ApplicationError,
} from "../../../../../shared/abstract";
import { ISiswaQueryHandler } from "../../../application/query";
import { SiswaProps } from "../../../domain/entity";

export class SiswaQueryHandler implements ISiswaQueryHandler {
    constructor(private readonly dbConn: Sequelize) {}

    async getAllSiswa(): Promise<SiswaProps[]> {
        try {
            const siswas = await this.dbConn.models["siswa"].findAll();
            return siswas.map((siswa: any) => {
                return siswa as SiswaProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
