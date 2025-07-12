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

const ErrorInvalidNipPattern = "Input nip hanya dapat berisi angka";
const ErrorInvalidFullNamePattern =
    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi";
const ErrorInvalidEmailPattern = "Format email salah";
const ErrorInvalidPasswordDigit =
    "Input password harus terdiri dari 8-20 karakter";
const ErrorInvalidPasswordPattern =
    "Input password harus berisi minimal satu huruf kecil, satu huruf besar, satu angka, dan satu karakter khusus";
const ErrorInvalidUserRole = "Role user tidak terdaftar";

export interface UserProps {
    id?: AggregateId;
    id_informasi_tambahan?: AggregateId;
    nip?: string;
    nama_lengkap?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    nama_bank?: string;
    pemilik_rekening?: string;
    nomor_rekening?: string;
    login_at?: Date;
}

export class UserEntity<TProps extends UserProps> extends AggregateRoot {
    private nip?: string;
    private nama_lengkap?: string;
    private id_informasi_tambahan?: AggregateId;
    private email?: string;
    private password?: string;
    private role?: UserRole;
    private akun_bank?: BankAccount;
    private login_at?: Date;

    constructor(props: TProps) {
        super(props.id);
        ({
            nip: this.nip,
            nama_lengkap: this.nama_lengkap,
            id_informasi_tambahan: this.id_informasi_tambahan,
            email: this.email,
            password: this.password,
            role: this.role,
            login_at: this.login_at,
        } = props);
        this.validateInput();
    }

    getId(): AggregateId {
        return this.id;
    }

    getNip(): string | undefined {
        return this.nip;
    }

    getNamaLengkap(): string | undefined {
        return this.nama_lengkap;
    }

    getIdInformasiTambahan(): AggregateId | undefined {
        return this.id_informasi_tambahan;
    }

    getEmail(): string | undefined {
        return this.email;
    }

    getPassword(): string | undefined {
        return this.password;
    }

    getRole(): UserRole | undefined {
        return this.role;
    }

    setAkunBank(bankAccountValue: BankAccount) {
        this.akun_bank = bankAccountValue;
    }

    getAkunBank(): BankAccount | undefined {
        return this.akun_bank;
    }

    getLoginAt(): Date | undefined {
        return this.login_at;
    }

    validateInput() {
        if (this.nip && !/^\d*$/.test(this.nip)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidNipPattern,
            );
        }
        if (this.nama_lengkap && !/^[a-zA-Z., ]*$/.test(this.nama_lengkap)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidFullNamePattern,
            );
        }
        if (
            this.email &&
            !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                this.email,
            )
        ) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidEmailPattern,
            );
        }
        if (
            this.password &&
            (this.password.length < 8 || this.password.length > 20)
        ) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidPasswordDigit,
            );
        }
        if (
            this.password &&
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\\-__+.]).+$/.test(
                this.password,
            )
        ) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidPasswordPattern,
            );
        }
        if (this.role && !Object.values(UserRole).includes(this.role)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidUserRole,
            );
        }
    }

    async setHashedPassword(passwordService: IPasswordService): Promise<void> {
        this.password = await passwordService.hashPassword(this.password!);
    }

    async checkPasswordMatch(
        passwordService: IPasswordService,
        hashedPassword: string,
    ): Promise<boolean> {
        return await passwordService.comparePassword(
            this.password!,
            hashedPassword,
        );
    }

    verifyBankNameMasterData(masterDatas: any): {
        constraint: string | undefined;
        err: Error | null;
    } {
        const bankNameData = masterDatas.find(
            (masterData: any) => masterData.nilai == this.getAkunBank()!.getNamaBank(),
        );

        if (bankNameData) {
            return { constraint: bankNameData.aturan, err: null };
        }
        return {
            constraint: bankNameData,
            err: Error("Nama bank tidak terdaftar"),
        };
    }
}
