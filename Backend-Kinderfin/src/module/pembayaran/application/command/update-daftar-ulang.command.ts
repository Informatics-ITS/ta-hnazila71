import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { DaftarUlangProps } from "../../domain/entity";
import {
    IDaftarUlangRepository,
    IStudentBillsRepository,
    IDiscountRepository,
} from "../../domain/repository";
import { EventBus } from "../../../../shared/util";

export interface UpdateDaftarUlangCommand {
    id: string;
    updatedData: Partial<DaftarUlangProps>;
}

export class UpdateDaftarUlangCommandHandler
    implements ICommandHandler<UpdateDaftarUlangCommand, void>
{
    constructor(
        private readonly daftarUlangRepository: IDaftarUlangRepository,
        private readonly studentBillsRepository: IStudentBillsRepository,
        private readonly discountRepository: IDiscountRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: UpdateDaftarUlangCommand): Promise<void> {
        try {
            const { id, updatedData } = command;
            await this.daftarUlangRepository.updateDaftarUlang(id, updatedData);
            const total_amount =
                updatedData.biaya_perlengkapan! + updatedData.biaya_kegiatan!;
            this.eventBus.publish("AllStudentsDataRequested", {
                id_tagihan: id,
            });

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

                            for (const student of students) {
                                const discount =
                                    await this.discountRepository.getDiscountByName(
                                        student.status,
                                    );
                                const discountAmount = discount
                                    ? (total_amount *
                                          discount.getPersentase()) /
                                      100
                                    : 0;
                                const studentBills =
                                    await this.studentBillsRepository.getBillsByTagihanId(
                                        id,
                                    );

                                for (const bill of studentBills) {
                                    if (bill.id_student === student.id) {
                                        const remaining_amount =
                                            total_amount -
                                            discountAmount -
                                            bill.total_paid;
                                        const updatedBillData = {
                                            remaining_amount,
                                            payment_status:
                                                bill.total_paid >=
                                                total_amount - discountAmount
                                                    ? "LUNAS"
                                                    : "BELUM LUNAS",
                                        };

                                        if (bill.id) {
                                            await this.studentBillsRepository.updateStudentBills(
                                                bill.id,
                                                updatedBillData,
                                            );
                                        } else {
                                            throw new ApplicationError(
                                                404,
                                                "Bill ID is undefined",
                                            );
                                        }
                                    }
                                }
                            }
                            this.eventBus.removeSpecificListener(
                                "AllStudentsDataRetrieved",
                            );
                            resolve();
                        } catch (error) {
                            console.log(
                                "Error occurred during the update process",
                            );
                            reject();
                            const appErr = error as ApplicationError;
                            throw new ApplicationError(
                                appErr.code,
                                appErr.message,
                            );
                        }
                    },
                );
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
