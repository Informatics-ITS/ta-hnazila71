import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    InputFundApplicationCommand,
    InputFundApplicationCommandHandler,
} from "../../application/command";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
import { FundApplicationRepository } from "../../infrastructure/storage/repository";

describe("Testing Input Fund Application Command", () => {
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

    const requestFundApplicationData: InputFundApplicationCommand = {
        bulan: 10,
        tahun: 2023,
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1560000,
    };

    const requestFundApplicationDataUnitNotFound: InputFundApplicationCommand =
        {
            bulan: 10,
            tahun: 2023,
            deskripsi: "Telepon PIKTI",
            unit: "Tahun",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1560000,
        };

    const fundApplicationDataResult =
        new FundApplicationEntity<FundApplicationProps>({
            bulan: 10,
            tahun: 2023,
            deskripsi: "Telepon PIKTI",
            unit: "Bulan",
            quantity_1: 1,
            quantity_2: 1,
            harga_satuan: 1560000,
        } as FundApplicationProps);
    fundApplicationDataResult.calculateJumlah();

    const [
        masterDataRequestedEventName,
        masterDataRetrievedEventName,
        masterDataType,
    ] = ["MasterDataRequested", "MasterDataRetrieved", "Unit"];

    const masterDataRequestedEvent = new MasterDataRequestedEvent(
        { tipe: masterDataType },
        masterDataRequestedEventName,
    );

    const mockData = {
        verifyUnitMasterData: jest.fn().mockReturnValue(null),
        verifyUnitMasterDataError: jest
            .fn()
            .mockReturnValue(Error("Data unit tidak terdaftar")),
        addFundApplication: jest.fn(),
        addFundApplicationError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === masterDataRetrievedEventName) {
                callback({
                    data: masterDatas,
                    eventName: masterDataRetrievedEventName,
                });
            }
        }),
        subscribeError: jest.fn().mockImplementation((eventName, callback) => {
            if (eventName === masterDataRetrievedEventName) {
                callback({
                    data: {
                        status: "error",
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Internal Server Error",
                    },
                    eventName: masterDataRetrievedEventName,
                });
            }
        }),
    };

    jest.mock("../../domain/entity");
    let mockedDatabase: Sequelize;
    let mockedFundApplicationEntity: jest.MockedClass<
        typeof FundApplicationEntity
    >;
    let fundApplicationRepository: IFundApplicationRepository;
    let eventBus: EventBus;
    let inputFundApplicationCommandHandler: ICommandHandler<
        InputFundApplicationCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedFundApplicationEntity = FundApplicationEntity as jest.MockedClass<
            typeof FundApplicationEntity
        >;
        mockedFundApplicationEntity.prototype.verifyUnitMasterData =
            mockData.verifyUnitMasterData;
        fundApplicationRepository = new FundApplicationRepository(
            mockedDatabase,
        );
        fundApplicationRepository = {
            addFundApplication: mockData.addFundApplication,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        inputFundApplicationCommandHandler =
            new InputFundApplicationCommandHandler(
                fundApplicationRepository,
                eventBus,
            );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Execute Input Fund Application", () => {
        it("should success execute input fund application", async () => {
            await inputFundApplicationCommandHandler.execute(
                requestFundApplicationData,
            );

            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedFundApplicationEntity.prototype.verifyUnitMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                fundApplicationRepository.addFundApplication,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...fundApplicationDataResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error execute input fund application", async () => {
            fundApplicationRepository.addFundApplication =
                mockData.addFundApplicationError;

            try {
                await inputFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundApplicationEntity.prototype.verifyUnitMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    fundApplicationRepository.addFundApplication,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...fundApplicationDataResult,
                        id: expect.anything(),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute input fund application on unit not found", async () => {
            mockedFundApplicationEntity.prototype.verifyUnitMasterData =
                mockData.verifyUnitMasterDataError;

            try {
                await inputFundApplicationCommandHandler.execute(
                    requestFundApplicationDataUnitNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundApplicationEntity.prototype.verifyUnitMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    fundApplicationRepository.addFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data unit tidak terdaftar");
            }
        });

        it("should error execute input fund application on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await inputFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundApplicationEntity.prototype.verifyUnitMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    fundApplicationRepository.addFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
