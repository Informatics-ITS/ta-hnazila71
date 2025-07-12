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
    DeleteFundApplicationCommandHandler,
    InputFundApplicationCommandHandler,
    UpdateFundApplicationCommandHandler,
} from "../../application/command";
import { IFundApplicationQueryHandler } from "../../application/query";
import { FundApplicationProps } from "../../domain/entity";
import {
    MonthlyFundApplicationRetrievedEvent,
    MonthlyFundApplicationValue,
} from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
import { FundApplicationQueryHandler } from "../../infrastructure/storage/query";
import { FundApplicationRepository } from "../../infrastructure/storage/repository";
import { FundApplicationController } from "../../presentation/controller";

describe("Testing Fund Application Controller", () => {
    const fundApplicationDataResult: FundApplicationProps[] = [
        {
            id: "78bae457-6f69-44b6-83b0-fd6a38d69378",
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1600000,
            jumlah: 1600000,
        },
        {
            id: "de481f0d-2dd7-48cf-a13d-c6b56fd56e2b",
            deskripsi: "Honorarium Teknisi PIKTI",
            unit: "OB",
            quantity_1: 25,
            quantity_2: 5,
            harga_satuan: 120000,
            jumlah: 15000000,
        },
    ];

    const fundApplicationDataRetrieved: MonthlyFundApplicationValue[] = [
        {
            bulan: 8,
            total: 8000000,
        },
        {
            bulan: 10,
            total: 16600000,
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
                data: fundApplicationDataResult,
            },
            update: {
                status: "success",
                message: DefaultMessage.SUC_UPDT,
            },
            delete: {
                status: "success",
                message: DefaultMessage.SUC_DEL,
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
        getAllFundApplications: jest
            .fn()
            .mockReturnValue(fundApplicationDataResult),
        getFundApplicationDataById: jest
            .fn()
            .mockReturnValue(fundApplicationDataResult[0]),
        getMonthlyFundApplicationsByYear: jest
            .fn()
            .mockReturnValue(fundApplicationDataRetrieved),
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
    let fundApplicationRepository: IFundApplicationRepository;
    let fundApplicationQueryHandler: IFundApplicationQueryHandler;
    let eventBus: EventBus;
    let fundApplicationController: FundApplicationController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        fundApplicationRepository = new FundApplicationRepository(
            mockedDatabase,
        );
        fundApplicationQueryHandler = new FundApplicationQueryHandler(
            mockedDatabase,
        );
        fundApplicationQueryHandler = {
            getAllFundApplications: mockData.getAllFundApplications,
            getFundApplicationDataById: mockData.getFundApplicationDataById,
            getMonthlyFundApplicationsByYear:
                mockData.getMonthlyFundApplicationsByYear,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        fundApplicationController = new FundApplicationController(
            fundApplicationRepository,
            fundApplicationQueryHandler,
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
        fundApplicationYear,
        requestFundApplicationData,
        requestUpdateFundApplicationData,
        requestFundApplicationDataFail,
    ] = [
        2023,
        {
            bulan: 10,
            tahun: 2023,
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1600000,
        },
        {
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1600000,
        },
        {
            bulan: 10,
            tahun: 2023,
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
        },
    ];
    let mockedInputFundApplicationCommandHandler: jest.MockedClass<
        typeof InputFundApplicationCommandHandler
    >;
    describe("Input Fund Application Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundApplicationData),
            });
            mockedInputFundApplicationCommandHandler =
                InputFundApplicationCommandHandler as jest.MockedClass<
                    typeof InputFundApplicationCommandHandler
                >;
            mockedInputFundApplicationCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response input fund application", async () => {
            await fundApplicationController.inputFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(requestFundApplicationData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.input,
            );
        });

        it("should error return response input fund application on input data", async () => {
            mockedInputFundApplicationCommandHandler.prototype.execute =
                mockData.executeError;

            await fundApplicationController.inputFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(requestFundApplicationData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response input fund application on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundApplicationDataFail),
            });

            await fundApplicationController.inputFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputFundApplicationCommandHandler.prototype.execute,
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

    const [bulan, tahun] = ["10", "2023"];
    describe("View All Fund Applications Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { bulan: bulan, tahun: tahun }),
            });
        });

        it("should success return response view all fund applications", async () => {
            await fundApplicationController.viewAllFundApplications(
                mockRequest,
                mockResponse,
            );

            expect(
                fundApplicationQueryHandler.getAllFundApplications,
            ).toHaveBeenCalledWith(parseInt(bulan), parseInt(tahun));
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all fund applications", async () => {
            fundApplicationQueryHandler.getAllFundApplications =
                mockData.getError;

            await fundApplicationController.viewAllFundApplications(
                mockRequest,
                mockResponse,
            );

            expect(
                fundApplicationQueryHandler.getAllFundApplications,
            ).toHaveBeenCalledWith(parseInt(bulan), parseInt(tahun));
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response view all fund applications on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                query: Object.assign({}, { bulan: bulan }),
            });

            await fundApplicationController.viewAllFundApplications(
                mockRequest,
                mockResponse,
            );

            expect(
                fundApplicationQueryHandler.getAllFundApplications,
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

    const [
        requestSendFundApplicationData,
        fundApplicationDataRetrievedEventName,
    ] = [
        {
            data: { tahun: fundApplicationYear },
            eventName: "MonthlyFundApplicationsRequested",
        },
        "MonthlyFundApplicationsRetrieved",
    ];
    const fundApplicationDataRetrievedSuccessEvent =
        new MonthlyFundApplicationRetrievedEvent(
            fundApplicationDataRetrieved,
            fundApplicationDataRetrievedEventName,
        );
    const fundApplicationDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        fundApplicationDataRetrievedEventName,
    };
    describe("Send Monthly Fund Applications Controller", () => {
        it("should success return response send monthly fund applications", async () => {
            await fundApplicationController.sendMonthlyFundApplications(
                requestSendFundApplicationData,
            );

            expect(
                fundApplicationQueryHandler.getMonthlyFundApplicationsByYear,
            ).toHaveBeenCalledWith(fundApplicationYear);
            expect(eventBus.publish).toHaveBeenCalledWith(
                fundApplicationDataRetrievedEventName,
                {
                    ...fundApplicationDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send monthly fund applications", async () => {
            fundApplicationQueryHandler.getMonthlyFundApplicationsByYear =
                mockData.getError;

            try {
                await fundApplicationController.sendMonthlyFundApplications(
                    requestSendFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationQueryHandler.getMonthlyFundApplicationsByYear,
                ).toHaveBeenCalledWith(fundApplicationYear);
                expect(eventBus.publish).not.toHaveBeenCalledWith(
                    fundApplicationDataRetrievedEventName,
                    {
                        ...fundApplicationDataRetrievedSuccessEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    fundApplicationDataRetrievedEventName,
                    {
                        ...fundApplicationDataRetrievedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const fundApplicationId = "78bae457-6f69-44b6-83b0-fd6a38d69378";
    let mockedUpdateFundApplicationCommandHandler: jest.MockedClass<
        typeof UpdateFundApplicationCommandHandler
    >;
    describe("Update Fund Application Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestUpdateFundApplicationData),
                params: Object.assign({}, { id: fundApplicationId }),
            });
            mockedUpdateFundApplicationCommandHandler =
                UpdateFundApplicationCommandHandler as jest.MockedClass<
                    typeof UpdateFundApplicationCommandHandler
                >;
            mockedUpdateFundApplicationCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response update fund application", async () => {
            await fundApplicationController.updateFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestUpdateFundApplicationData,
                id: fundApplicationId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update fund application on update data", async () => {
            mockedUpdateFundApplicationCommandHandler.prototype.execute =
                mockData.executeError;

            await fundApplicationController.updateFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestUpdateFundApplicationData,
                id: fundApplicationId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update fund application on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestFundApplicationDataFail),
                params: Object.assign(
                    {},
                    { id: "78bae457-6f69-44b6-83b0-fd6a38d6937" },
                ),
            });

            await fundApplicationController.updateFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateFundApplicationCommandHandler.prototype.execute,
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

    let mockedDeleteFundApplicationCommandHandler: jest.MockedClass<
        typeof DeleteFundApplicationCommandHandler
    >;
    describe("Delete Fund Application Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { id: fundApplicationId }),
            });
            mockedDeleteFundApplicationCommandHandler =
                DeleteFundApplicationCommandHandler as jest.MockedClass<
                    typeof DeleteFundApplicationCommandHandler
                >;
            mockedDeleteFundApplicationCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response delete fund application", async () => {
            await fundApplicationController.deleteFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: fundApplicationId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.delete,
            );
        });

        it("should error return response delete fund application on delete data", async () => {
            mockedDeleteFundApplicationCommandHandler.prototype.execute =
                mockData.executeError;

            await fundApplicationController.deleteFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundApplicationCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: fundApplicationId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response delete fund application on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                params: Object.assign(
                    {},
                    { id: "78bae457-6f69-44b6-83b0-fd6a38d6937" },
                ),
            });

            await fundApplicationController.deleteFundApplication(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteFundApplicationCommandHandler.prototype.execute,
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
