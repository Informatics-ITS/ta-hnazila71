import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { DiscountProps, DiscountEntity } from "../../domain/entity/discount.entity";
import { IDiscountRepository } from "../../domain/repository/discount.repository";

export interface AddDiscountCommand {
  nama: string;
  persentase: number;
}

export class AddDiscountCommandHandler
  implements ICommandHandler<AddDiscountCommand, void>
{
  constructor(
    private readonly discountRepository: IDiscountRepository,
  ) {}

  async execute(command: AddDiscountCommand): Promise<void> {
    try {
      if (command.persentase > 100) {
        throw new ApplicationError(StatusCodes.BAD_REQUEST, "Diskon tidak boleh lebih dari 100%");
      }

      const newDiscount = new DiscountEntity<DiscountProps>({
        ...command,
      } as DiscountProps);

      await this.discountRepository.addDiscount(newDiscount);
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}