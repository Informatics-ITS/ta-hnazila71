import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { StudentBillsEntity, StudentBillsProps } from "../../domain/entity";
import { IDiscountRepository, IStudentBillsRepository } from "../../domain/repository";

export interface AssignDaftarUlangBillToAllStudentCommand {
  id_tagihan: string;
  total_amount: number;
}

export class AssignDaftarUlangBillToAllStudentCommandHandler
  implements ICommandHandler<AssignDaftarUlangBillToAllStudentCommand, void> 
{
  constructor(
    private readonly studentBillsRepository: IStudentBillsRepository,
    private readonly discountRepository: IDiscountRepository,
    private readonly eventBus: EventBus,
  ) {}
  
  async execute(command: AssignDaftarUlangBillToAllStudentCommand): Promise<void> {
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
              if (studentsData.data.status === "error") {
                throw new ApplicationError(
                  studentsData.data.code,
                  studentsData.data.message,
                );
              }
              const students = studentsData.data.students;
              console.log("DATA STUDENTS", students);
              for (const student of students) {
                const discount = await this.discountRepository.getDiscountByName(student.status);
                if (!discount) {
                  throw new ApplicationError(404, "Discount not found for student status: " + student.status);
                }
                const total_amount = command.total_amount - (command.total_amount * discount.getPersentase() / 100);
                const rounded_total_amount = Math.round(total_amount);
                const studentBillsData = new StudentBillsEntity<StudentBillsProps>({
                  id_student: student.id,
                  id_tagihan: command.id_tagihan,
                  id_discount: discount.getId(),
                  total_paid: 0,
                  remaining_amount: rounded_total_amount,
                  payment_status: 'BELUM LUNAS',
                });
                console.log("STUDENT BILLS DATA", studentBillsData);
                await this.studentBillsRepository.addStudentBills(studentBillsData);
                console.log("Assign to student successful");
              }
              this.eventBus.removeSpecificListener("AllStudentsDataRetrieved");
              resolve();
            } catch (error) {
              console.log("Error occurred during assign process");
              reject();
              const appErr = error as ApplicationError;
              throw new ApplicationError(appErr.code, appErr.message);
            }
          }
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}
