import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { BalanceSheetEntity, BalanceSheetProps } from "../../domain/entity";

describe("Testing Balance Sheet Entity", () => {
    let year = 2023;
    const balanceSheetData: BalanceSheetProps = {
        kas: 12000000,
        piutang_usaha: 1000000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        pendapatan_yang_belum_diterima: 0,
        hutang_usaha: 500000,
        hutang_bank: 700000,
        laba_ditahan: 12250000,
    };

    describe("Constructor New Balance Sheet Entity", () => {
        it("should success match new balance sheet entity", async () => {
            const newBalanceSheet = new BalanceSheetEntity(year);

            expect(newBalanceSheet.getTahun()).toEqual(year);
        });

        it("should error match wrong year on new balance sheet entity", async () => {
            year = 1999;

            try {
                new BalanceSheetEntity(year);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Tahun neraca keuangan tidak valid",
                );
            }
        });
    });

    describe("Calculate Balance Sheet", () => {
        it("should success set balance sheet calculation", async () => {
            year = 2023;
            const newBalanceSheet = new BalanceSheetEntity(year);
            newBalanceSheet.calculateBalanceSheetData(balanceSheetData);

            expect(newBalanceSheet.getAktiva()?.getKas()).toEqual(
                balanceSheetData.kas,
            );
            expect(newBalanceSheet.getAktiva()?.getPiutangUsaha()).toEqual(
                balanceSheetData.piutang_usaha,
            );
            expect(newBalanceSheet.getAktiva()?.getInventaris()).toEqual(
                balanceSheetData.inventaris,
            );
            expect(
                newBalanceSheet.getAktiva()?.getPenyusutanInventaris(),
            ).toEqual(balanceSheetData.penyusutan_inventaris);
            expect(
                newBalanceSheet.getAktiva()?.getPendapatanBelumDiterima(),
            ).toEqual(balanceSheetData.pendapatan_yang_belum_diterima);
            expect(newBalanceSheet.getTotalAktiva()).toEqual(13450000);
            expect(newBalanceSheet.getPasiva()?.getHutangUsaha()).toEqual(
                balanceSheetData.hutang_usaha,
            );
            expect(newBalanceSheet.getPasiva()?.getHutangBank()).toEqual(
                balanceSheetData.hutang_bank,
            );
            expect(newBalanceSheet.getPasiva()?.getLabaDitahan()).toEqual(
                balanceSheetData.laba_ditahan,
            );
            expect(newBalanceSheet.getTotalPasiva()).toEqual(13450000);
        });

        it("should success set empty balance sheet calculation", async () => {
            const newBalanceSheet = new BalanceSheetEntity(year);
            newBalanceSheet.calculateBalanceSheetData({} as BalanceSheetProps);

            expect(newBalanceSheet.getAktiva()?.getKas()).toEqual(0);
            expect(newBalanceSheet.getAktiva()?.getPiutangUsaha()).toEqual(0);
            expect(newBalanceSheet.getAktiva()?.getInventaris()).toEqual(0);
            expect(
                newBalanceSheet.getAktiva()?.getPenyusutanInventaris(),
            ).toEqual(0);
            expect(
                newBalanceSheet.getAktiva()?.getPendapatanBelumDiterima(),
            ).toEqual(0);
            expect(newBalanceSheet.getTotalAktiva()).toEqual(0);
            expect(newBalanceSheet.getPasiva()?.getHutangUsaha()).toEqual(0);
            expect(newBalanceSheet.getPasiva()?.getHutangBank()).toEqual(0);
            expect(newBalanceSheet.getPasiva()?.getLabaDitahan()).toEqual(0);
            expect(newBalanceSheet.getTotalPasiva()).toEqual(0);
        });
    });
});
