import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../../shared/abstract";
import { IPemasukanQueryHandler } from "../../../application/query";
import { PemasukanProps } from "../../../domain/entity";


export class PemasukanQueryHandler implements IPemasukanQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllPemasukan(viewAccessOption: object): Promise<PemasukanProps[]> {
        try {
            const pemasukan = await this.dbConn.models["pemasukan"].findAll({
                where: { ...viewAccessOption },
                order: [['created_at', 'DESC']],
                attributes: { include: ['created_at', 'updated_at'] }
            });
            return pemasukan.map((pemasukan: any): PemasukanProps => {
                return pemasukan as PemasukanProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getPemasukanById(id: any): Promise<PemasukanProps> {
        try {
            const pemasukan = await this.dbConn.models["pemasukan"].findAll({
                where: { ...id },
                attributes: { include: ['created_at', 'updated_at'] }
            });
            return pemasukan as unknown as PemasukanProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getPemasukanByJenisPemasukan(jenis_pemasukan: string): Promise<PemasukanProps[]> {
      try {
          const pemasukan = await this.dbConn.models["pemasukan"].findAll({
              where: { jenis_pemasukan },
              attributes: { include: ['created_at', 'updated_at'] }
          });
          return pemasukan.map((pemasukan: any): PemasukanProps => {
              return pemasukan as PemasukanProps;
          });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getPemasukanByNama(nama: string): Promise<PemasukanProps[]> {
      try {
          const pemasukan = await this.dbConn.models["pemasukan"].findAll({
              where: { nama },
          });
          return pemasukan.map((pemasukan: any): PemasukanProps => {
            return pemasukan as PemasukanProps;
          });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    async getPemasukanByNominal(nominal: number): Promise<PemasukanProps[]> {
      try {
          const pemasukan = await this.dbConn.models["pemasukan"].findAll({
              where: { nominal },
          });
          return pemasukan.map((pemasukan: any): PemasukanProps => {
            return pemasukan as PemasukanProps;
          }
          );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
  
    
}