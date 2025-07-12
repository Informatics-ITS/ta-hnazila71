import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { TotalFund } from "../../domain/value_object";

describe("Testing Fund Application Entity", () => {
    const mockFundApplication: FundApplicationProps = {
        id: "78bae457-6f69-44b6-83b0-fd6a38d69378",
        bulan: 10,
        tahun: 2023,
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1600000,
    };

    describe("Constructor New Fund Application Entity", () => {
        it("should success match new fund application entity", async () => {
            const newFundApplication =
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );

            expect(newFundApplication.getBulan()).toEqual(
                mockFundApplication.bulan,
            );
            expect(newFundApplication.getTahun()).toEqual(
                mockFundApplication.tahun,
            );
            expect(newFundApplication.getDeskripsi()).toEqual(
                mockFundApplication.deskripsi,
            );
            expect(newFundApplication.getUnit()).toEqual(
                mockFundApplication.unit,
            );
            expect(newFundApplication.getQuantity1()).toEqual(
                mockFundApplication.quantity_1,
            );
            expect(newFundApplication.getQuantity2()).toEqual(
                mockFundApplication.quantity_2,
            );
            expect(newFundApplication.getHargaSatuan()).toEqual(
                mockFundApplication.harga_satuan,
            );
        });

        it("should error match wrong price on new fund application entity", async () => {
            mockFundApplication.harga_satuan = -1;

            try {
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input harga satuan harus bernilai lebih dari 0",
                );
            }
        });

        it("should error match wrong quantity 2 on new fund application entity", async () => {
            mockFundApplication.quantity_2 = -1;

            try {
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input kuantitas harus bernilai lebih dari 0",
                );
            }
        });

        it("should error match wrong quantity 1 on new fund application entity", async () => {
            mockFundApplication.quantity_1 = -1;

            try {
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input kuantitas harus bernilai lebih dari 0",
                );
            }
        });

        it("should error match wrong year on new fund application entity", async () => {
            mockFundApplication.tahun = 1999;

            try {
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Tahun pengajuan dana tidak valid",
                );
            }
        });

        it("should error match wrong month on new fund application entity", async () => {
            mockFundApplication.bulan = 13;

            try {
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplication,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Bulan pengajuan dana tidak valid",
                );
            }
        });
    });

    const mockFundApplicationTotal: FundApplicationProps = {
        id: "78bae457-6f69-44b6-83b0-fd6a38d69378",
        bulan: 10,
        tahun: 2023,
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1600000,
    };
    const total = 1600000;
    describe("Calculate Fund Application Total", () => {
        it("should success set fund application total calculation", async () => {
            const newFundApplication =
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplicationTotal,
                );
            newFundApplication.calculateJumlah();

            expect(newFundApplication.getJumlah()).toEqual(
                new TotalFund(total),
            );
        });

        it("should success set old fund application total calculation", async () => {
            mockFundApplicationTotal.quantity_1 =
                mockFundApplicationTotal.quantity_2 =
                mockFundApplicationTotal.harga_satuan =
                    undefined;
            mockFundApplication.quantity_1 = mockFundApplication.quantity_2 = 1;
            mockFundApplication.harga_satuan = 1600000;

            const newFundApplication =
                new FundApplicationEntity<FundApplicationProps>(
                    mockFundApplicationTotal,
                );
            newFundApplication.calculateJumlah(mockFundApplication);

            expect(newFundApplication.getJumlah()).toEqual(
                new TotalFund(total),
            );
        });

        it("should error set undefined old fund application total calculation", async () => {
            try {
                const newFundApplication =
                    new FundApplicationEntity<FundApplicationProps>(
                        mockFundApplicationTotal,
                    );
                newFundApplication.calculateJumlah(undefined);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jumlah pengajuan dana harus bernilai lebih dari 0",
                );
            }
        });

        const masterDatas = [
            {
                id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
                tipe: "Unit",
                nilai: "Bulan",
                deskripsi: "Unit Per Bulan",
            },
            {
                id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
                tipe: "Unit",
                nilai: "OB",
                deskripsi: "Unit Orang Bulan",
            },
        ];

        describe("Verify Unit Master Data", () => {
            it("should success return true verification", async () => {
                const newFundApplication =
                    new FundApplicationEntity<FundApplicationProps>(
                        mockFundApplicationTotal,
                    );
                const result =
                    newFundApplication.verifyUnitMasterData(masterDatas);

                expect(result).toBeNull();
            });

            it("should success return false verification", async () => {
                mockFundApplicationTotal.unit = "Wrong Unit";
                const newFundApplication =
                    new FundApplicationEntity<FundApplicationProps>(
                        mockFundApplicationTotal,
                    );
                const result =
                    newFundApplication.verifyUnitMasterData(masterDatas);

                expect(result?.message).toEqual("Data unit tidak terdaftar");
            });
        });
    });
});
