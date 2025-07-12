import { PaymentProofProps } from "../../domain/entity";

export interface IPaymentProofQueryHandler {
    getAllPaymentProofs(): Promise<PaymentProofProps[]>;
}
