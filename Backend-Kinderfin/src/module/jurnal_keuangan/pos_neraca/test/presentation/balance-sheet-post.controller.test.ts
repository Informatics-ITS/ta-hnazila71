import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    InputBalanceSheetPostCommandHandler,
    UpdateBalanceSheetPostCommandHandler,
} from "../../application/command";
import { IBalanceSheetPostQueryHandler } from "../../application/query";
import { BalanceSheetPostProps } from "../../domain/entity";
import { BalanceSheetPostDataRetrievedEvent } from "../../domain/event";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import { BalanceSheetPostQueryHandler } from "../../infrastructure/storage/query";
import { BalanceSheetPostRepository } from "../../infrastructure/storage/repository";
import { BalanceSheetPostController } from "../../presentation/controller";

describe("Testing Balance Sheet Post Controller", () => {
    const balanceSheetPostDataResult: BalanceSheetPostProps[] = [
        {
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            tahun_pos_neraca: 2022,
            saldo_tahun_lalu: 3000000,
            saldo_penerimaan_program_reguler: 7000000,
            saldo_kerja_sama: 2000000,
            kas: 12000000,
            piutang_usaha: 1000000,
            inventaris: 500000,
            penyusutan_inventaris: 50000,
            pendapatan_yang_belum_diterima: undefined,
            hutang_usaha: 500000,
            hutang_bank: 700000,
            laba_ditahan: 12250000,
        },
        {
            id: "69baf182-5e75-4c92-bfe0-dd98571a904e",
            tahun_pos_neraca: 2023,
            saldo_tahun_lalu: 4000000,
            saldo_penerimaan_program_reguler: 6000000,
            saldo_kerja_sama: 2000000,
            kas: 12000000,
            piutang_usaha: 2000000,
            inventaris: 500000,
            penyusutan_inventaris: 50000,
            pendapatan_yang_belum_diterima: undefined,
            hutang_usaha: 3000000,
            hutang_bank: 2000000,
            laba_ditahan: 9450000,
        },
    ];

    const sentMessage = {
        success: {
            input: {
                status: "success",
                message: DefaultMessage.SUC_ADD,
            },
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: balanceSheetPostDataResult,
            },
            update: {
                status: "success",
                message: DefaultMessage.SUC_UPDT,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

    const mockData = {
        execute: jest.fn(),
        executeError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        json: jest.fn(),
        publish: jest.fn(),
        getAllBalanceSheetPosts: jest
            .fn()
            .mockReturnValue(balanceSheetPostDataResult),
        getBalanceSheetPostDataById: jest
            .fn()
            .mockReturnValue(balanceSheetPostDataResult[0]),
        getBalanceSheetPostDataByBalanceSheetPostYear: jest
            .fn()
            .mockReturnValue(balanceSheetPostDataResult[1]),
        getBalanceSheetPostDataByBalanceSheetPostYearNull: jest
            .fn()
            .mockReturnValue({}),
        getError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let mockedDatabase: Sequelize;
    let balanceSheetPostRepository: IBalanceSheetPostRepository;
    let balanceSheetPostQueryHandler: IBalanceSheetPostQueryHandler;
    let eventBus: EventBus;
    let balanceSheetPostController: BalanceSheetPostController;

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
        balanceSheetPostQueryHandler = new BalanceSheetPostQueryHandler(
            mockedDatabase,
        );
        balanceSheetPostQueryHandler = {
            getAllBalanceSheetPosts: mockData.getAllBalanceSheetPosts,
            getBalanceSheetPostDataById: mockData.getBalanceSheetPostDataById,
            getBalanceSheetPostDataByBalanceSheetPostYear:
                mockData.getBalanceSheetPostDataByBalanceSheetPostYear,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        balanceSheetPostController = new BalanceSheetPostController(
            balanceSheetPostRepository,
            balanceSheetPostQueryHandler,
            eventBus,
        );
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const [
        balanceSheetPostYear,
        balanceSheetPostDataRequested,
        balanceSheetPostDataRequestedFail,
    ] = [
            2022,
            {
                tahun_pos_neraca: 2022,
                saldo_tahun_lalu: 3000000,
                saldo_penerimaan_program_reguler: 7000000,
                saldo_kerja_sama: 2000000,
                piutang_usaha: 1000000,
                inventaris: 500000,
                penyusutan_inventaris: 50000,
                hutang_usaha: 500000,
                hutang_bank: 700000,
            },
            {
                saldo_tahun_lalu: 3000000,
                saldo_penerimaan_program_reguler: 7000000,
                saldo_kerja_sama: 2000000,
                piutang_usaha: 1000000,
                inventaris: 500000,
                penyusutan_inventaris: 50000,
                hutang_usaha: 500000,
                hutang_bank: 700000,
            },
        ];
    let mockedInputBalanceSheetPostCommandHandler: jest.MockedClass<
        typeof InputBalanceSheetPostCommandHandler
    >;
    describe("Input Balance Sheet Post Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, balanceSheetPostDataRequested),
            });
            mockedInputBalanceSheetPostCommandHandler =
                InputBalanceSheetPostCommandHandler as jest.MockedClass<
                    typeof InputBalanceSheetPostCommandHandler
                >;
            mockedInputBalanceSheetPostCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response input balance sheet post", async () => {
            await balanceSheetPostController.inputBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputBalanceSheetPostCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(balanceSheetPostDataRequested);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.input,
            );
        });

        it("should error return response input balance sheet post on input data", async () => {
            mockedInputBalanceSheetPostCommandHandler.prototype.execute =
                mockData.executeError;

            await balanceSheetPostController.inputBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputBalanceSheetPostCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(balanceSheetPostDataRequested);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response input balance sheet post on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, balanceSheetPostDataRequestedFail),
            });

            await balanceSheetPostController.inputBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputBalanceSheetPostCommandHandler.prototype.execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });

    describe("View All Balance Sheet Posts Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest();
        });

        it("should success return response view all balance sheet posts", async () => {
            await balanceSheetPostController.viewAllBalanceSheetPosts(
                mockRequest,
                mockResponse,
            );

            expect(
                balanceSheetPostQueryHandler.getAllBalanceSheetPosts,
            ).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all balance sheet posts", async () => {
            balanceSheetPostQueryHandler.getAllBalanceSheetPosts =
                mockData.getError;

            await balanceSheetPostController.viewAllBalanceSheetPosts(
                mockRequest,
                mockResponse,
            );

            expect(
                balanceSheetPostQueryHandler.getAllBalanceSheetPosts,
            ).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });
    });

    const [
        requestSendBalanceSheetPostData,
        balanceSheetPostDataRetrievedEventName,
    ] = [
            {
                data: { tahun: balanceSheetPostYear },
                eventName: "BalanceSheetPostDataRequested",
            },
            "BalanceSheetPostDataRetrieved",
        ];
    const balanceSheetPostDataRetrievedSuccessEvent =
        new BalanceSheetPostDataRetrievedEvent(
            balanceSheetPostDataResult[1],
            balanceSheetPostDataRetrievedEventName,
        );
    const balanceSheetPostDataRetrievedSuccessNullEvent =
        new BalanceSheetPostDataRetrievedEvent(
            {},
            balanceSheetPostDataRetrievedEventName,
        );
    const balanceSheetPostDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        balanceSheetPostDataRetrievedEventName,
    };
    describe("Send Balance Sheet Post By Year Controller", () => {
        it("should success return response send balance sheet post by year", async () => {
            await balanceSheetPostController.sendBalanceSheetPost(
                requestSendBalanceSheetPostData,
            );

            expect(
                balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear,
            ).toHaveBeenCalledWith(balanceSheetPostYear);
            expect(eventBus.publish).toHaveBeenCalledWith(
                balanceSheetPostDataRetrievedEventName,
                {
                    ...balanceSheetPostDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should success return response send empty balance sheet post by year", async () => {
            balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear =
                mockData.getBalanceSheetPostDataByBalanceSheetPostYearNull;

            await balanceSheetPostController.sendBalanceSheetPost(
                requestSendBalanceSheetPostData,
            );

            expect(
                balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear,
            ).toHaveBeenCalledWith(balanceSheetPostYear);
            expect(eventBus.publish).toHaveBeenCalledWith(
                balanceSheetPostDataRetrievedEventName,
                {
                    ...balanceSheetPostDataRetrievedSuccessNullEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send balance sheet post by year", async () => {
            balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear =
                mockData.getError;

            try {
                await balanceSheetPostController.sendBalanceSheetPost(
                    requestSendBalanceSheetPostData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear,
                ).toHaveBeenCalledWith(balanceSheetPostYear);
                expect(eventBus.publish).not.toHaveBeenCalledWith(
                    balanceSheetPostDataRetrievedEventName,
                    {
                        ...balanceSheetPostDataRetrievedSuccessEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    balanceSheetPostDataRetrievedEventName,
                    {
                        ...balanceSheetPostDataRetrievedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const balanceSheetPostId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    let mockedUpdateBalanceSheetPostCommandHandler: jest.MockedClass<
        typeof UpdateBalanceSheetPostCommandHandler
    >;
    describe("Update Balance Sheet Post Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, balanceSheetPostDataRequested),
                params: Object.assign({}, { id: balanceSheetPostId }),
            });
            mockedUpdateBalanceSheetPostCommandHandler =
                UpdateBalanceSheetPostCommandHandler as jest.MockedClass<
                    typeof UpdateBalanceSheetPostCommandHandler
                >;
            mockedUpdateBalanceSheetPostCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response update balance sheet post", async () => {
            await balanceSheetPostController.updateBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateBalanceSheetPostCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...balanceSheetPostDataRequested,
                id: balanceSheetPostId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update balance sheet post on update data", async () => {
            mockedUpdateBalanceSheetPostCommandHandler.prototype.execute =
                mockData.executeError;

            await balanceSheetPostController.updateBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateBalanceSheetPostCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...balanceSheetPostDataRequested,
                id: balanceSheetPostId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update balance sheet post on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, balanceSheetPostDataRequestedFail),
                params: Object.assign(
                    {},
                    { id: "3679285c-707c-42ed-9c6e-9984825b22f" },
                ),
            });

            await balanceSheetPostController.updateBalanceSheetPost(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateBalanceSheetPostCommandHandler.prototype.execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });
});
