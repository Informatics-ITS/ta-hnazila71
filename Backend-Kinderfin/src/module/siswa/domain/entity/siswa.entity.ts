import { StatusCodes } from "http-status-codes";
import { logger } from "../../../../shared/util";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../shared/abstract";


const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";

export interface SiswaProps {
  id_ppdb?: string;
  id_orang_tua?: string;
  id?: AggregateId;
  nama_lengkap?: string;
  tanggal_lahir?: Date;
  alamat?: string;
  jenis_kelamin?: string;
  status?: string;
  grade?: string;
}

export class SiswaEntity<TProps extends SiswaProps> extends AggregateRoot {
  private nama_lengkap?: string;
  private id_ppdb?: string;
  private id_orang_tua?: string;
  private tanggal_lahir?: Date;
  private alamat?: string;
  private jenis_kelamin?: string;
  private status?: string;
  private grade?: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      nama_lengkap: this.nama_lengkap,
      id_ppdb: this.id_ppdb,
      id_orang_tua: this.id_orang_tua,
      tanggal_lahir: this.tanggal_lahir,
      alamat: this.alamat,
      jenis_kelamin: this.jenis_kelamin,
      status: this.status,
      grade: this.grade,
    } = props);
    this.validateInput();
  }

  getIdPPDB(): string | undefined {
    return this.id_ppdb;
  }

  getNama(): string | undefined {
    return this.nama_lengkap;
  }

  getIdOrangTua(): string | undefined {
    return this.id_orang_tua;
  }

  getTanggalLahir(): Date | undefined {
    return this.tanggal_lahir;
  }

  getAlamat(): string | undefined {
    return this.alamat;
  }

  getJenisKelamin(): string | undefined {
    return this.jenis_kelamin;
  }

  getStatus(): string | undefined {
    return this.status;
  }

  getGrade(): string | undefined {
    return this.grade;
  }

  validateInput() { 
    if (this.nama_lengkap && !/^[a-zA-Z., ]*$/.test(this.nama_lengkap)) {
      throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          ErrorInvalidFullNamePattern,
      );
    }
  }
}