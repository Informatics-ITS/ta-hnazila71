import { StatusCodes } from "http-status-codes";
import { ApplicationError } from "../../../../../shared/abstract";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";

describe("Testing Fund Usage Entity", () => {
    const mockFundUsage: FundUsageProps = {
        id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    describe("Constructor New Fund Usage Entity", () => {
        it("should success match new fund usage entity", async () => {
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                mockFundUsage,
            );

            expect(newFundUsage.id).toEqual(mockFundUsage.id);
            expect(newFundUsage.getAktivitas()).toEqual(
                mockFundUsage.aktivitas,
            );
            expect(newFundUsage.getTanggal()).toEqual(mockFundUsage.tanggal);
            expect(newFundUsage.getPenerima()).toEqual(mockFundUsage.penerima);
            expect(newFundUsage.getSubAktivitas()).toEqual(
                mockFundUsage.sub_aktivitas,
            );
            expect(newFundUsage.getUraian()).toEqual(mockFundUsage.uraian);
            expect(newFundUsage.getJumlah()).toEqual(mockFundUsage.jumlah);
        });

        it("should error match wrong total on new fund usage entity", async () => {
            mockFundUsage.jumlah = -1;
            try {
                new FundUsageEntity<FundUsageProps>(mockFundUsage);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input jumlah harus bernilai lebih dari 0",
                );
            }
        });

        it("should error match wrong receiver on new fund usage entity", async () => {
            mockFundUsage.penerima = "Test User 1";
            try {
                new FundUsageEntity<FundUsageProps>(mockFundUsage);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input penerima hanya dapat berisi huruf, koma, titik, atau spasi",
                );
            }
        });
    });

    const mockFundUsageVerify: FundUsageProps = {
        id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const activityMasterDatas = [
        {
            id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
            tipe: "Aktivitas",
            nilai: "Honorarium",
            deskripsi: "Aktivitas untuk Honorarium",
        },
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Aktivitas",
            nilai: "Layanan Kantor",
            deskripsi: "Aktivitas untuk Layanan Kantor",
        },
    ];

    describe("Verify Activity Master Data", () => {
        it("should success return true verification", async () => {
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                mockFundUsageVerify,
            );
            const result =
                newFundUsage.verifyActivityMasterData(activityMasterDatas);

            expect(result).toBeNull();
        });

        it("should success return false verification", async () => {
            mockFundUsageVerify.aktivitas = "Wrong Activity";
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                mockFundUsageVerify,
            );
            const result =
                newFundUsage.verifyActivityMasterData(activityMasterDatas);

            expect(result?.message).toEqual(
                "Aktivitas keuangan tidak terdaftar",
            );
        });
    });

    const subActivityMasterDatas = [
        {
            id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
            tipe: "Sub Aktivitas",
            nilai: "HR Test",
            deskripsi: "Sub Aktivitas untuk Honorarium Test",
        },
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Sub Aktivitas",
            nilai: "Cetak KTM",
            deskripsi: "Sub Aktivitas untuk Cetak KTM",
        },
    ];

    describe("Verify Sub Activity Master Data", () => {
        it("should success return true verification", async () => {
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                mockFundUsageVerify,
            );
            const result = newFundUsage.verifySubActivityMasterData(
                subActivityMasterDatas,
            );

            expect(result).toBeNull();
        });

        it("should success return false verification", async () => {
            mockFundUsageVerify.sub_aktivitas = "Wrong Sub Activity";
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                mockFundUsageVerify,
            );
            const result = newFundUsage.verifySubActivityMasterData(
                subActivityMasterDatas,
            );

            expect(result?.message).toEqual(
                "Sub aktivitas keuangan tidak terdaftar",
            );
        });
    });
});
