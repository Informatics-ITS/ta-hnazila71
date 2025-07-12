import { AggregateId } from "../../../../shared/abstract";
import { UserBillPaymentsEntity, UserBillPaymentsProps } from "../entity";


type DetailUserBillPaymentProps = {
  id_user_bill_payment: string;
  id_orang_tua: string;
  id_student_bill: string;
  id_payment_proof: string;
  status: string;
  amount_paid: number;
  component_paid: string;
  url_bukti_pembayaran: string;
  payment_date: string;
  nama_tagihan: string;
  nama_siswa: string;
  orang_tua: string;
  catatan: string;
};


export interface IUserBillPaymentsRepository {
  addUserBillPayments(userBillPaymentsData: UserBillPaymentsEntity<UserBillPaymentsProps>): Promise<void>;
  getHistoryPayment(parentId: AggregateId): Promise<DetailUserBillPaymentProps[]>;
  getAllHistoryPayments(): Promise<DetailUserBillPaymentProps[]>;
  getPaymentById(id: AggregateId): Promise<DetailUserBillPaymentProps>;
  updateStatusPayment(id: AggregateId, status: string, catatan: string): Promise<void>;
  updateStatusDaftarUlangPayment(id: AggregateId, status: string, catatan:string): Promise<void>
  deleteAllHistoryPayments(): Promise<void>;
  deleteHistoryPaymentById(id: AggregateId): Promise<void>;
  getDaftarUlangHistoryPaymentByParents(parentId: AggregateId): Promise<DetailUserBillPaymentProps[]>
  getDaftarUlangHistoryPayment(): Promise<DetailUserBillPaymentProps[]>
}