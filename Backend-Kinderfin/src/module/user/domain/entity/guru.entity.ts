import { StatusCodes } from "http-status-codes";
import {
  AggregateId,
  AggregateRoot,
  ApplicationError,
} from "../../../../shared/abstract";
import { UserRole } from "../enum";
import { IPasswordService } from "../service";
import { BankAccount } from "../value_object";
import { logger } from "../../../../shared/util";

const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidEmailPattern = "Format email salah";
const ErrorInvalidPasswordDigit =
    "Input password harus terdiri dari 8-20 karakter";
const ErrorInvalidPasswordPattern =
    "Input password harus berisi minimal satu huruf kecil, satu huruf besar, satu angka, dan satu karakter khusus";
const ErrorInvalidUserRole = "Role user tidak terdaftar";

export interface GuruProps {
  id?: AggregateId;
  nip?: string;
  jabatan?: string;
  nama_lengkap?: string;
  nama_bank?: string;
  pemilik_rekening?: string;
  nomor_rekening?: string;
}



export class GuruEntity<TProps extends GuruProps> extends AggregateRoot {
  private nip?: string;
  private jabatan?: string;
  private nama_lengkap?: string;
  // private nama_bank?: string;
  // private pemilik_rekening?: string;
  // private nomor_rekening?: string;
  private akun_bank?: BankAccount;

  constructor(props: TProps) {
    super(props.id);
    ({
      nip: this.nip,
      jabatan: this.jabatan,
      nama_lengkap: this.nama_lengkap,
      // nama_bank: this.nama_bank,
      // pemilik_rekening: this.pemilik_rekening,
      // nomor_rekening: this.nomor_rekening,
    } = props);
    this.validateInput();
  }

  getNip(): string | undefined {
    return this.nip;
  }

  getJabatan(): string | undefined {
    return this.jabatan;
  }

  getNamaLengkap(): string | undefined {
    return this.nama_lengkap;
  }

  // getNamaBank(): string | undefined {
  //   return this.nama_bank;
  // }

  // getPemilikRekening(): string | undefined {
  //   return this.pemilik_rekening;
  // }

  // getNomorRekening(): string | undefined {
  //   return this.nomor_rekening;
  // }

  setAkunBank(bankAccountValue: BankAccount) {
        this.akun_bank = bankAccountValue;
    }

  getAkunBank(): BankAccount | undefined {
        return this.akun_bank;
    }


  validateInput() {
    if (this.nama_lengkap && !/^[a-zA-Z., ]*$/.test(this.nama_lengkap)) {
      throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          ErrorInvalidFullNamePattern,
      );
    }
  }

  verifyBankNameMasterData(masterDatas: any): {
      constraint: string | undefined;
      err: Error | null;
  } {
      const bankNameData = masterDatas.find(
          (masterData: any) => masterData.nilai == this.getAkunBank()!.getNamaBank(),
      );

    if (bankNameData) {
        logger.info(bankNameData);
          return { constraint: bankNameData.aturan, err: null };
      }
      return {
          constraint: bankNameData,
          err: Error("Nama bank tidak terdaftar"),
      };
  }
}