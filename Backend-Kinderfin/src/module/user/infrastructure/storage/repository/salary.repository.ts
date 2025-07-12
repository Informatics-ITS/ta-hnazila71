import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../../shared/abstract";
import { SalaryEntity, SalaryProps } from "../../../domain/entity";
import { ISalaryRepository } from "../../../domain/repository";

export class SalaryRepository implements ISalaryRepository {
    constructor(private readonly dbConn: Sequelize) {}

    async addSalary(salaryData: SalaryEntity<SalaryProps>): Promise<void> {
        try {
            await this.dbConn.models["gaji"].create({
                ...(salaryData as any),
                id_user: salaryData.getUserId(),
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updateSalary(
        salaryData: SalaryEntity<SalaryProps>,
        oldSalary: SalaryProps | null,
    ): Promise<void> {
        try {
            await this.dbConn.transaction(async (t) => {
                if (oldSalary) {
                    await this.dbConn.models["gaji"].destroy({
                        where: {
                            id: oldSalary.id,
                        },
                        transaction: t,
                    });
                }
                await this.dbConn.models["gaji"].create(
                    {
                        ...(salaryData as any),
                        id_user: salaryData.getUserId(),
                    },
                    { transaction: t },
                );
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deleteSalary(id: string): Promise<void> {
        try {
            await this.dbConn.models["gaji"].destroy({
                where: {
                    id : id,
                },
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isSalaryDataExist(
        id: string
    ): Promise<SalaryProps | null> {
        try {
            const salary: any = await this.dbConn.models["gaji"].findOne({
                where: {
                    id: id,
                }
            });
            return salary as SalaryProps;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
