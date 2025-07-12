import { StatusCodes } from "http-status-codes";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../shared/abstract";

export interface DiscountProps {
  id?: AggregateId;
  nama: string;
  persentase: number;
}

export class DiscountEntity<
  TProps extends DiscountProps
  > extends AggregateRoot {

  private nama: string;
  private persentase: number;

  constructor(props: TProps) {
    super(props.id);
    ({
      nama: this.nama,
      persentase: this.persentase
    } = props)
  }

  getId(): string {
    return this.id;
  }

  getNama(): string {
    return this.nama;
  }

  getPersentase(): number {
    return this.persentase;
  }
}