import { StatusCodes } from "http-status-codes";
import { logger } from "../../../../shared/util";
import { AggregateId, AggregateRoot, ApplicationError } from "../../../../shared/abstract";

const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";


export interface PPDBProps {
  id?: AggregateId;
  user_id?: string;
  nik?: string;
  nama_lengkap?: string;
  tanggal_lahir?: Date;
  tempat_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  kelas?: string;
  url_file_akta?: string;
  url_file_kk?: string;
  status?: string;
  is_verified?: string;
  catatan?: Text;
  tahun_ajaran?: string;
}

export class PPDBEntity<TProps extends PPDBProps> extends AggregateRoot {
  private user_id?: string;
  private nik?: string;
  private nama_lengkap?: string;
  private tanggal_lahir?: Date;
  private tempat_lahir?: string;
  private jenis_kelamin?: string;
  private alamat?: string;
  private kelas?: string;
  private url_file_akta?: string;
  private url_file_kk?: string;
  private status?: string;
  private is_verified?: string;
  private catatan?: Text;
  private tahun_ajaran?: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      user_id: this.user_id,
      nik: this.nik,
      nama_lengkap: this.nama_lengkap,
      tanggal_lahir: this.tanggal_lahir,
      tempat_lahir: this.tempat_lahir,
      jenis_kelamin: this.jenis_kelamin,
      alamat: this.alamat,
      kelas: this.kelas,
      url_file_akta: this.url_file_akta,
      url_file_kk: this.url_file_kk,
      status: this.status,
      is_verified: this.is_verified,
      catatan: this.catatan,
      tahun_ajaran: this.tahun_ajaran,
    } = props);
    this.validateInput();
  }

  getID(): string | undefined {
    return this.user_id;
  }

  getNamaLengkap(): string | undefined {
    return this.nama_lengkap;
  }

  getNIK(): string | undefined {
    return this.nik;
  }

  getTanggalLahir(): Date | undefined {
    return this.tanggal_lahir;
  }

  getTempatLahir(): string | undefined {
    return this.tempat_lahir;
  }

  getJenisKelamin(): string | undefined {
    return this.jenis_kelamin;
  }

  getAlamat(): string | undefined {
    return this.alamat;
  }

  getKelas(): string | undefined {
    return this.kelas;
  }

  getUrlAkta(): string | undefined {
    return this.url_file_akta;
  }

  getUrlKK(): string | undefined {
    return this.url_file_kk;
  }

  getStatus(): string | undefined {
    return this.status;
  }

  getIs_verified(): string | undefined {
    return this.is_verified;
  }

  getCatatan(): Text | undefined {
    return this.catatan;
  }

  getTahunAjaran(): string | undefined {
    return this.tahun_ajaran;
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