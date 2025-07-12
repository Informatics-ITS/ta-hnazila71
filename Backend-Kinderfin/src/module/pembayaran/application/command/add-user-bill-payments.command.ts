import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { UserBillPaymentsEntity, UserBillPaymentsProps } from "../../domain/entity";
import { IUserBillPaymentsRepository } from "../../domain/repository";

export interface AddUserBillPaymentsCommand {
  id_student_bill: string;
  id_payment_proof: string;
  amount_paid: number;
  component_paid: string;
  payment_date: Date;
}

export class AddUserBillPaymentsCommandHandler
  implements ICommandHandler<AddUserBillPaymentsCommand, void>
{
  constructor(
    private readonly userBillPaymentsRepository: IUserBillPaymentsRepository,
  ) {}

  async execute(command: AddUserBillPaymentsCommand): Promise<void> {
    try {
      const newUserBillPayments = new UserBillPaymentsEntity<UserBillPaymentsProps>({
        ...command,
      } as UserBillPaymentsProps);
      await this.userBillPaymentsRepository.addUserBillPayments(newUserBillPayments);
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}