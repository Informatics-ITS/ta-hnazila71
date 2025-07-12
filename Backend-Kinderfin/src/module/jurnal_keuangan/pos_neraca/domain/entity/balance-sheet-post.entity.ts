import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../../shared/abstract";
import { Cash } from "../value_object";

const ErrorInvalidBalanceSheetPostYear = "Tahun pos neraca tidak valid";
const ErrorInvalidLastYearBalanceAmount =
    "Input saldo tahun lalu tidak boleh bernilai negatif";
const ErrorInvalidRegularProgramBalanceAmount =
    "Input saldo penerimaan program reguler tidak boleh bernilai negatif";
const ErrorInvalidCooperationBalanceAmount =
    "Input saldo kerja sama tidak boleh bernilai negatif";
const ErrorInvalidAccountsReceivableAmount =
    "Input piutang usaha tidak boleh bernilai negatif";
const ErrorInvalidInventoryAmount =
    "Input inventaris tidak boleh bernilai negatif";
const ErrorInvalidInventoryShrinkageAmount =
    "Input penyusutan inventaris tidak boleh bernilai negatif";
const ErrorInvalidAccountsPayableAmount =
    "Input hutang usaha tidak boleh bernilai negatif";
const ErrorInvalidBankLoanAmount =
    "Input hutang bank tidak boleh bernilai negatif";

export interface BalanceSheetPostProps {
    id?: AggregateId;
    tahun_pos_neraca?: number;
    saldo_tahun_lalu?: number;
    saldo_penerimaan_program_reguler?: number;
    saldo_kerja_sama?: number;
    kas?: number;
    piutang_usaha?: number;
    inventaris?: number;
    penyusutan_inventaris?: number;
    pendapatan_yang_belum_diterima?: number;
    hutang_usaha?: number;
    hutang_bank?: number;
    laba_ditahan?: number;
}

export class BalanceSheetPostEntity<
    TProps extends BalanceSheetPostProps,
> extends AggregateRoot {
    private tahun_pos_neraca?: number;
    private saldo_tahun_lalu?: number;
    private saldo_penerimaan_program_reguler?: number;
    private saldo_kerja_sama?: number;
    private kas?: Cash;
    private piutang_usaha?: number;
    private inventaris?: number;
    private penyusutan_inventaris?: number;
    private pendapatan_yang_belum_diterima?: number;
    private hutang_usaha?: number;
    private hutang_bank?: number;
    private laba_ditahan?: number;

    constructor(props: TProps) {
        super(props.id);
        ({
            tahun_pos_neraca: this.tahun_pos_neraca,
            saldo_tahun_lalu: this.saldo_tahun_lalu,
            saldo_penerimaan_program_reguler:
                this.saldo_penerimaan_program_reguler,
            saldo_kerja_sama: this.saldo_kerja_sama,
            piutang_usaha: this.piutang_usaha,
            inventaris: this.inventaris,
            penyusutan_inventaris: this.penyusutan_inventaris,
            hutang_usaha: this.hutang_usaha,
            hutang_bank: this.hutang_bank,
        } = props);
        this.validateInput();
    }

    getTahunPosNeraca(): number | undefined {
        return this.tahun_pos_neraca;
    }

    getSaldoTahunLalu(): number | undefined {
        return this.saldo_tahun_lalu;
    }

    getSaldoPenerimaanProgramReguler(): number | undefined {
        return this.saldo_penerimaan_program_reguler;
    }

    getSaldoKerjaSama(): number | undefined {
        return this.saldo_kerja_sama;
    }

    getKas(): Cash | undefined {
        return this.kas;
    }

    getPiutangUsaha(): number | undefined {
        return this.piutang_usaha;
    }

    getInventaris(): number | undefined {
        return this.inventaris;
    }

    getPenyusutanInventaris(): number | undefined {
        return this.penyusutan_inventaris;
    }

    getPendapatanYangBelumDiterima(): number | undefined {
        return this.pendapatan_yang_belum_diterima;
    }

    getHutangUsaha(): number | undefined {
        return this.hutang_usaha;
    }

    getHutangBank(): number | undefined {
        return this.hutang_bank;
    }

    getLabaDitahan(): number | undefined {
        return this.laba_ditahan;
    }

    validateInput() {
        if (this.tahun_pos_neraca && this.tahun_pos_neraca < 2000) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidBalanceSheetPostYear,
            );
        }
        if (this.saldo_tahun_lalu && this.saldo_tahun_lalu < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidLastYearBalanceAmount,
            );
        }
        if (
            this.saldo_penerimaan_program_reguler &&
            this.saldo_penerimaan_program_reguler < 0
        ) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidRegularProgramBalanceAmount,
            );
        }
        if (this.saldo_kerja_sama && this.saldo_kerja_sama <= 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidCooperationBalanceAmount,
            );
        }
        if (this.piutang_usaha && this.piutang_usaha < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidAccountsReceivableAmount,
            );
        }
        if (this.inventaris && this.inventaris < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidInventoryAmount,
            );
        }
        if (this.penyusutan_inventaris && this.penyusutan_inventaris < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidInventoryShrinkageAmount,
            );
        }
        if (this.hutang_usaha && this.hutang_usaha < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidAccountsPayableAmount,
            );
        }
        if (this.hutang_bank && this.hutang_bank < 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidBankLoanAmount,
            );
        }
    }

    calculateCash(oldBalanceSheetPost?: BalanceSheetPostProps) {
        this.kas = new Cash(
            (this.getSaldoTahunLalu() ??
                oldBalanceSheetPost?.saldo_tahun_lalu!) +
                (this.getSaldoPenerimaanProgramReguler() ??
                    oldBalanceSheetPost?.saldo_penerimaan_program_reguler!) +
                (this.getSaldoKerjaSama() ??
                    oldBalanceSheetPost?.saldo_kerja_sama!),
        );
    }

    validateStability(oldBalanceSheetPost?: BalanceSheetPostProps) {
        const difference =
            (this.getKas()?.getAmount() ?? oldBalanceSheetPost?.kas!) +
            (this.getPiutangUsaha() ?? oldBalanceSheetPost?.piutang_usaha!) +
            (this.getInventaris() ?? oldBalanceSheetPost?.inventaris!) -
            (this.getPenyusutanInventaris() ??
                oldBalanceSheetPost?.penyusutan_inventaris!) -
            ((this.getHutangUsaha() ?? oldBalanceSheetPost?.hutang_usaha!) +
                (this.getHutangBank() ?? oldBalanceSheetPost?.hutang_bank!));
        if (difference > 0) {
            this.laba_ditahan = difference;
        } else if (difference < 0) {
            this.pendapatan_yang_belum_diterima = -difference;
        }
    }
}
