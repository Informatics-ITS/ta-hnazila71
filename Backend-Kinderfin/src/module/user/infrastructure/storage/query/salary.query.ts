import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { ISalaryQueryHandler } from "../../../application/query";
import { SalaryProps } from "../../../domain/entity";

export class SalaryQueryHandler implements ISalaryQueryHandler {
    constructor(private readonly dbConn: Sequelize) { }

    async getAllSalaries(page: number, limit: number): Promise<SalaryProps[]> {
        try {
            const salaries = await this.dbConn.models["gaji"].findAll(
                {},
            );
            return salaries.map((salary: any): SalaryProps => {
                return salary as SalaryProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async getSalariesById(page: number, limit: number, user_id: string): Promise<SalaryProps[]> {
        try {
            const salaries = await this.dbConn.models["gaji"].findAll({
                where: {
                    id_user: user_id,
                },
            });
            return salaries.map((salary: any): SalaryProps => {
                return salary as SalaryProps;
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
