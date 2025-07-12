import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    UpdateFundApplicationCommand,
    UpdateFundApplicationCommandHandler,
} from "../../application/command";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
import { FundApplicationRepository } from "../../infrastructure/storage/repository";

describe("Testing Update Fund Application Command", () => {
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

    const oldFundApplicationData: FundApplicationProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        bulan: 10,
        tahun: 2023,
        deskripsi: "Telepon PIKTI",
        unit: "Bulan",
        quantity_1: 1,
        quantity_2: 1,
        harga_satuan: 1560000,
        jumlah: 1560000,
    };

    const requestFundApplicationData: UpdateFundApplicationCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        unit: "Bulan",
        harga_satuan: 1600000,
    };

    const requestFundApplicationDataUnitNotFound: UpdateFundApplicationCommand =
        {
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            unit: "Tahun",
            harga_satuan: 1600000,
        };

    const fundApplicationDataResult =
        new FundApplicationEntity<FundApplicationProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            unit: "Bulan",
            harga_satuan: 1600000,
        } as FundApplicationProps);
    fundApplicationDataResult.calculateJumlah(oldFundApplicationData);

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
        fundApplicationIdExist: jest
            .fn()
            .mockReturnValue(oldFundApplicationData),
        fundApplicationIdNotExist: jest.fn().mockReturnValue(null),
        updateFundApplication: jest.fn(),
        updateFundApplicationError: jest
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
    let updateFundApplicationCommandHandler: ICommandHandler<
        UpdateFundApplicationCommand,
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
            isFundApplicationIdExist: mockData.fundApplicationIdExist,
            updateFundApplication: mockData.updateFundApplication,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        updateFundApplicationCommandHandler =
            new UpdateFundApplicationCommandHandler(
                fundApplicationRepository,
                eventBus,
            );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const fundApplicationId = "3679285c-707c-42ed-9c6e-9984825b22fd";
    describe("Execute Update Fund Application", () => {
        it("should success execute update fund application", async () => {
            await updateFundApplicationCommandHandler.execute(
                requestFundApplicationData,
            );

            expect(
                fundApplicationRepository.isFundApplicationIdExist,
            ).toHaveBeenCalledWith(fundApplicationId);
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
                fundApplicationRepository.updateFundApplication,
            ).toHaveBeenCalledWith(fundApplicationDataResult);
        });

        it("should error execute update fund application", async () => {
            fundApplicationRepository.updateFundApplication =
                mockData.updateFundApplicationError;

            try {
                await updateFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
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
                    fundApplicationRepository.updateFundApplication,
                ).toHaveBeenCalledWith(fundApplicationDataResult);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund application on unit not found", async () => {
            mockedFundApplicationEntity.prototype.verifyUnitMasterData =
                mockData.verifyUnitMasterDataError;

            try {
                await updateFundApplicationCommandHandler.execute(
                    requestFundApplicationDataUnitNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
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
                    fundApplicationRepository.updateFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data unit tidak terdaftar");
            }
        });

        it("should error execute update fund application on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await updateFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
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
                    fundApplicationRepository.updateFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund application on empty fund application", async () => {
            fundApplicationRepository.isFundApplicationIdExist =
                mockData.fundApplicationIdNotExist;

            try {
                await updateFundApplicationCommandHandler.execute(
                    requestFundApplicationData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundApplicationRepository.isFundApplicationIdExist,
                ).toHaveBeenCalledWith(fundApplicationId);
                expect(eventBus.removeSpecificListener).not.toHaveBeenCalled();
                expect(eventBus.publish).not.toHaveBeenCalled();
                expect(eventBus.subscribe).not.toHaveBeenCalled();
                expect(
                    fundApplicationRepository.updateFundApplication,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data pengajuan dana tidak ditemukan",
                );
            }
        });
    });
});
