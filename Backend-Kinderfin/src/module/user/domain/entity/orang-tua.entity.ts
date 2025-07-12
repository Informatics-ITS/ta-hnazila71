import { StatusCodes } from "http-status-codes";
import {
  AggregateId,
  AggregateRoot,
  ApplicationError,
} from "../../../../shared/abstract";
import { UserRole } from "../enum";
import { IPasswordService } from "../service";

const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidEmailPattern = "Format email salah";
const ErrorInvalidPasswordDigit =
    "Input password harus terdiri dari 8-20 karakter";
const ErrorInvalidPasswordPattern =
    "Input password harus berisi minimal satu huruf kecil, satu huruf besar, satu angka, dan satu karakter khusus";
const ErrorInvalidUserRole = "Role user tidak terdaftar";


export interface OrangTuaProps {
  id?: AggregateId;
  ayah?: string;
  pekerjaan_ayah?: string;
  ibu?: string;
  pekerjaan_ibu?: string;
  alamat?: string;
  no_telepon?: string;
}

export class OrangTuaEntity<TProps extends OrangTuaProps> extends AggregateRoot {
  private ayah?: string;
  private pekerjaan_ayah?: string;
  private ibu?: string;
  private pekerjaan_ibu?: string;
  private alamat?: string;
  private no_telepon?: string;

  constructor(props: TProps) {
    super(props.id);
    ({
      ayah: this.ayah,
      pekerjaan_ayah: this.pekerjaan_ayah,
      ibu: this.ibu,
      pekerjaan_ibu: this.pekerjaan_ibu,
      alamat: this.alamat,
      no_telepon: this.no_telepon,
    } = props);
    this.validateInput();
  }

  getAyah(): string | undefined {
    return this.ayah;
  }

  getPekerjaanAyah(): string | undefined {
    return this.pekerjaan_ayah;
  }

  getIbu(): string | undefined {
    return this.ibu;
  }

  getPekerjaanIbu(): string | undefined {
    return this.pekerjaan_ibu;
  }

  getAlamat(): string | undefined {
    return this.alamat;
  }

  getNoTelepon(): string | undefined {
    return this.no_telepon;
  }
  

  validateInput() {
    if (this.ayah && !/^[a-zA-Z., ]*$/.test(this.ayah)) {
      throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          ErrorInvalidFullNamePattern,
      );
    }
    if (this.ibu && !/^[a-zA-Z., ]*$/.test(this.ibu)) {
      throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          ErrorInvalidFullNamePattern,
      );
    }
  }
}