import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { IMasterDataQueryHandler } from "../../application/query";
import { MasterDataProps } from "../../domain/entity";
import { MasterDataQueryHandler } from "../../infrastructure/storage/query";

describe("Testing Master Data Query", () => {
    const mockMasterData: MasterDataProps[] = [
        {
            id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
            tipe: "Jenis Pembayaran",
            nilai: "Daftar Ujian",
            aturan: "Nomor Pendaftaran",
            deskripsi:
                "Jenis pembayaran untuk pendaftaran calon mahasiswa PIKTI",
        },
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Jenis Pembayaran",
            nilai: "Training",
            aturan: undefined,
            deskripsi: "Jenis pembayaran untuk pendaftaran training PIKTI",
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockMasterData),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let masterDataQueryHandler: IMasterDataQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.master_data = {
            findAll: mockData.findAll,
        } as any;
        masterDataQueryHandler = new MasterDataQueryHandler(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const masterDataType = "Jenis Pembayaran";
    describe("Get All Master Datas", () => {
        it("should success return all master datas", async () => {
            const masterDatas =
                await masterDataQueryHandler.getAllMasterDatasByType(
                    masterDataType,
                );

            expect(
                mockedDatabase.models.master_data.findAll,
            ).toHaveBeenCalledWith({ where: { tipe: masterDataType } });
            expect(masterDatas).toEqual(mockMasterData);
        });

        it("should error return all master datas", async () => {
            mockedDatabase.models.master_data.findAll = mockData.findAllError;

            try {
                await masterDataQueryHandler.getAllMasterDatasByType(
                    masterDataType,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.master_data.findAll,
                ).toHaveBeenCalledWith({ where: { tipe: masterDataType } });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
