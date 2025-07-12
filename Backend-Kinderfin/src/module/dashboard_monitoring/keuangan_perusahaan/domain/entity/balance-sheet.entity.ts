import { StatusCodes } from "http-status-codes";
import { AggregateRoot, ApplicationError } from "../../../../../shared/abstract";
import { Asset, Liability } from "../value_object";

const ErrorInvalidBalanceSheetYear =
    "Tahun neraca keuangan tidak valid";

export interface BalanceSheetProps {
    kas: number;
    piutang_usaha: number;
    inventaris: number;
    penyusutan_inventaris: number;
    pendapatan_yang_belum_diterima: number;
    hutang_usaha: number;
    hutang_bank: number;
    laba_ditahan: number;
}

export class BalanceSheetEntity extends AggregateRoot {
    private tahun: number;
    private aktiva?: Asset;
    private total_aktiva?: number;
    private pasiva?: Liability;
    private total_pasiva?: number;

    constructor(year: number) {
        super();
        this.tahun = year;
        this.validateInput();
    }

    getTahun(): number {
        return this.tahun;
    }

    getAktiva(): Asset | undefined {
        return this.aktiva;
    }

    setAktiva(assets: Asset) {
        this.aktiva = assets;
    }

    getTotalAktiva(): number | undefined {
        return this.total_aktiva;
    }

    setTotalAktiva(totalAssets: number) {
        this.total_aktiva = totalAssets;
    }

    getPasiva(): Liability | undefined {
        return this.pasiva;
    }

    setPasiva(liabilities: Liability) {
        this.pasiva = liabilities;
    }

    getTotalPasiva(): number | undefined {
        return this.total_pasiva;
    }

    setTotalPasiva(totalLiabilities: number) {
        this.total_pasiva = totalLiabilities;
    }

    validateInput() {
        if (this.tahun < 2000) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidBalanceSheetYear,
            );
        }
    }

    calculateBalanceSheetData(balanceSheetData: BalanceSheetProps) {
        if (Object.keys(balanceSheetData).length > 0) {
            const totalBalance =
                balanceSheetData.hutang_usaha +
                balanceSheetData.hutang_bank +
                balanceSheetData.laba_ditahan;
            this.aktiva = new Asset(
                balanceSheetData.kas,
                balanceSheetData.piutang_usaha,
                balanceSheetData.inventaris,
                balanceSheetData.penyusutan_inventaris,
                balanceSheetData.pendapatan_yang_belum_diterima,
            );
            this.total_aktiva = totalBalance;
            this.pasiva = new Liability(
                balanceSheetData.hutang_usaha,
                balanceSheetData.hutang_bank,
                balanceSheetData.laba_ditahan,
            );
            this.total_pasiva = totalBalance;
            return;
        }
        this.aktiva = new Asset(0, 0, 0, 0, 0);
        this.total_aktiva = 0;
        this.pasiva = new Liability(0, 0, 0);
        this.total_pasiva = 0;
    }
}
