import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../shared/abstract";


export interface StatusNominalProps {
  yatim: number;
  dhuafa: number;
  lainnya: number;
}

export interface SPPProps { 
  semester: string;
  tahun_ajaran: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  nominal: StatusNominalProps;
}

export interface PaymentTypeProps {
  id?: AggregateId;
  type: string;
  nama: string;
  rules: SPPProps;
  nomor_rekening: string;
}

export class PaymentTypeEntity<TProps extends PaymentTypeProps> extends AggregateRoot {
  private type: string;
  private nama: string;
  private rules: SPPProps;
  private nomor_rekening: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      type: this.type,
      nama: this.nama,
      rules: this.rules,
      nomor_rekening: this.nomor_rekening,
    } = props);
    this.validateInput();
  }

  getType(): string {
    return this.type;
  }

  getNama(): string {
    return this.nama;
  }

  getRules(): SPPProps {
    return this.rules;
  }

  getNomorRekening(): string {
    return this.nomor_rekening;
  }

  private validateInput(): void {
    if (!this.type) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Type tidak boleh kosong"
      );
    }

    if (!this.nama) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Nama tidak boleh kosong"
      );
    }

    if (!this.rules) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Rules tidak boleh kosong"
      );
    }

    if (!this.nomor_rekening) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Nomor rekening tidak boleh kosong"
      );
    }
  }
}