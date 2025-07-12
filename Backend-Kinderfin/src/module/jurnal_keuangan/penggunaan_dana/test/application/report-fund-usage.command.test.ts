import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    ReportFundUsageCommand,
    ReportFundUsageCommandHandler,
} from "../../application/command";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";
import { MasterDataRequestedEvent, SalaryPaidEvent } from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageService } from "../../domain/service";
import { FundUsageRepository } from "../../infrastructure/storage/repository";

describe("Testing Report Fund Usage Command", () => {
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

    const requestFundUsageDataHR: ReportFundUsageCommand = {
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const requestFundUsageData: ReportFundUsageCommand = {
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageDataSubActivityNotFound: ReportFundUsageCommand = {
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test Not Found",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const requestFundUsageDataActivityNotFound: ReportFundUsageCommand = {
        aktivitas: "Honorarium Test",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const fundUsageDataResultHR = new FundUsageEntity<FundUsageProps>({
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    } as FundUsageProps);

    const fundUsageDataResult = new FundUsageEntity<FundUsageProps>({
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    } as FundUsageProps);

    const [
        masterDataRequestedEventName,
        masterDataRetrievedEventName,
        masterDataTypeActivity,
        masterDataTypeSubActivity,
    ] = [
        "MasterDataRequested",
        "MasterDataRetrieved",
        "Aktivitas",
        "Sub Aktivitas",
    ];

    const masterDataRequestedActivityEvent = new MasterDataRequestedEvent(
        { tipe: masterDataTypeActivity },
        masterDataRequestedEventName,
    );
    const masterDataRequestedSubActivityEvent = new MasterDataRequestedEvent(
        { tipe: masterDataTypeSubActivity },
        masterDataRequestedEventName,
    );

    const [payEmployeeSalaryEventName, employeeSalaryPaidEventName] = [
        "PayEmployeeSalary",
        "EmployeeSalaryPaid",
    ];

    const employeeSalaryPaidEvent = new SalaryPaidEvent(
        requestFundUsageDataHR,
        payEmployeeSalaryEventName,
    );

    let [subscribeCallCount, subscribeCallCountError] = [0, 0];
    const mockData = {
        verifyActivityMasterData: jest.fn().mockReturnValue(null),
        verifyActivityMasterDataError: jest
            .fn()
            .mockReturnValue(Error("Aktivitas keuangan tidak terdaftar")),
        verifySubActivityMasterData: jest.fn().mockReturnValue(null),
        verifySubActivityMasterDataError: jest
            .fn()
            .mockReturnValue(Error("Sub aktivitas keuangan tidak terdaftar")),
        fundUsageSameHRExist: jest
            .fn()
            .mockReturnValue(
                Error(
                    "Data penggunaan dana untuk sub aktivitas HR Test kepada Test User pada Oktober 2023 telah dilaporkan",
                ),
            ),
        fundUsageSameHRNotExist: jest.fn().mockReturnValue(null),
        addFundUsage: jest.fn(),
        addFundUsageError: jest
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
                if (subscribeCallCount === 0) {
                    subscribeCallCount++;
                    callback({
                        data: activityMasterDatas,
                        eventName: masterDataRetrievedEventName,
                    });
                } else {
                    callback({
                        data: subActivityMasterDatas,
                        eventName: masterDataRetrievedEventName,
                    });
                }
            } else if (eventName === employeeSalaryPaidEventName) {
                callback({
                    data: "success",
                    eventName: employeeSalaryPaidEventName,
                });
            }
        }),
        subscribeErrorPaySalary: jest
            .fn()
            .mockImplementation((eventName, callback) => {
                if (eventName === masterDataRetrievedEventName) {
                    if (subscribeCallCount === 0) {
                        subscribeCallCount++;
                        callback({
                            data: activityMasterDatas,
                            eventName: masterDataRetrievedEventName,
                        });
                    } else {
                        callback({
                            data: subActivityMasterDatas,
                            eventName: masterDataRetrievedEventName,
                        });
                    }
                } else if (eventName === employeeSalaryPaidEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: employeeSalaryPaidEventName,
                    });
                }
            }),
        subscribeErrorSubActivity: jest
            .fn()
            .mockImplementation((eventName, callback) => {
                if (eventName === masterDataRetrievedEventName) {
                    if (subscribeCallCountError === 0) {
                        subscribeCallCountError++;
                        callback({
                            data: activityMasterDatas,
                            eventName: masterDataRetrievedEventName,
                        });
                    } else {
                        callback({
                            data: {
                                status: "error",
                                code: StatusCodes.INTERNAL_SERVER_ERROR,
                                message: "Internal Server Error",
                            },
                            eventName: masterDataRetrievedEventName,
                        });
                    }
                }
            }),
        subscribeError: jest
            .fn()
            .mockImplementationOnce((eventName, callback) => {
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
    let mockedFundUsageEntity: jest.MockedClass<typeof FundUsageEntity>;
    let fundUsageRepository: IFundUsageRepository;
    let eventBus: EventBus;
    let reportFundUsageCommandHandler: ICommandHandler<
        ReportFundUsageCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        [subscribeCallCount, subscribeCallCountError] = [0, 0];
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedFundUsageEntity = FundUsageEntity as jest.MockedClass<
            typeof FundUsageEntity
        >;
        mockedFundUsageEntity.prototype.verifyActivityMasterData =
            mockData.verifyActivityMasterData;
        mockedFundUsageEntity.prototype.verifySubActivityMasterData =
            mockData.verifySubActivityMasterData;
        fundUsageRepository = new FundUsageRepository(mockedDatabase);
        fundUsageRepository = {
            addFundUsage: mockData.addFundUsage,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        reportFundUsageCommandHandler = new ReportFundUsageCommandHandler(
            fundUsageRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedFundUsageService: jest.MockedClass<typeof FundUsageService>;
    const [fundUsageMonth, fundUsageYear] = ["Oktober", 2023];
    describe("Execute Report Fund Usage", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedFundUsageService = FundUsageService as jest.MockedClass<
                typeof FundUsageService
            >;
            mockedFundUsageService.prototype.validateUniqueFundUsageHR =
                mockData.fundUsageSameHRNotExist;
        });
        it("should success execute report fund usage for honorarium activity", async () => {
            await reportFundUsageCommandHandler.execute(requestFundUsageDataHR);

            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                1,
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                1,
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedActivityEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                1,
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedFundUsageEntity.prototype.verifyActivityMasterData,
            ).toHaveBeenCalledWith(activityMasterDatas);
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                2,
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                2,
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedSubActivityEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                2,
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedFundUsageEntity.prototype.verifySubActivityMasterData,
            ).toHaveBeenCalledWith(subActivityMasterDatas);
            expect(
                mockedFundUsageService.prototype.validateUniqueFundUsageHR,
            ).toHaveBeenCalled();
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                3,
                employeeSalaryPaidEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                3,
                payEmployeeSalaryEventName,
                {
                    ...employeeSalaryPaidEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                3,
                employeeSalaryPaidEventName,
                expect.any(Function),
            );
            expect(fundUsageRepository.addFundUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...fundUsageDataResultHR,
                    id: expect.anything(),
                }),
            );
        });

        it("should success execute report fund usage for universal activity", async () => {
            await reportFundUsageCommandHandler.execute(requestFundUsageData);

            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                1,
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                1,
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedActivityEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                1,
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedFundUsageEntity.prototype.verifyActivityMasterData,
            ).toHaveBeenCalledWith(activityMasterDatas);
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                2,
                masterDataRetrievedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                2,
                masterDataRequestedEventName,
                {
                    ...masterDataRequestedSubActivityEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                2,
                masterDataRetrievedEventName,
                expect.any(Function),
            );
            expect(
                mockedFundUsageEntity.prototype.verifySubActivityMasterData,
            ).toHaveBeenCalledWith(subActivityMasterDatas);
            expect(
                mockedFundUsageService.prototype.validateUniqueFundUsageHR,
            ).not.toHaveBeenCalled();
            expect(eventBus.removeSpecificListener).not.toHaveBeenNthCalledWith(
                3,
            );
            expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
            expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
            expect(fundUsageRepository.addFundUsage).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...fundUsageDataResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should error execute report fund usage on add fund usage", async () => {
            fundUsageRepository.addFundUsage = mockData.addFundUsageError;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedSubActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).toHaveBeenCalledWith(subActivityMasterDatas);
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).toHaveBeenCalled();
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryPaidEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    3,
                    payEmployeeSalaryEventName,
                    {
                        ...employeeSalaryPaidEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryPaidEventName,
                    expect.any(Function),
                );
                expect(fundUsageRepository.addFundUsage).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...fundUsageDataResultHR,
                        id: expect.anything(),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute report fund usage on subscribe event pay salary", async () => {
            eventBus.subscribe = mockData.subscribeErrorPaySalary;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedSubActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).toHaveBeenCalledWith(subActivityMasterDatas);
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).toHaveBeenCalled();
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryPaidEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    3,
                    payEmployeeSalaryEventName,
                    {
                        ...employeeSalaryPaidEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryPaidEventName,
                    expect.any(Function),
                );
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute report fund usage on same HR exist", async () => {
            mockedFundUsageService.prototype.validateUniqueFundUsageHR =
                mockData.fundUsageSameHRExist;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedSubActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).toHaveBeenCalledWith(subActivityMasterDatas);
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    `Data penggunaan dana untuk sub aktivitas ${requestFundUsageDataHR.sub_aktivitas} kepada ${requestFundUsageDataHR.penerima} pada ${fundUsageMonth} ${fundUsageYear} telah dilaporkan`,
                );
            }
        });

        it("should error execute report fund usage on sub activity not found", async () => {
            mockedFundUsageEntity.prototype.verifySubActivityMasterData =
                mockData.verifySubActivityMasterDataError;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataSubActivityNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedSubActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).toHaveBeenCalledWith(subActivityMasterDatas);
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).not.toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Sub aktivitas keuangan tidak terdaftar",
                );
            }
        });

        it("should error execute report fund usage on subscribe event sub activity", async () => {
            eventBus.subscribe = mockData.subscribeErrorSubActivity;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    2,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedSubActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    2,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).not.toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute report fund usage on activity not found", async () => {
            mockedFundUsageEntity.prototype.verifyActivityMasterData =
                mockData.verifyActivityMasterDataError;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataActivityNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).toHaveBeenCalledWith(activityMasterDatas);
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(2);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(2);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(2);
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).not.toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Aktivitas keuangan tidak terdaftar",
                );
            }
        });

        it("should error execute report fund usage on subscribe event activity", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await reportFundUsageCommandHandler.execute(
                    requestFundUsageDataHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    1,
                    masterDataRequestedEventName,
                    {
                        ...masterDataRequestedActivityEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    1,
                    masterDataRetrievedEventName,
                    expect.any(Function),
                );
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(2);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(2);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(2);
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedFundUsageService.prototype.validateUniqueFundUsageHR,
                ).not.toHaveBeenCalled();
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.publish).not.toHaveBeenNthCalledWith(3);
                expect(eventBus.subscribe).not.toHaveBeenNthCalledWith(3);
                expect(fundUsageRepository.addFundUsage).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
