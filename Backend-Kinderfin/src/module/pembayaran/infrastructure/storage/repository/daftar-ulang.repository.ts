import { Sequelize } from "sequelize";
import { ApplicationError, AggregateId } from "../../../../../shared/abstract";
import { DaftarUlangProps, DaftarUlangEntity } from "../../../domain/entity";
import { IDaftarUlangRepository } from "../../../domain/repository";

export class DaftarUlangRepository implements IDaftarUlangRepository {
  constructor(private readonly dbConn: Sequelize) { }

  async addDaftarUlang(daftarUlangData: DaftarUlangEntity<DaftarUlangProps>): Promise<string> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["daftar_ulang"].create(
          {
            ...(daftarUlangData as any),
          },
          { transaction: t },
        );
      });
      return daftarUlangData.getId();
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getAllDaftarUlang(): Promise<DaftarUlangEntity<DaftarUlangProps>[]> {
    try {
      const daftarUlang = await this.dbConn.models["daftar_ulang"].findAll();
      const daftarUlangData =  daftarUlang.map((daftarUlang: any) => {
        const daftarUlangData = daftarUlang.get ? daftarUlang.get() : daftarUlang;
        return new DaftarUlangEntity<DaftarUlangProps>({
          ...daftarUlangData,
        } as DaftarUlangProps);
      });
      return daftarUlangData;
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async findDaftarUlangById(id: string): Promise<DaftarUlangEntity<DaftarUlangProps> | null> {
    try {
      const daftarUlang = await this.dbConn.models["daftar_ulang"].findByPk(id);
      if (!daftarUlang) {
        return null;
      }
      return daftarUlang as unknown as DaftarUlangEntity<DaftarUlangProps>;
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteDaftarUlang(id: string): Promise<void> {
    try {
      await this.dbConn.models["daftar_ulang"].destroy({
        where: { id }, 
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateDaftarUlang(id: string, updatedData: Partial<DaftarUlangProps>): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["daftar_ulang"].update(
          { ...(updatedData as any) },
          { where: { id }, transaction: t },
        );
      });
    } catch (error) {
      console.error("Error in updateDaftarUlang:", error); 
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}