import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { StudentBillsEntity, StudentBillsProps } from "../../domain/entity";
import { IStudentBillsRepository } from "../../domain/repository/student-bills.repository";

export interface AddStudentBillsCommand {
  id_student: string;
  id_tagihan: string;
  id_discount: string;
  total_paid: number;
  remaining_amount: number;
  payment_status: string;
}

export class AddStudentBillsCommandHandler
  implements ICommandHandler<AddStudentBillsCommand, void>
{
  constructor(
    private readonly studentBillsRepository: IStudentBillsRepository,
  ) {}

  async execute(command: AddStudentBillsCommand): Promise<void> {
    try {
      const newStudentBills = new StudentBillsEntity<StudentBillsProps>({
        ...command,
      } as StudentBillsProps);
      await this.studentBillsRepository.addStudentBills(newStudentBills);
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}