import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IRumahTanggaQueryHandler } from "../../../application/query";
import { RumahTanggaProps } from "../../../domain/entity";


export class RumahTanggaQueryHandler implements IRumahTanggaQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllRumahTangga(viewAccessOption: object): Promise<RumahTanggaProps[]> {
        try {
            const rumahTanggas = await this.dbConn.models["pengeluaran_rumah_tangga"].findAll({
                where: { ...viewAccessOption },
                order: [['created_at', 'DESC']],
                attributes: { include: ['created_at', 'updated_at'] }
            });
            return rumahTanggas.map((rumahTangga: any): RumahTanggaProps => {
                return rumahTangga as RumahTanggaProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getRumahTanggaById(id: any): Promise<RumahTanggaProps> {
        try {
            const rumahTangga = await this.dbConn.models["pengeluaran_rumah_tangga"].findAll({
                where: { ...id },
                attributes: { include: ['created_at', 'updated_at'] }
            });
            return rumahTangga as unknown as RumahTanggaProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getRumahTanggaByJenisPengeluaran(jenis_pengeluaran: string): Promise<RumahTanggaProps[]> {
      try {
          const rumahTanggas = await this.dbConn.models["pengeluaran_rumah_tangga"].findAll({
              where: { jenis_pengeluaran },
              attributes: { include: ['created_at', 'updated_at'] }
          });
          return rumahTanggas.map((rumahTangga: any): RumahTanggaProps => {
              return rumahTangga as RumahTanggaProps;
          });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getRumahTanggaByNama(nama: string): Promise<RumahTanggaProps[]> {
      try {
          const rumahTanggas = await this.dbConn.models["pengeluaran_rumah_tangga"].findAll({
              where: { nama },
          });
          return rumahTanggas.map((rumahTangga: any): RumahTanggaProps => {
            return rumahTangga as RumahTanggaProps;
          });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getRumahTanggaByNominal(nominal: number): Promise<RumahTanggaProps[]> {
      try {
          const rumahTanggas = await this.dbConn.models["pengeluaran_rumah_tangga"].findAll({
              where: { nominal },
          });
          return rumahTanggas.map((rumahTangga: any): RumahTanggaProps => {
            return rumahTangga as RumahTanggaProps;
          }
          );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    
}