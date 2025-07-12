import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    UpdateFundUsageCommand,
    UpdateFundUsageCommandHandler,
} from "../../application/command";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";
import {
    MasterDataRequestedEvent,
    SalaryCancelledEvent,
    SalaryPaidEvent,
    SalaryUpdatedEvent,
} from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageService } from "../../domain/service";
import { FundUsageRepository } from "../../infrastructure/storage/repository";

describe("Testing Update Fund Usage Command", () => {
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

    const oldFundUsageHRDiffDuration: FundUsageProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2024-11-14"),
        penerima: "Test User A",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const oldFundUsageHR: FundUsageProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-14"),
        penerima: "Test User A",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const oldFundUsage: FundUsageProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageDataNewHR: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-14"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const requestFundUsageDataAsync: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-14"),
        penerima: "Test User",
        sub_aktivitas: "Cetak KTM",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const requestFundUsageData: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsagePartial: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageDataSubActivityNotFound: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM 1",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageDataActivityNotFound: UpdateFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Layanan Kantor 1",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const fundUsageDataResultNewHR = new FundUsageEntity<FundUsageProps>({
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-14"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    } as FundUsageProps);

    const fundUsageDataResult = new FundUsageEntity<FundUsageProps>({
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
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

    const [
        payEmployeeSalaryEventName,
        employeeSalaryPaidEventName,
        updateEmployeeSalaryEventName,
        employeeSalaryUpdatedEventName,
        cancelEmployeeSalaryEventName,
        employeeSalaryDeletedEventName,
    ] = [
        "PayEmployeeSalary",
        "EmployeeSalaryPaid",
        "UpdateEmployeeSalary",
        "EmployeeSalaryUpdated",
        "CancelEmployeeSalary",
        "EmployeeSalaryDeleted",
    ];

    const employeeSalaryPaidEvent = new SalaryPaidEvent(
        requestFundUsageDataNewHR,
        payEmployeeSalaryEventName,
    );

    const employeeSalaryUpdatedEvent = new SalaryUpdatedEvent(
        requestFundUsageDataNewHR,
        updateEmployeeSalaryEventName,
    );

    const employeeSalaryDeletedEvent = new SalaryCancelledEvent(
        {
            tanggal: oldFundUsageHRDiffDuration.tanggal,
            penerima: oldFundUsageHRDiffDuration.penerima,
        },
        cancelEmployeeSalaryEventName,
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
        fundUsageIdExist: jest.fn().mockReturnValue(oldFundUsage),
        fundUsageIdExistHR: jest.fn().mockReturnValue(oldFundUsageHR),
        fundUsageIdExistHRDiffDuration: jest
            .fn()
            .mockReturnValue(oldFundUsageHRDiffDuration),
        fundUsageIdNotExist: jest.fn().mockReturnValue(null),
        fundUsageSameHRExist: jest
            .fn()
            .mockReturnValue(
                Error(
                    "Data penggunaan dana untuk sub aktivitas HR Test kepada Test User pada Oktober 2023 telah dilaporkan",
                ),
            ),
        fundUsageSameHRNotExist: jest.fn().mockReturnValue(null),
        updateFundUsage: jest.fn(),
        updateFundUsageError: jest
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
            } else if (eventName === employeeSalaryUpdatedEventName) {
                callback({
                    data: "success",
                    eventName: employeeSalaryUpdatedEventName,
                });
            } else if (eventName === employeeSalaryDeletedEventName) {
                callback({
                    data: "success",
                    eventName: employeeSalaryDeletedEventName,
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
                } else if (eventName === employeeSalaryUpdatedEventName) {
                    callback({
                        data: "success",
                        eventName: employeeSalaryUpdatedEventName,
                    });
                } else if (eventName === employeeSalaryDeletedEventName) {
                    callback({
                        data: "success",
                        eventName: employeeSalaryDeletedEventName,
                    });
                }
            }),
        subscribeErrorUpdateSalary: jest
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
                        data: "success",
                        eventName: employeeSalaryPaidEventName,
                    });
                } else if (eventName === employeeSalaryUpdatedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: employeeSalaryUpdatedEventName,
                    });
                } else if (eventName === employeeSalaryDeletedEventName) {
                    callback({
                        data: "success",
                        eventName: employeeSalaryDeletedEventName,
                    });
                }
            }),
        subscribeErrorDeleteSalary: jest
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
                        data: "success",
                        eventName: employeeSalaryPaidEventName,
                    });
                } else if (eventName === employeeSalaryUpdatedEventName) {
                    callback({
                        data: "success",
                        eventName: employeeSalaryUpdatedEventName,
                    });
                } else if (eventName === employeeSalaryDeletedEventName) {
                    callback({
                        data: {
                            status: "error",
                            code: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: "Internal Server Error",
                        },
                        eventName: employeeSalaryDeletedEventName,
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
    let updateFundUsageCommandHandler: ICommandHandler<
        UpdateFundUsageCommand,
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
            isFundUsageIdExist: mockData.fundUsageIdExistHRDiffDuration,
            isFundUsageSameHRExist: mockData.fundUsageSameHRNotExist,
            updateFundUsage: mockData.updateFundUsage,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        updateFundUsageCommandHandler = new UpdateFundUsageCommandHandler(
            fundUsageRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../domain/service");
    let mockedFundUsageService: jest.MockedClass<typeof FundUsageService>;
    const [fundUsageId, fundUsageMonth, fundUsageYear] = [
        "4e8d035d-0434-48cc-a4c3-270f1614739a",
        "Oktober",
        2023,
    ];
    describe("Execute Update Fund Usage", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedFundUsageService = FundUsageService as jest.MockedClass<
                typeof FundUsageService
            >;
            mockedFundUsageService.prototype.validateUniqueFundUsageHR =
                mockData.fundUsageSameHRNotExist;
        });
        it("should success execute update fund usage for replace honorarium activity diff duration", async () => {
            await updateFundUsageCommandHandler.execute(
                requestFundUsageDataNewHR,
            );

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                3,
                employeeSalaryUpdatedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                3,
                updateEmployeeSalaryEventName,
                {
                    ...employeeSalaryUpdatedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                3,
                employeeSalaryUpdatedEventName,
                expect.any(Function),
            );
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResultNewHR,
            );
            expect(
                mockedFundUsageService.prototype.validateUniqueFundUsageHR,
            ).toHaveBeenCalled();
        });

        it("should success execute update fund usage for replace honorarium activity same duration", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdExistHR;

            await updateFundUsageCommandHandler.execute(
                requestFundUsageDataNewHR,
            );

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                3,
                employeeSalaryUpdatedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                3,
                updateEmployeeSalaryEventName,
                {
                    ...employeeSalaryUpdatedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                3,
                employeeSalaryUpdatedEventName,
                expect.any(Function),
            );
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResultNewHR,
            );
        });

        it("should success execute update fund usage for replace honorarium activity to universal activity", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdExistHRDiffDuration;

            await updateFundUsageCommandHandler.execute(requestFundUsageData);

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                3,
                employeeSalaryDeletedEventName,
            );
            expect(eventBus.publish).toHaveBeenNthCalledWith(
                3,
                cancelEmployeeSalaryEventName,
                {
                    ...employeeSalaryDeletedEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                3,
                employeeSalaryDeletedEventName,
                expect.any(Function),
            );
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResult,
            );
        });

        it("should success execute update fund usage for replace universal activity to honorarium activity", async () => {
            fundUsageRepository.isFundUsageIdExist = mockData.fundUsageIdExist;

            await updateFundUsageCommandHandler.execute(
                requestFundUsageDataNewHR,
            );

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResultNewHR,
            );
        });

        it("should success execute update fund usage normal", async () => {
            await updateFundUsageCommandHandler.execute(requestFundUsageData);

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResult,
            );
        });

        it("should success execute update fund usage partial", async () => {
            fundUsageRepository.isFundUsageIdExist = mockData.fundUsageIdExist;

            await updateFundUsageCommandHandler.execute(
                requestFundUsagePartial,
            );

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundUsageId,
            );
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
            expect(fundUsageRepository.updateFundUsage).toHaveBeenCalledWith(
                fundUsageDataResult,
            );
        });

        it("should error execute update fund usage on update fund usage for honorarium activity", async () => {
            fundUsageRepository.updateFundUsage = mockData.updateFundUsageError;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).toHaveBeenCalledWith(fundUsageDataResult);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on subscribe event for pay salary", async () => {
            fundUsageRepository.isFundUsageIdExist = mockData.fundUsageIdExist;
            eventBus.subscribe = mockData.subscribeErrorPaySalary;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataNewHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                expect(
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on subscribe event for delete salary", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdExistHRDiffDuration;
            eventBus.subscribe = mockData.subscribeErrorDeleteSalary;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryDeletedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    3,
                    cancelEmployeeSalaryEventName,
                    {
                        ...employeeSalaryDeletedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryDeletedEventName,
                    expect.any(Function),
                );
                expect(
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on subscribe event for update salary", async () => {
            eventBus.subscribe = mockData.subscribeErrorUpdateSalary;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataNewHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                expect(eventBus.removeSpecificListener).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryUpdatedEventName,
                );
                expect(eventBus.publish).toHaveBeenNthCalledWith(
                    3,
                    updateEmployeeSalaryEventName,
                    {
                        ...employeeSalaryUpdatedEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenNthCalledWith(
                    3,
                    employeeSalaryUpdatedEventName,
                    expect.any(Function),
                );
                expect(
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on same HR for replace honorarium activity diff duration", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdExistHRDiffDuration;
            mockedFundUsageService.prototype.validateUniqueFundUsageHR =
                mockData.fundUsageSameHRExist;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataNewHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    `Data penggunaan dana untuk sub aktivitas ${requestFundUsageDataNewHR.sub_aktivitas} kepada ${requestFundUsageDataNewHR.penerima} pada ${fundUsageMonth} ${fundUsageYear} telah dilaporkan`,
                );
            }
        });

        it("should error execute update fund usage on same HR for replace universal activity to honorarium activity", async () => {
            fundUsageRepository.isFundUsageIdExist = mockData.fundUsageIdExist;
            mockedFundUsageService.prototype.validateUniqueFundUsageHR =
                mockData.fundUsageSameHRExist;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataNewHR,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    `Data penggunaan dana untuk sub aktivitas ${requestFundUsageDataNewHR.sub_aktivitas} kepada ${requestFundUsageDataNewHR.penerima} pada ${fundUsageMonth} ${fundUsageYear} telah dilaporkan`,
                );
            }
        });

        it("should error execute update fund usage on sub activity not found", async () => {
            mockedFundUsageEntity.prototype.verifySubActivityMasterData =
                mockData.verifySubActivityMasterDataError;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataSubActivityNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Sub aktivitas keuangan tidak terdaftar",
                );
            }
        });

        it("should error execute update fund usage on subscribe event sub activity", async () => {
            eventBus.subscribe = mockData.subscribeErrorSubActivity;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on activity not found", async () => {
            mockedFundUsageEntity.prototype.verifyActivityMasterData =
                mockData.verifyActivityMasterDataError;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataActivityNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Aktivitas keuangan tidak terdaftar",
                );
            }
        });

        it("should error execute update fund usage on subscribe event activity", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
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
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update fund usage on asynchronous activity and sub activity", async () => {
            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataAsync,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenCalledWith();
                expect(eventBus.publish).not.toHaveBeenCalledWith();
                expect(eventBus.subscribe).not.toHaveBeenCalledWith();
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Aktivitas dan sub aktivitas honorarium tidak sesuai",
                );
            }
        });

        it("should error execute update fund usage on empty fund usage", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdNotExist;

            try {
                await updateFundUsageCommandHandler.execute(
                    requestFundUsageDataAsync,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundUsageId);
                expect(
                    eventBus.removeSpecificListener,
                ).not.toHaveBeenCalledWith();
                expect(eventBus.publish).not.toHaveBeenCalledWith();
                expect(eventBus.subscribe).not.toHaveBeenCalledWith();
                expect(
                    mockedFundUsageEntity.prototype.verifyActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedFundUsageEntity.prototype.verifySubActivityMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    fundUsageRepository.updateFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data penggunaan dana tidak ditemukan",
                );
            }
        });
    });
});
