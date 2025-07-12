import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { IStudentBillsQueryHandler } from "../../../application/query";
import { StudentBillsProps } from "../../../domain/entity";

export class StudentBillsQueryHandler implements IStudentBillsQueryHandler {
    constructor(private readonly dbConn: Sequelize) {}

    async getBillsByStudentId(studentId: string): Promise<StudentBillsProps[]> {
        try {
            const studentBills = await this.dbConn.models["student_bills"].findAll(
                {
                    where: { id_student: studentId },
                },
            );
            return studentBills.map((studentBill: any) => {
                return studentBill as StudentBillsProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getBillsByTagihanId(tagihanId: string): Promise<StudentBillsProps[]> {
        try {
            const studentBills = await this.dbConn.models["student_bills"].findAll(
                {
                    where: { id_tagihan: tagihanId },
                },
            );
            return studentBills.map((studentBill: any) => {
                return studentBill as StudentBillsProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}