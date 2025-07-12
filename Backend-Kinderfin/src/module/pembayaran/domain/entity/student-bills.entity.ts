import { StatusCodes } from "http-status-codes";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../shared/abstract";

export interface StudentBillsProps {
  id?: AggregateId;
  id_student: string;
  id_tagihan: string;
  id_discount: string | null;
  total_paid: number;
  remaining_amount: number;
  payment_status: string;
}

export class StudentBillsEntity<
  TProps extends StudentBillsProps
  > extends AggregateRoot {

  private id_student: string;
  private id_tagihan: string;
  private id_discount: string | null;
  private total_paid: number;
  private remaining_amount: number;
  private payment_status: string;

  constructor(props: TProps) {
    super(props.id);
    this.id_student = props.id_student;
    this.id_tagihan = props.id_tagihan;
    this.id_discount = props.id_discount ?? null;
    this.total_paid = props.total_paid;
    this.remaining_amount = props.remaining_amount;
    this.payment_status = props.payment_status;
  }

  getIdStudent(): string {
    return this.id_student;
  }

  getIdTagihan(): string {
    return this.id_tagihan;
  }

  getIdDiscount(): string | null {
    return this.id_discount;
  }

  setIdDiscount(id_discount: string | null): void {
    this.id_discount = id_discount;
  }

  getTotalPaid(): number {
    return this.total_paid;
  }

  getRemainingAmount(): number {
    return this.remaining_amount;
  }

  getPaymentStatus(): string {
    return this.payment_status;
  }

  setTotalPaid(total_paid: number): void {
    this.total_paid = total_paid;
  }

  setRemainingAmount(remaining_amount: number): void {
    this.remaining_amount = remaining_amount;
  }

  setPaymentStatus(payment_status: string): void {
    this.payment_status = payment_status;
  }

  payBill(amount: number): void {
    if (this.remaining_amount < amount) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Amount paid is more than remaining amount');
    }
    this.total_paid += amount;
    this.remaining_amount -= amount;
    if (this.remaining_amount === 0) {
      this.payment_status = 'Lunas';
    }
  }

  applyDiscount(discount: number): void {
    if (discount > this.total_paid) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Discount is more than total paid');
    }
    this.total_paid -= discount;
  }

  applyPenalty(penalty: number): void {
    this.remaining_amount += penalty;
  }

  applyExtraCharge(extra_charge: number): void {
    this.remaining_amount += extra_charge;
  }

  applyCredit(credit: number): void {
    this.total_paid += credit;
  }

  applyDebit(debit: number): void {
    if (this.remaining_amount < debit) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Debit is more than remaining amount');
    }
    this.remaining_amount -= debit;
  }

  applyRefund(refund: number): void {
    if (this.total_paid < refund) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Refund is more than total paid');
    }
    this.total_paid -= refund;
  }

  applyAdjustment(adjustment: number): void {
    this.total_paid += adjustment;
  }

  applyWaive(waive: number): void {
    if (this.remaining_amount < waive) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Waive is more than remaining amount');
    }
    this.remaining_amount -= waive;
  }

  applyReversal(reversal: number): void {
    if (this.total_paid < reversal) {
      throw new ApplicationError(StatusCodes.BAD_REQUEST, 'Reversal is more than total paid');
    }
    this.total_paid -= reversal;
  }

  applyReimbursement(reimbursement: number): void {
    this.total_paid += reimbursement;
  }

  applyRecovery(recovery: number): void {
    this.remaining_amount += recovery;
  }

  applyReconciliation(reconciliation: number): void {
    this.total_paid += reconciliation;
  }

  applySettlement(settlement: number): void {
    this.remaining_amount += settlement;
  }

  applyCompensation(compensation: number): void {
    this.total_paid += compensation;
  }

  
  
}