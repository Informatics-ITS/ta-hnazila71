import { StudentBillsProps } from "../../domain/entity";

export interface IStudentBillsQueryHandler {
    getBillsByStudentId(studentId: string): Promise<StudentBillsProps[]>;
    getBillsByTagihanId(tagihanId: string): Promise<StudentBillsProps[]>;
}