import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { RumahTanggaEntity, RumahTanggaProps } from "../../../domain/entity";
import { IRumahTanggaRepository } from "../../../domain/repository";
import { logger } from "../../../../../shared/util";

export class RumahTanggaRepository implements IRumahTanggaRepository { 
  constructor(private readonly dbConn: Sequelize) { }

  async isDataExist(rumahTanggaId: AggregateId): Promise<boolean> {
    try {
      const rumahTangga = await this.dbConn.models["pengeluaran_rumah_tangga"].findOne({
        where: {
          id: rumahTanggaId,
        },
      });
      return rumahTangga !== null;
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async addRumahTangga(rumahTanggaData: RumahTanggaEntity<RumahTanggaProps>): Promise<void> {
    try {
      await this.dbConn.models["pengeluaran_rumah_tangga"].create({
        jenis_pengeluaran: rumahTanggaData.getJenisPengeluaran(),
        nama: rumahTanggaData.getNama(),
        nominal: rumahTanggaData.getNominal(),
        id_user: rumahTanggaData.getUserId(),
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateRumahTangga(rumahTanggaData: RumahTanggaEntity<RumahTanggaProps>): Promise<void> {
    try {// dummy value
      await this.dbConn.models["pengeluaran_rumah_tangga"].update({
        jenis_pengeluaran: rumahTanggaData.getJenisPengeluaran(),
        nama: rumahTanggaData.getNama(),
        nominal: rumahTanggaData.getNominal(),
        id_user: rumahTanggaData.getUserId(),
      }, {
        where: {
          id: rumahTanggaData.getId(),
        },
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteRumahTangga(rumahTanggaId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["pengeluaran_rumah_tangga"].destroy({
        where: {
          id: rumahTanggaId,
        },
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}