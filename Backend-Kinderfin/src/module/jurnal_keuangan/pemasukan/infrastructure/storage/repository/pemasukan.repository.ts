import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../../shared/abstract";
import { PemasukanEntity, PemasukanProps } from "../../../domain/entity";
import { IPemasukanRepository } from "../../../domain/repository";
import { logger } from "../../../../../../shared/util";

export class PemasukanRepository implements IPemasukanRepository { 
  constructor(private readonly dbConn: Sequelize) { }

  async isDataExist(pemasukanId: AggregateId): Promise<boolean> {
    try {
      const pemasukan = await this.dbConn.models["pemasukan"].findOne({
        where: {
          id: pemasukanId,
        },
      });
      return pemasukan !== null;
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async addPemasukan(pemasukanData: PemasukanEntity<PemasukanProps>): Promise<void> {
    try {
      await this.dbConn.models["pemasukan"].create({
        jenis_pemasukan: pemasukanData.getJenispemasukan(),
        nama: pemasukanData.getNama(),
        nominal: pemasukanData.getNominal(),
        id_user: pemasukanData.getUserId(),
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updatePemasukan(pemasukanData: PemasukanEntity<PemasukanProps>): Promise<void> {
    try {// dummy value
      await this.dbConn.models["pemasukan"].update({
        jenis_pemasukan: pemasukanData.getJenispemasukan(),
        nama: pemasukanData.getNama(),
        nominal: pemasukanData.getNominal(),
        id_user: pemasukanData.getUserId(),
      }, {
        where: {
          id: pemasukanData.getId(),
        },
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deletePemasukan(pemasukanId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["pemasukan"].destroy({
        where: {
          id: pemasukanId,
        },
      });
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}