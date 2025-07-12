import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { PaymentProofEntity, PaymentProofProps } from "../../../domain/entity";
import {
    IPaymentProofRepository,
    PaymentProofResult,
} from "../../../domain/repository";

export class PaymentProofRepository implements IPaymentProofRepository {
    constructor(private readonly dbConn: Sequelize) { }

    async addPaymentProof(
        paymentProofData: PaymentProofEntity<PaymentProofProps>,
    ): Promise<PaymentProofEntity<PaymentProofProps>> {
        try {
            const paymentFileData = paymentProofData.getFilePembayaran();
            const paymentProofDataCopy = paymentProofData; 
            // paymentProofData.deleteFilePembayaran();
            await this.dbConn.transaction(async (t) => {
                await this.dbConn.models["file_pembayaran"].create(
                    paymentFileData as any,
                    { transaction: t },
                );
                await this.dbConn.models["bukti_pembayaran"].create(
                    {
                        ...(paymentProofData as any),
                        id_file_pembayaran: paymentFileData?.getId(),
                    },
                    { transaction: t },
                );
            });

            console.log("URL FILE", paymentProofDataCopy.getFilePembayaran()?.getUrlAsli());

            return paymentProofDataCopy;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async updatePaymentProof(
        paymentProofData: PaymentProofEntity<PaymentProofProps>,
        oldPaymentFileId: string,
    ): Promise<void> {
        try {
            const paymentFileData = paymentProofData.getFilePembayaran();
            paymentProofData.deleteFilePembayaran();
            await this.dbConn.transaction(async (t) => {
                if (paymentFileData) {
                    await this.dbConn.models["file_pembayaran"].update(
                        paymentFileData as any,
                        { where: { id: oldPaymentFileId }, transaction: t },
                    );
                }
                await this.dbConn.models["bukti_pembayaran"].update(
                    {
                        ...paymentProofData,
                        id_file_pembayaran: paymentFileData?.getId(),
                    },
                    { where: { id: paymentProofData.id }, transaction: t },
                );
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async deletePaymentProof(
        paymentProofId: AggregateId,
        paymentFileId: string,
    ): Promise<void> {
        try {
            await this.dbConn.transaction(async (t) => {
                await this.dbConn.models["bukti_pembayaran"].destroy({
                    where: { id: paymentProofId },
                    transaction: t,
                });
                await this.dbConn.models["file_pembayaran"].destroy({
                    where: { id: paymentFileId },
                    transaction: t,
                });
            });
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }

    async isPaymentProofIdExist(
        paymentProofId: AggregateId,
    ): Promise<PaymentProofResult | null> {
        try {
            const paymentProof: any = await this.dbConn.models[
                "bukti_pembayaran"
            ].findByPk(paymentProofId);
            return paymentProof as PaymentProofResult;
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
