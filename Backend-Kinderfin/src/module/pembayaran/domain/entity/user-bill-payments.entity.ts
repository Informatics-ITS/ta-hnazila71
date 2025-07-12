
import { StatusCodes } from "http-status-codes";
import {
  AggregateId,
  AggregateRoot,
  ApplicationError,
} from "../../../../shared/abstract";

export interface UserBillPaymentsProps { 
  id?: AggregateId;
  id_student_bill: string;
  id_payment_proof: string;
  amount_paid: number;
  component_paid: string;
  url_bukti_pembayaran: string;
  payment_date: Date;
  status: string;
}

export class UserBillPaymentsEntity<
  TProps extends UserBillPaymentsProps
  > extends AggregateRoot {

  private id_student_bill: string;
  private id_payment_proof: string;
  private amount_paid: number;
  private component_paid: string;
  private url_bukti_pembayaran: string;
  private payment_date: Date;
  private status: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      id_student_bill: this.id_student_bill,
      id_payment_proof: this.id_payment_proof,
      amount_paid: this.amount_paid,
      url_bukti_pembayaran: this.url_bukti_pembayaran,
      component_paid: this.component_paid,
      payment_date: this.payment_date,
      status: this.status,
    } = props)
  }

  getIdStudentBill(): string { 
    return this.id_student_bill; 
  }

  getIdPaymentProof(): string { 
    return this.id_payment_proof; 
  }

  getStatus(): string {
    return this.status;
  }

  getAmountPaid(): number { 
    return this.amount_paid; 
  }

  getComponentPaid(): string { 
    return this.component_paid; 
  }

  getPaymentDate(): Date {
    return this.payment_date;
  }

  getUrlBuktiPembayaran(): string { 
    return this.url_bukti_pembayaran; 
  }
}

