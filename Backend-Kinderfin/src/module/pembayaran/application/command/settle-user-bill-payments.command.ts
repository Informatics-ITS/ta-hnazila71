import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { PaymentFileEntity, PaymentFileProps, PaymentProofEntity, PaymentProofProps, StudentBillsEntity, StudentBillsProps, UserBillPaymentsEntity, UserBillPaymentsProps } from "../../domain/entity";
import { IUserBillPaymentsRepository } from "../../domain/repository";
import { IPaymentProofRepository } from "../../domain/repository";
import { IStudentBillsRepository } from "../../domain/repository";
import { IFileService } from "../service";

export interface SettleUserBillPaymentsCommand {
  amount_paid: number;
  component_paid: string;
  id_student: string;
  id_student_bill: string;
  bukti_pembayaran: Express.Multer.File;
}

export class SettleUserBillPaymentsCommandHandler 
  implements ICommandHandler<SettleUserBillPaymentsCommand, void>
{
  constructor(
    private readonly userBillPaymentsRepository: IUserBillPaymentsRepository,
    private readonly studentBillRepository: IStudentBillsRepository,
    private readonly paymentProofRepository: IPaymentProofRepository,
    private readonly fileService: IFileService,
  ) { }
  
  async execute(command: SettleUserBillPaymentsCommand): Promise<void> {
    const { bukti_pembayaran, id_student, id_student_bill } = command;
    try {
      const filePembayaranDatas = await this.fileService.uploadFile(bukti_pembayaran);
      const paymentProof = new PaymentProofEntity<PaymentProofProps>({
        id_student: id_student,
        file_pembayaran: filePembayaranDatas,
      } as PaymentProofProps);

      const paymentProofData =  await this.paymentProofRepository.addPaymentProof(paymentProof);

      const newStudentBill = await this.studentBillRepository.getStudentBillsById(id_student_bill);

      if (newStudentBill.studentBill.getRemainingAmount() < command.amount_paid) {
        throw new ApplicationError(400, "Jumlah pembayaran tidak boleh melebihi sisa tagihan");
      }

      if (newStudentBill.studentBill.getPaymentStatus() === "LUNAS") {
        throw new ApplicationError(400, "Tagihan sudah lunas");
      }

      if (newStudentBill.sppBill.getDueDate() < new Date()) {
        throw new ApplicationError(400, "Tagihan sudah lewat tanggal jatuh tempo");
      }

      // const totalPaid = newStudentBill.studentBill.getTotalPaid() + command.amount_paid;
      // const remainingAmount = newStudentBill.studentBill.getRemainingAmount() - command.amount_paid;
      // const paymentStatus = remainingAmount === 0 ? "LUNAS" : "BELUM LUNAS";
      // const updatedStudentBill = new StudentBillsEntity<StudentBillsProps>({
      //   ...newStudentBill.studentBill,
      //   total_paid: totalPaid,
      //   remaining_amount: remainingAmount,
      //   payment_status: paymentStatus,
      // } as StudentBillsProps);


      // await this.studentBillRepository.updateStudentBillsWALAWE(updatedStudentBill, id_student_bill);
      await this.userBillPaymentsRepository.addUserBillPayments(
        new UserBillPaymentsEntity<UserBillPaymentsProps>({
          id_student_bill: id_student_bill,
          id_payment_proof: paymentProofData.getId(),
          url_bukti_pembayaran: paymentProofData.getFilePembayaran()?.getUrlAsli(),
          amount_paid: command.amount_paid,
          component_paid: command.component_paid,
        } as UserBillPaymentsProps),
      );


    } catch (error) {
      const appEr = error as ApplicationError;
      throw new ApplicationError(appEr.code, appEr.message);
    }
  }
}