import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { DiscountProps, DiscountEntity } from "../../../domain/entity";
import { IDiscountRepository } from "../../../domain/repository";

export class DiscountRepository implements IDiscountRepository {
  constructor(private readonly dbConn: Sequelize) { }

  async addDiscount(discountData: DiscountEntity<DiscountProps>): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["discount"].create(
          {
            ...(discountData as any),
          },
          { transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDiscountByName(nama: string): Promise<DiscountEntity<DiscountProps> | null> {
    try {
      const discountData = await this.dbConn.models["discount"].findOne({
        where: { nama },
      });

      // console.log("DISCOUNT DATA", discountData);
  
      if (discountData) {
        const discountProps: DiscountProps = {
          id: (discountData as any).id, // Gunakan 'as any' untuk menghindari error TypeScript
          nama: (discountData as any).nama,
          persentase: (discountData as any).persentase,
        };
    
        return new DiscountEntity<DiscountProps>(discountProps);
      }

      return null;
  
      // Gunakan Type Assertion untuk memberi tahu TypeScript bahwa discountData memiliki tipe yang benar
      
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(
        appErr.code || 500, 
        appErr.message || "An unexpected error occurred"
      );
    }
  }
  
  async getAllDiscounts(): Promise<DiscountEntity<DiscountProps>[]> {
    try {
      const discountData = await this.dbConn.models["discount"].findAll();
      return discountData.map((discount: any) => discount as DiscountEntity<DiscountProps>);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }  

  async getDiscountById(id: AggregateId): Promise<DiscountEntity<DiscountProps> | null> {
    try {
      const discountData = await this.dbConn.models["discount"].findOne({
        where: { id },
      });

      if (discountData) {
        const discountProps: DiscountProps = {
          id: (discountData as any).id,
          nama: (discountData as any).nama,
          persentase: (discountData as any).persentase,
        };
    
        return new DiscountEntity<DiscountProps>(discountProps);
      }

      return null;
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async editDiscountByID(id: string, discountData: DiscountEntity<DiscountProps>): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["discount"].update(
          {
            ...(discountData as any),
          },
          { where: { id }, transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteDiscountById(id: string): Promise<void> {
    try {
      await this.dbConn.models["discount"].destroy({ where: { id } });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}