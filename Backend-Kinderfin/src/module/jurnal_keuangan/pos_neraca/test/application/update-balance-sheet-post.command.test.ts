import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import {
    UpdateBalanceSheetPostCommand,
    UpdateBalanceSheetPostCommandHandler,
} from "../../application/command";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import { BalanceSheetPostService } from "../../domain/service";
import { BalanceSheetPostRepository } from "../../infrastructure/storage/repository";

describe("Testing Update Balance Sheet Post Command", () => {
    const oldBalanceSheetPostData: BalanceSheetPostProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tahun_pos_neraca: 2022,
        saldo_tahun_lalu: 3000000,
        saldo_penerimaan_program_reguler: 5000000,
        saldo_kerja_sama: 2000000,
        kas: 10000000,
        piutang_usaha: 800000,
        inventaris: 500000,
        penyusutan_inventaris: 50000,
        pendapatan_yang_belum_diterima: undefined,
        hutang_usaha: 400000,
        hutang_bank: 600000,
        laba_ditahan: 10250000,
    };

    const balanceSheetPostDataRequested: UpdateBalanceSheetPostCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tahun_pos_neraca: 2023,
        saldo_penerimaan_program_reguler: 7000000,
    };

    const balanceSheetPostDataResult =
        new BalanceSheetPostEntity<BalanceSheetPostProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            tahun_pos_neraca: 2023,
            saldo_penerimaan_program_reguler: 7000000,
        } as BalanceSheetPostProps);
    balanceSheetPostDataResult.calculateCash(oldBalanceSheetPostData);
    balanceSheetPostDataResult.validateStability(oldBalanceSheetPostData);

    const mockData = {
        balanceSheetPostDataIdExist: jest
            .fn()
            .mockReturnValue(oldBalanceSheetPostData),
        balanceSheetPostDataIdNotExist: jest.fn().mockReturnValue(null),
        balanceSheetPostDataYearExist: jest
            .fn()
            .mockReturnValue(Error("Data pos neraca 2023 telah dimasukkan")),
        balanceSheetPostDataYearNotExist: jest.fn().mockReturnValue(null),
        updateBalanceSheetPost: jest.fn(),
        updateBalanceSheetPostError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let balanceSheetPostRepository: IBalanceSheetPostRepository;
    let updateBalanceSheetPostCommandHandler: ICommandHandler<
        UpdateBalanceSheetPostCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        balanceSheetPostRepository = new BalanceSheetPostRepository(
            mockedDatabase,
        );
        balanceSheetPostRepository = {
            isBalanceSheetPostDataIdExist: mockData.balanceSheetPostDataIdExist,
            updateBalanceSheetPost: mockData.updateBalanceSheetPost,
        } as any;
        updateBalanceSheetPostCommandHandler =
            new UpdateBalanceSheetPostCommandHandler(
                balanceSheetPostRepository,
            );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedBalanceSheetPostService: jest.MockedClass<
        typeof BalanceSheetPostService
    >;
    const [balanceSheetPostId, balanceSheetPostYear] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        2023,
    ];
    describe("Execute Update Balance Sheet Post", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedBalanceSheetPostService =
                BalanceSheetPostService as jest.MockedClass<
                    typeof BalanceSheetPostService
                >;
            mockedBalanceSheetPostService.prototype.validateUniqueBalanceSheetYear =
                mockData.balanceSheetPostDataYearNotExist;
        });
        it("should success execute update balance sheet post", async () => {
            await updateBalanceSheetPostCommandHandler.execute(
                balanceSheetPostDataRequested,
            );

            expect(
                balanceSheetPostRepository.isBalanceSheetPostDataIdExist,
            ).toHaveBeenCalledWith(balanceSheetPostId);
            expect(
                mockedBalanceSheetPostService.prototype
                    .validateUniqueBalanceSheetYear,
            ).toHaveBeenCalledWith(
                balanceSheetPostYear,
                balanceSheetPostRepository,
            );
            expect(
                balanceSheetPostRepository.updateBalanceSheetPost,
            ).toHaveBeenCalledWith(balanceSheetPostDataResult);
        });

        it("should error execute update balance sheet post", async () => {
            balanceSheetPostRepository.updateBalanceSheetPost =
                mockData.updateBalanceSheetPostError;

            try {
                await updateBalanceSheetPostCommandHandler.execute(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    balanceSheetPostRepository.isBalanceSheetPostDataIdExist,
                ).toHaveBeenCalledWith(balanceSheetPostId);
                expect(
                    mockedBalanceSheetPostService.prototype
                        .validateUniqueBalanceSheetYear,
                ).toHaveBeenCalledWith(
                    balanceSheetPostYear,
                    balanceSheetPostRepository,
                );
                expect(
                    balanceSheetPostRepository.updateBalanceSheetPost,
                ).toHaveBeenCalledWith(balanceSheetPostDataResult);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update balance sheet post on duplicate balance sheet post", async () => {
            mockedBalanceSheetPostService.prototype.validateUniqueBalanceSheetYear =
                mockData.balanceSheetPostDataYearExist;

            try {
                await updateBalanceSheetPostCommandHandler.execute(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    balanceSheetPostRepository.isBalanceSheetPostDataIdExist,
                ).toHaveBeenCalledWith(balanceSheetPostId);
                expect(
                    mockedBalanceSheetPostService.prototype
                        .validateUniqueBalanceSheetYear,
                ).toHaveBeenCalledWith(
                    balanceSheetPostYear,
                    balanceSheetPostRepository,
                );
                expect(
                    balanceSheetPostRepository.updateBalanceSheetPost,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    `Data pos neraca ${balanceSheetPostYear} telah dimasukkan`,
                );
            }
        });

        it("should error execute update balance sheet post on balance sheet post not found", async () => {
            balanceSheetPostRepository.isBalanceSheetPostDataIdExist =
                mockData.balanceSheetPostDataIdNotExist;

            try {
                await updateBalanceSheetPostCommandHandler.execute(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    balanceSheetPostRepository.isBalanceSheetPostDataIdExist,
                ).toHaveBeenCalledWith(balanceSheetPostId);
                expect(
                    mockedBalanceSheetPostService.prototype
                        .validateUniqueBalanceSheetYear,
                ).not.toHaveBeenCalled();
                expect(
                    balanceSheetPostRepository.updateBalanceSheetPost,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data pos neraca tidak ditemukan",
                );
            }
        });
    });
});
