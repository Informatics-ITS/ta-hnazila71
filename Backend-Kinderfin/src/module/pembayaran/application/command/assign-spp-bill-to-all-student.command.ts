import { IsNonPrimitiveSubsetUnion } from "joi";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { StudentBillsEntity, StudentBillsProps } from "../../domain/entity";
import { IDiscountRepository, IStudentBillsRepository } from "../../domain/repository";

export interface AssignSPPBillToAllStudentCommand {
  id_tagihan: string;
  total_amount: number;
}

export class AssignSPPBillToAllStudentCommandHandler
  implements ICommandHandler<AssignSPPBillToAllStudentCommand, void> 
{
  constructor(
    private readonly studentBillsRepository: IStudentBillsRepository,
    private readonly discountRepository: IDiscountRepository,
    private readonly eventBus: EventBus,
  ) {}
  
  async execute(command: AssignSPPBillToAllStudentCommand): Promise<void> {
    try {
      this.eventBus.removeSpecificListener("AllStudentsDataRetrieved");
      this.eventBus.publish(
        "AllStudentsDataRequested",
        { id_tagihan: command.id_tagihan },
      );

      await new Promise<void>((resolve, reject) => {
        this.eventBus.subscribe(
          "AllStudentsDataRetrieved",
          async (studentsData: any) => {
            try {
              if (studentsData.data.status == "error") {
                throw new ApplicationError(
                  studentsData.data.code,
                  studentsData.data.message,
                );
              }
              const students = studentsData.data.students;
              console.log("DATA STUDENTS", students);
              students.forEach(async (student: any) => {
                let total_amount = command.total_amount;
                let discount = null;
                let discountID = null;
                if (student.status) {
                  discount = await this.discountRepository.getDiscountByName(student.status);
                  if (discount) {
                    total_amount = command.total_amount - (command.total_amount * discount.getPersentase() / 100);
                    discountID = discount.getId();
                  }
                }
                console.log("DISCOUNT", discount);
                const rounded_total_amount = Math.round(total_amount);
                const studentBillsData = new StudentBillsEntity<StudentBillsProps>({
                  id_student: student.id,
                  id_tagihan: command.id_tagihan,
                  id_discount: discountID,
                  total_paid: 0,
                  remaining_amount: rounded_total_amount,
                  payment_status: 'BELUM LUNAS',
                });
                console.log("STUDENT BILLS DATA", studentBillsData);
                await this.studentBillsRepository.addStudentBills(studentBillsData);
              });
              this.eventBus.removeSpecificListener("AllStudentsDataRetrieved");
              resolve();
            } catch (error) {
              reject();
              const appEr = error as ApplicationError;
              throw new ApplicationError(appEr.code, appEr.message);
            }
          }
        )
      });
    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}