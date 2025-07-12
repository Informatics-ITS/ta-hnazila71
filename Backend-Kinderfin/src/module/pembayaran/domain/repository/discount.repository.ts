import { AggregateId } from "../../../../shared/abstract";
import { DiscountEntity, DiscountProps } from "../entity/discount.entity";

export interface IDiscountRepository { 
  addDiscount(discountData: DiscountEntity<DiscountProps>): Promise<void>;
  getDiscountByName(nama: string): Promise<DiscountEntity<DiscountProps> | null>;
  getAllDiscounts(): Promise<DiscountEntity<DiscountProps>[]>;
  getDiscountById(id: AggregateId): Promise<DiscountEntity<DiscountProps> | null>;
  editDiscountByID(id: string, discountData: DiscountEntity<DiscountProps>): Promise<void>;
  deleteDiscountById(id: string): Promise<void>;
}