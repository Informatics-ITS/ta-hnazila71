import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { SPPProps, SPPEntity } from "../../../domain/entity";
import { ISPPRepository, } from "../../../domain/repository";

export class SPPRepository implements ISPPRepository {
  constructor(private readonly dbConn: Sequelize) { }

  async addSPPBill(sppData: SPPEntity<SPPProps>): Promise<string> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["spp"].create(
          {
            ...(sppData as any),
          },
          { transaction: t },
        );
      });

      return sppData.getId();
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getAllSPPBill(): Promise<SPPEntity<SPPProps>[]> {
    try {
      const sppBills = await this.dbConn.models["spp"].findAll();
      return sppBills.map((sppBill: any) => sppBill as SPPEntity<SPPProps>);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
  
  async getSPPBillById(id: AggregateId): Promise<SPPEntity<SPPProps> | null> {
    try {
      const sppBill = await this.dbConn.models["spp"].findByPk(id);
      if (!sppBill) {
        return null;
      }
      
      return sppBill as unknown as SPPEntity<SPPProps>;
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async editSPPBillById(id: AggregateId, sppData: SPPEntity<SPPProps>): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["spp"].update(
          {
            ...(sppData as any),
          },
          {
            where: { id },
            transaction: t,
          },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteSPPById(id: AggregateId): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["spp"].destroy({
          where: { id },
          transaction: t,
        });
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}