import { StatusCodes } from "http-status-codes";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../../shared/abstract";
import { logger } from "../../../../../shared/util";

export interface PemasukanProps {
  id?: AggregateId;
  jenis_pemasukan: string;
  nama: string;
  nominal: number;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export class PemasukanEntity<TProps extends PemasukanProps> extends AggregateRoot {
  private jenis_pemasukan: string;
  private nama: string;
  private nominal: number;
  private user_id: string;
  private created_at?: Date;
  private updated_at?: Date;

  constructor(props: TProps) {
    super(props.id);
    ({
      jenis_pemasukan: this.jenis_pemasukan,
      nama: this.nama,
      nominal: this.nominal,
      user_id: this.user_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
    } = props);
    this.validateInput();
  }

  getId(): AggregateId {
    return this.id;
  }

  getJenispemasukan(): string {
    return this.jenis_pemasukan;
  }

  getNama(): string {
    return this.nama;
  }

  getNominal(): number {
    return this.nominal;
  }

  getUserId(): string {
    return this.user_id;
  }
  
  private validateInput() {
    if (!this.jenis_pemasukan) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Input jenis pemasukan diperlukan",
      );
    }
    if (!this.nama) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Input nama pemasukan diperlukan",
      );
    }
    if (!this.nominal) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Input nominal pemasukan diperlukan",
      );
    }
    if (!this.user_id) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "Input user id diperlukan",
      );
    }
  }
}