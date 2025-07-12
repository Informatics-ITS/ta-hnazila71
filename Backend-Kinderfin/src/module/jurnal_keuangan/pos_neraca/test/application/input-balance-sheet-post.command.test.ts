import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import {
    InputBalanceSheetPostCommand,
    InputBalanceSheetPostCommandHandler,
} from "../../application/command";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import { BalanceSheetPostService } from "../../domain/service";
import { BalanceSheetPostRepository } from "../../infrastructure/storage/repository";

describe("Testing Input Balance Sheet Post Command", () => {
    const balanceSheetPostDataRequested: InputBalanceSheetPostCommand = {
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

    const balanceSheetPostDataResult =
        new BalanceSheetPostEntity<BalanceSheetPostProps>({
            tahun_pos_neraca: 2023,
            saldo_tahun_lalu: 3000000,
            saldo_penerimaan_program_reguler: 7000000,
            saldo_kerja_sama: 2000000,
            piutang_usaha: 1000000,
            inventaris: 500000,
            penyusutan_inventaris: 50000,
            hutang_usaha: 500000,
            hutang_bank: 700000,
        } as BalanceSheetPostProps);
    balanceSheetPostDataResult.calculateCash();
    balanceSheetPostDataResult.validateStability();

    const mockData = {
        balanceSheetPostDataYearExist: jest
            .fn()
            .mockReturnValue(Error("Data pos neraca 2023 telah dimasukkan")),
        balanceSheetPostDataYearNotExist: jest.fn().mockReturnValue(null),
        addBalanceSheetPost: jest.fn(),
        addBalanceSheetPostError: jest
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
    let inputBalanceSheetPostCommandHandler: ICommandHandler<
        InputBalanceSheetPostCommand,
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
            addBalanceSheetPost: mockData.addBalanceSheetPost,
        } as any;
        inputBalanceSheetPostCommandHandler =
            new InputBalanceSheetPostCommandHandler(balanceSheetPostRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedBalanceSheetPostService: jest.MockedClass<
        typeof BalanceSheetPostService
    >;
    const balanceSheetPostYear = 2023;
    describe("Execute Input Balance Sheet Post", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedBalanceSheetPostService =
                BalanceSheetPostService as jest.MockedClass<
                    typeof BalanceSheetPostService
                >;
            mockedBalanceSheetPostService.prototype.validateUniqueBalanceSheetYear =
                mockData.balanceSheetPostDataYearNotExist;
        });
        it("should success execute input balance sheet post", async () => {
            await inputBalanceSheetPostCommandHandler.execute(
                balanceSheetPostDataRequested,
            );

            expect(
                mockedBalanceSheetPostService.prototype
                    .validateUniqueBalanceSheetYear,
            ).toHaveBeenCalledWith(
                balanceSheetPostYear,
                balanceSheetPostRepository,
            );
            expect(
                balanceSheetPostRepository.addBalanceSheetPost,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...balanceSheetPostDataResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error execute input balance sheet post on database process", async () => {
            balanceSheetPostRepository.addBalanceSheetPost =
                mockData.addBalanceSheetPostError;

            try {
                await inputBalanceSheetPostCommandHandler.execute(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedBalanceSheetPostService.prototype
                        .validateUniqueBalanceSheetYear,
                ).toHaveBeenCalledWith(
                    balanceSheetPostYear,
                    balanceSheetPostRepository,
                );
                expect(
                    balanceSheetPostRepository.addBalanceSheetPost,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...balanceSheetPostDataResult,
                        id: expect.anything(),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute input balance sheet post on duplicated balance sheet post", async () => {
            mockedBalanceSheetPostService.prototype.validateUniqueBalanceSheetYear =
                mockData.balanceSheetPostDataYearExist;

            try {
                await inputBalanceSheetPostCommandHandler.execute(
                    balanceSheetPostDataRequested,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedBalanceSheetPostService.prototype
                        .validateUniqueBalanceSheetYear,
                ).toHaveBeenCalledWith(
                    balanceSheetPostYear,
                    balanceSheetPostRepository,
                );
                expect(
                    balanceSheetPostRepository.addBalanceSheetPost,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    `Data pos neraca ${balanceSheetPostYear} telah dimasukkan`,
                );
            }
        });
    });
});
