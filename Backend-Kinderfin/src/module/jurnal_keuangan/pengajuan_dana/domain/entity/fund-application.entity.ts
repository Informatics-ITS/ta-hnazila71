import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    AggregateRoot,
    ApplicationError,
} from "../../../../../shared/abstract";
import { TotalFund } from "../value_object";

const ErrorInvalidFundApplicationMonth = "Bulan pengajuan dana tidak valid";
const ErrorInvalidFundApplicationYear = "Tahun pengajuan dana tidak valid";
const ErrorInvalidQuantityAmount =
    "Input kuantitas harus bernilai lebih dari 0";
const ErrorInvalidPriceAmount =
    "Input harga satuan harus bernilai lebih dari 0";

export interface FundApplicationProps {
    id?: AggregateId;
    bulan?: number;
    tahun?: number;
    deskripsi?: string;
    unit?: string;
    quantity_1?: number;
    quantity_2?: number;
    harga_satuan?: number;
    jumlah?: number;
}

export class FundApplicationEntity<
    TProps extends FundApplicationProps,
> extends AggregateRoot {
    private bulan?: number;
    private tahun?: number;
    private deskripsi?: string;
    private unit?: string;
    private quantity_1?: number;
    private quantity_2?: number;
    private harga_satuan?: number;
    private jumlah?: TotalFund;

    constructor(props: TProps) {
        super(props.id);
        ({
            bulan: this.bulan,
            tahun: this.tahun,
            deskripsi: this.deskripsi,
            unit: this.unit,
            quantity_1: this.quantity_1,
            quantity_2: this.quantity_2,
            harga_satuan: this.harga_satuan,
        } = props);
        this.validateInput();
    }

    getBulan(): number | undefined {
        return this.bulan;
    }

    getTahun(): number | undefined {
        return this.tahun;
    }

    getDeskripsi(): string | undefined {
        return this.deskripsi;
    }

    getUnit(): string | undefined {
        return this.unit;
    }

    getQuantity1(): number | undefined {
        return this.quantity_1;
    }

    getQuantity2(): number | undefined {
        return this.quantity_2;
    }

    getHargaSatuan(): number | undefined {
        return this.harga_satuan;
    }

    getJumlah(): TotalFund | undefined {
        return this.jumlah;
    }

    validateInput() {
        if (this.bulan && (this.bulan < 1 || this.bulan > 12)) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidFundApplicationMonth,
            );
        }
        if (this.tahun && this.tahun < 2000) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidFundApplicationYear,
            );
        }
        if (this.quantity_1 != undefined && this.quantity_1 <= 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidQuantityAmount,
            );
        }
        if (this.quantity_2 != undefined && this.quantity_2 <= 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidQuantityAmount,
            );
        }
        if (this.harga_satuan != undefined && this.harga_satuan <= 0) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                ErrorInvalidPriceAmount,
            );
        }
    }

    verifyUnitMasterData(masterDatas: any): Error | null {
        return masterDatas.some(
            (masterData: any) => masterData.nilai == this.getUnit(),
        )
            ? null
            : Error("Data unit tidak terdaftar");
    }

    calculateJumlah(oldFundApplication?: FundApplicationProps): void {
        this.jumlah = new TotalFund(
            (this.getQuantity1() ?? oldFundApplication?.quantity_1!) *
                (this.getQuantity2() ?? oldFundApplication?.quantity_2!) *
                (this.getHargaSatuan() ?? oldFundApplication?.harga_satuan!),
        );
    }
}
