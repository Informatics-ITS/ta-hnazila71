import { StatusCodes } from "http-status-codes";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";

export interface DokumenProps {
  id?: AggregateId;
  url_akta_kelahiran?: string;
  url_kartu_keluarga?: string;
  ppdb_id?: string;
}

export class DokumenEntity<TProps extends DokumenProps> extends AggregateRoot {
  private url_akta_kelahiran?: string;
  private url_kartu_keluarga?: string;
  ppdb_id?: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      url_akta_kelahiran: this.url_akta_kelahiran,
      url_kartu_keluarga: this.url_kartu_keluarga,
      ppdb_id: this.ppdb_id,
    } = props);
    this.validateInput();
  }

  getId(): string {
    return this.id;
  }
  
  getUrlAktaKelahiran(): string | undefined {
    return this.url_akta_kelahiran;
  }

  getUrlKartuKeluarga(): string | undefined {
    return this.url_kartu_keluarga;
  }

  getPPDBId(): string | undefined {
    return this.ppdb_id;
  }

  private validateInput(): void {
    if (!this.url_akta_kelahiran) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "URL akta kelahiran tidak boleh kosong"
      );
    }

    if (!this.url_kartu_keluarga) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        "URL kartu keluarga tidak boleh kosong"
      );
    }
  }
}