import { AggregateId } from "../../../../shared/abstract";
import { SPPEntity, SPPProps, StudentBillsEntity, StudentBillsProps, DaftarUlangEntity, DaftarUlangProps } from "../entity";

type BillCombinedProps = {
  studentBill: StudentBillsEntity<StudentBillsProps>;
  sppBill: SPPEntity<SPPProps>;
};

type DaftarUlangCombinedProps = {
  studentBill: StudentBillsEntity<StudentBillsProps>;
  daftarUlangBill: DaftarUlangEntity<DaftarUlangProps>;
};

export interface IStudentBillsRepository {
  addStudentBills(studentBillsData: StudentBillsEntity<StudentBillsProps>): Promise<void>;
  getStudentBillsById(id: AggregateId): Promise<BillCombinedProps>;
  updateStudentBillsWALAWE(studentBillsData: StudentBillsEntity<StudentBillsProps>, id: AggregateId): Promise<void>;
  getBillsByStudentId(studentId: AggregateId): Promise<StudentBillsProps[]>;
  getBillsByTagihanId(tagihanId: AggregateId): Promise<StudentBillsProps[]>;
  deleteStudentBillsByDaftarUlangId(daftarUlangId: AggregateId): Promise<void>;
  updateStudentBills(id: AggregateId, updatedData: Partial<StudentBillsProps>): Promise<void>;
  getBillsByParentId(parentId: AggregateId): Promise<StudentBillsProps[]>;
  getDaftarUlangBillsByParentId(parentId: AggregateId): Promise<StudentBillsProps[]>;
  setStudentsBillDiscountToNull(discountId: AggregateId): Promise<void>;
  setStudentBillIDTagihansToNull(sppId: AggregateId): Promise<void>;
  setDaftarUlangBillIDTagihanToNull(daftarUlangId: AggregateId): Promise<void>
  updateStudentBillTotalAmount(id: AggregateId, totalAmount: number): Promise<void>;
  updateStatusStudentBill(id: AggregateId, status: boolean): Promise<void>;
  updateStatusDaftarUlangStudentBill(id: AggregateId, status: boolean): Promise<void>
  getAllStudentBills(): Promise<StudentBillsProps[]>;
  getAllDaftarUlangStudentBills(): Promise<StudentBillsProps[]>
  getDaftarUlangBillsById(id: AggregateId): Promise<DaftarUlangCombinedProps>
}