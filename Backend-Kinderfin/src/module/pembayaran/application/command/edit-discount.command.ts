import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { DiscountProps, DiscountEntity } from "../../domain/entity/discount.entity";
import { IDiscountRepository } from "../../domain/repository/discount.repository";

export interface EditDiscountCommand {
  id: string;
  nama: string;
  persentase: number;
}

export class EditDiscountCommandHandler
  implements ICommandHandler<EditDiscountCommand, void>
{
  constructor(
    private readonly discountRepository: IDiscountRepository,
  ) {}

  async execute(command: EditDiscountCommand): Promise<void> {
    try {
      const newDiscount = new DiscountEntity<DiscountProps>({
        ...command,
      } as DiscountProps);
      await this.discountRepository.editDiscountByID(command.id, newDiscount);
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}