import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { Cash } from "../../domain/value_object";

describe("Testing Balance Sheet Post Entity", () => {
    const mockBalanceSheetPost: BalanceSheetPostProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tahun_pos_neraca: 2023,
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 7000000,
        saldo_kerja_sama: 2000000,
        piutang_usaha: 1000000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        hutang_usaha: 500000,
        hutang_bank: 700000,
    };

    describe("Constructor New Balance Sheet Post Entity", () => {
        it("should success match new balance sheet post entity", async () => {
            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );

            expect(newBalanceSheetPost.getTahunPosNeraca()).toEqual(
                mockBalanceSheetPost.tahun_pos_neraca,
            );
            expect(newBalanceSheetPost.getSaldoTahunLalu()).toEqual(
                mockBalanceSheetPost.saldo_tahun_lalu,
            );
            expect(
                newBalanceSheetPost.getSaldoPenerimaanProgramReguler(),
            ).toEqual(mockBalanceSheetPost.saldo_penerimaan_program_reguler);
            expect(newBalanceSheetPost.getSaldoKerjaSama()).toEqual(
                mockBalanceSheetPost.saldo_kerja_sama,
            );
            expect(newBalanceSheetPost.getPiutangUsaha()).toEqual(
                mockBalanceSheetPost.piutang_usaha,
            );
            expect(newBalanceSheetPost.getInventaris()).toEqual(
                mockBalanceSheetPost.inventaris,
            );
            expect(newBalanceSheetPost.getPenyusutanInventaris()).toEqual(
                mockBalanceSheetPost.penyusutan_inventaris,
            );
            expect(
                newBalanceSheetPost.getPendapatanYangBelumDiterima(),
            ).toEqual(mockBalanceSheetPost.pendapatan_yang_belum_diterima);
            expect(newBalanceSheetPost.getHutangUsaha()).toEqual(
                mockBalanceSheetPost.hutang_usaha,
            );
            expect(newBalanceSheetPost.getHutangBank()).toEqual(
                mockBalanceSheetPost.hutang_bank,
            );
            expect(newBalanceSheetPost.getLabaDitahan()).toEqual(
                mockBalanceSheetPost.laba_ditahan,
            );
        });

        it("should error match wrong bank loan on new balance sheet post entity", async () => {
            mockBalanceSheetPost.hutang_bank = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input hutang bank tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong accounts payable on new balance sheet post entity", async () => {
            mockBalanceSheetPost.hutang_usaha = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input hutang usaha tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong inventory shrinkage on new balance sheet post entity", async () => {
            mockBalanceSheetPost.penyusutan_inventaris = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input penyusutan inventaris tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong inventory on new balance sheet post entity", async () => {
            mockBalanceSheetPost.inventaris = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input inventaris tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong accounts receivable on new balance sheet post entity", async () => {
            mockBalanceSheetPost.piutang_usaha = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input piutang usaha tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong cooperation balance on new balance sheet post entity", async () => {
            mockBalanceSheetPost.saldo_kerja_sama = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input saldo kerja sama tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong regular program balance on new balance sheet post entity", async () => {
            mockBalanceSheetPost.saldo_penerimaan_program_reguler = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input saldo penerimaan program reguler tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong last year balance on new balance sheet post entity", async () => {
            mockBalanceSheetPost.saldo_tahun_lalu = -1;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input saldo tahun lalu tidak boleh bernilai negatif",
                );
            }
        });

        it("should error match wrong year on new balance sheet post entity", async () => {
            mockBalanceSheetPost.tahun_pos_neraca = 1999;

            try {
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPost,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Tahun pos neraca tidak valid");
            }
        });
    });

    const mockBalanceSheetPostCash: BalanceSheetPostProps = {
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 7000000,
        saldo_kerja_sama: 2000000,
    };
    const kas = 12000000;
    describe("Calculate Balance Sheet Post Cash", () => {
        it("should success set balance sheet post cash calculation", async () => {
            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostCash,
                );
            newBalanceSheetPost.calculateCash();

            expect(newBalanceSheetPost.getKas()).toEqual(new Cash(kas));
        });

        it("should success set old balance sheet post cash calculation", async () => {
            mockBalanceSheetPostCash.saldo_tahun_lalu =
                mockBalanceSheetPostCash.saldo_penerimaan_program_reguler =
                mockBalanceSheetPostCash.saldo_kerja_sama =
                    undefined;
            mockBalanceSheetPost.saldo_tahun_lalu = 3000000;
            mockBalanceSheetPost.saldo_penerimaan_program_reguler = 7000000;
            mockBalanceSheetPost.saldo_kerja_sama = 2000000;

            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostCash,
                );
            newBalanceSheetPost.calculateCash(mockBalanceSheetPost);

            expect(newBalanceSheetPost.getKas()).toEqual(new Cash(kas));
        });

        it("should error set undefined old balance sheet post cash calculation", async () => {
            try {
                const newBalanceSheetPost =
                    new BalanceSheetPostEntity<BalanceSheetPostProps>(
                        mockBalanceSheetPostCash,
                    );
                newBalanceSheetPost.calculateCash(undefined);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jumlah saldo harus bernilai lebih dari 0",
                );
            }
        });
    });

    const mockBalanceSheetPostStabilize: BalanceSheetPostProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tahun_pos_neraca: 2023,
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 7000000,
        saldo_kerja_sama: 2000000,
        piutang_usaha: 1000000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        hutang_usaha: 500000,
        hutang_bank: 700000,
    };
    describe("Validate Balance Sheet Post Stability", () => {
        it("should success stabilize balance sheet post liability", async () => {
            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostStabilize,
                );
            newBalanceSheetPost.calculateCash();
            newBalanceSheetPost.validateStability();

            expect(
                newBalanceSheetPost.getPendapatanYangBelumDiterima(),
            ).toBeUndefined();
            expect(newBalanceSheetPost.getLabaDitahan()).toEqual(12250000);
        });

        it("should success stabilize balance sheet post asset", async () => {
            mockBalanceSheetPostStabilize.saldo_tahun_lalu =
                mockBalanceSheetPostStabilize.saldo_penerimaan_program_reguler =
                mockBalanceSheetPostStabilize.saldo_kerja_sama =
                mockBalanceSheetPostStabilize.piutang_usaha =
                    10000;

            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostStabilize,
                );
            newBalanceSheetPost.calculateCash();
            newBalanceSheetPost.validateStability();

            expect(
                newBalanceSheetPost.getPendapatanYangBelumDiterima(),
            ).toEqual(710000);
            expect(newBalanceSheetPost.getLabaDitahan()).toBeUndefined();
        });

        it("should success set old balance sheet post cash calculation", async () => {
            mockBalanceSheetPostStabilize.piutang_usaha =
                mockBalanceSheetPostStabilize.inventaris =
                mockBalanceSheetPostStabilize.penyusutan_inventaris =
                mockBalanceSheetPostStabilize.hutang_usaha =
                mockBalanceSheetPostStabilize.hutang_bank =
                    undefined;
            mockBalanceSheetPost.kas = 12000000;
            mockBalanceSheetPost.piutang_usaha = 1000000;
            mockBalanceSheetPost.inventaris = 500000;
            mockBalanceSheetPost.penyusutan_inventaris = 50000;
            mockBalanceSheetPost.hutang_usaha = 500000;
            mockBalanceSheetPost.hutang_bank = 700000;

            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostStabilize,
                );
            newBalanceSheetPost.validateStability(mockBalanceSheetPost);

            expect(
                newBalanceSheetPost.getPendapatanYangBelumDiterima(),
            ).toBeUndefined();
            expect(newBalanceSheetPost.getLabaDitahan()).toEqual(12250000);
        });

        it("should error set undefined old balance sheet post cash calculation", async () => {
            const newBalanceSheetPost =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    mockBalanceSheetPostStabilize,
                );
            newBalanceSheetPost.validateStability(undefined);

            expect(
                newBalanceSheetPost.getPendapatanYangBelumDiterima(),
            ).toBeUndefined();
            expect(newBalanceSheetPost.getLabaDitahan()).toBeUndefined();
        });
    });
});
