import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    DeleteMasterDataCommandHandler,
    InputMasterDataCommandHandler,
    UpdateMasterDataCommandHandler,
} from "../../application/command";
import { IMasterDataQueryHandler } from "../../application/query";
import { MasterDataProps } from "../../domain/entity";
import { MasterDataRetrievedEvent } from "../../domain/event";
import { IMasterDataRepository } from "../../domain/repository";
import { MasterDataQueryHandler } from "../../infrastructure/storage/query";
import { MasterDataRepository } from "../../infrastructure/storage/repository";
import { MasterDataController } from "../../presentation/controller";

describe("Testing Master Data Controller", () => {
    const masterDataResult: MasterDataProps[] = [
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

    const sentMessage = {
        success: {
            input: {
                status: "success",
                message: DefaultMessage.SUC_ADD,
            },
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: masterDataResult,
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
        getAllMasterDatasByType: jest.fn().mockReturnValue(masterDataResult),
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
    let masterDataRepository: IMasterDataRepository;
    let masterDataQueryHandler: IMasterDataQueryHandler;
    let eventBus: EventBus;
    let masterDataController: MasterDataController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        masterDataRepository = new MasterDataRepository(mockedDatabase);
        masterDataQueryHandler = new MasterDataQueryHandler(mockedDatabase);
        masterDataQueryHandler = {
            getAllMasterDatasByType: mockData.getAllMasterDatasByType,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        masterDataController = new MasterDataController(
            masterDataRepository,
            masterDataQueryHandler,
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
        masterDataType,
        masterDataTypeFormatted,
        MasterDataRequested,
        masterValidData,
        MasterDataRequestedFail,
    ] = [
            "jenis-pembayaran",
            "Jenis Pembayaran",
            {
                nilai: "Training",
                deskripsi: "Jenis pembayaran untuk pendaftaran training PIKTI",
            },
            {
                tipe: "Jenis Pembayaran",
                nilai: "Training",
                deskripsi: "Jenis pembayaran untuk pendaftaran training PIKTI",
            },
            {
                deskripsi: "Jenis pembayaran untuk pendaftaran training PIKTI",
            },
        ];
    let mockedInputMasterDataCommandHandler: jest.MockedClass<
        typeof InputMasterDataCommandHandler
    >;

    describe("Input Master Data Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, MasterDataRequested),
                params: Object.assign({}, { type: masterDataType }),
            });
            mockedInputMasterDataCommandHandler =
                InputMasterDataCommandHandler as jest.MockedClass<
                    typeof InputMasterDataCommandHandler
                >;
            mockedInputMasterDataCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response input master data", async () => {
            await masterDataController.inputMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(masterValidData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.input,
            );
        });

        it("should success return response input master data default", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, MasterDataRequested),
            });

            await masterDataController.inputMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(masterValidData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.input,
            );
        });

        it("should error return response input master data on input data", async () => {
            mockedInputMasterDataCommandHandler.prototype.execute =
                mockData.executeError;

            await masterDataController.inputMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(masterValidData);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response input master data on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, MasterDataRequestedFail),
                params: Object.assign({}, { type: masterDataType }),
            });

            await masterDataController.inputMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedInputMasterDataCommandHandler.prototype.execute,
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

    describe("View All Master Datas Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { type: masterDataType }),
            });
        });

        it("should success return response view all master datas", async () => {
            await masterDataController.viewAllMasterDatas(
                mockRequest,
                mockResponse,
            );

            expect(
                masterDataQueryHandler.getAllMasterDatasByType,
            ).toHaveBeenCalledWith(masterDataTypeFormatted);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should success return response view all master datas default", async () => {
            mockRequest = httpMocks.createRequest();

            await masterDataController.viewAllMasterDatas(
                mockRequest,
                mockResponse,
            );

            expect(
                masterDataQueryHandler.getAllMasterDatasByType,
            ).toHaveBeenCalledWith(masterDataTypeFormatted);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all master datas", async () => {
            masterDataQueryHandler.getAllMasterDatasByType = mockData.getError;

            await masterDataController.viewAllMasterDatas(
                mockRequest,
                mockResponse,
            );

            expect(
                masterDataQueryHandler.getAllMasterDatasByType,
            ).toHaveBeenCalledWith(masterDataTypeFormatted);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });
    });

    const [requestSendMasterData, masterDataRetrievedEventName] = [
        {
            data: { tipe: masterDataTypeFormatted },
            eventName: "MasterDataRequested",
        },
        "MasterDataRetrieved",
    ];
    const masterDataRetrievedSuccessEvent = new MasterDataRetrievedEvent(
        masterDataResult,
        masterDataRetrievedEventName,
    );
    const masterDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        masterDataRetrievedEventName,
    };
    describe("Send All Master Datas Controller", () => {
        it("should success return response send all master datas", async () => {
            await masterDataController.sendAllMasterDatas(
                requestSendMasterData,
            );

            expect(
                masterDataQueryHandler.getAllMasterDatasByType,
            ).toHaveBeenCalledWith(masterDataTypeFormatted);
            expect(eventBus.publish).toHaveBeenCalledWith(
                masterDataRetrievedEventName,
                {
                    ...masterDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send master datas by year", async () => {
            masterDataQueryHandler.getAllMasterDatasByType = mockData.getError;

            try {
                await masterDataController.sendAllMasterDatas(
                    requestSendMasterData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    masterDataQueryHandler.getAllMasterDatasByType,
                ).toHaveBeenCalledWith(masterDataTypeFormatted);
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    {
                        ...masterDataRetrievedFailedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const masterDataId = "d79fabb5-e776-4725-8ca5-a898e6c29511";
    const masterValidDataUpdate = {
        id: masterDataId,
        nilai: "Training",
        deskripsi: "Jenis pembayaran untuk pendaftaran training PIKTI",
    };
    let mockedUpdateMasterDataCommandHandler: jest.MockedClass<
        typeof UpdateMasterDataCommandHandler
    >;
    describe("Update Master Data Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, MasterDataRequested),
                params: Object.assign({}, { id: masterDataId }),
            });
            mockedUpdateMasterDataCommandHandler =
                UpdateMasterDataCommandHandler as jest.MockedClass<
                    typeof UpdateMasterDataCommandHandler
                >;
            mockedUpdateMasterDataCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response update master data", async () => {
            await masterDataController.updateMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(masterValidDataUpdate);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update master data on update data", async () => {
            mockedUpdateMasterDataCommandHandler.prototype.execute =
                mockData.executeError;

            await masterDataController.updateMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith(masterValidDataUpdate);
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update master data on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, MasterDataRequestedFail),
                params: Object.assign(
                    {},
                    { id: "d79fabb5-e776-4725-8ca5-a898e6c2951" },
                ),
            });

            await masterDataController.updateMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdateMasterDataCommandHandler.prototype.execute,
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

    let mockedDeleteMasterDataCommandHandler: jest.MockedClass<
        typeof DeleteMasterDataCommandHandler
    >;
    describe("Delete Master Data Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { id: masterDataId }),
            });
            mockedDeleteMasterDataCommandHandler =
                DeleteMasterDataCommandHandler as jest.MockedClass<
                    typeof DeleteMasterDataCommandHandler
                >;
            mockedDeleteMasterDataCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response delete master data", async () => {
            await masterDataController.deleteMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: masterDataId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.delete,
            );
        });

        it("should error return response delete master data on delete data", async () => {
            mockedDeleteMasterDataCommandHandler.prototype.execute =
                mockData.executeError;

            await masterDataController.deleteMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteMasterDataCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({ id: masterDataId });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response delete master data on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                params: Object.assign(
                    {},
                    { id: "d79fabb5-e776-4725-8ca5-a898e6c2951" },
                ),
            });

            await masterDataController.deleteMasterData(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeleteMasterDataCommandHandler.prototype.execute,
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
