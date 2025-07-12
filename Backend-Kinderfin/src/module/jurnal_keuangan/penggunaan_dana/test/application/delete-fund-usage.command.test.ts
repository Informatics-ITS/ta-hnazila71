import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    DeleteFundUsageCommand,
    DeleteFundUsageCommandHandler,
} from "../../application/command";
import { FundUsageProps } from "../../domain/entity";
import { SalaryCancelledEvent } from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageRepository } from "../../infrastructure/storage/repository";

describe("Testing Delete Fund Usage Command", () => {
    const oldfundUsageHR: FundUsageProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Honorarium",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
        sub_aktivitas: "HR Test",
        uraian: "Honorarium Test PIKTI Oktober 2023",
        jumlah: 1500000,
    };

    const oldfundUsage: FundUsageProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        aktivitas: "Layanan Kantor",
        tanggal: new Date("2023-10-12"),
        penerima: "Alpha",
        sub_aktivitas: "Cetak KTM",
        uraian: "Cetak KTM atas nama Alpha",
        jumlah: 350000,
    };

    const requestFundUsageData: DeleteFundUsageCommand = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        tanggal: new Date("2023-10-12"),
        penerima: "Test User",
    };

    const [
        cancelEmployeeSalaryEventName,
        employeeSalaryDeletedEventName,
        fundusageId,
    ] = [
        "CancelEmployeeSalary",
        "EmployeeSalaryDeleted",
        "4e8d035d-0434-48cc-a4c3-270f1614739a",
    ];

    const employeeSalaryCancelledEvent = new SalaryCancelledEvent(
        requestFundUsageData,
        cancelEmployeeSalaryEventName,
    );

    const mockData = {
        fundUsageIdExist: jest.fn().mockReturnValue(oldfundUsage),
        fundUsageIdExistHR: jest.fn().mockReturnValue(oldfundUsageHR),
        fundUsageIdNotExist: jest.fn().mockReturnValue(null),
        deleteFundUsage: jest.fn(),
        deleteFundUsageError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        removeSpecificListener: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn().mockImplementationOnce((eventName, callback) => {
            if (eventName === employeeSalaryDeletedEventName) {
                callback({
                    data: "success",
                    eventName: employeeSalaryDeletedEventName,
                });
            }
        }),
        subscribeError: jest
            .fn()
            .mockImplementationOnce((eventName, callback) => {
                if (eventName === employeeSalaryDeletedEventName) {
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
    };

    let mockedDatabase: Sequelize;
    let fundUsageRepository: IFundUsageRepository;
    let eventBus: EventBus;
    let deleteFundUsageCommandHandler: ICommandHandler<
        DeleteFundUsageCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        fundUsageRepository = new FundUsageRepository(mockedDatabase);
        fundUsageRepository = {
            isFundUsageIdExist: mockData.fundUsageIdExistHR,
            deleteFundUsage: mockData.deleteFundUsage,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        deleteFundUsageCommandHandler = new DeleteFundUsageCommandHandler(
            fundUsageRepository,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Execute Delete Fund Usage", () => {
        it("should success execute delete fund usage for honorarium activity", async () => {
            await deleteFundUsageCommandHandler.execute(requestFundUsageData);

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundusageId,
            );
            expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                employeeSalaryDeletedEventName,
            );
            expect(eventBus.publish).toHaveBeenCalledWith(
                cancelEmployeeSalaryEventName,
                {
                    ...employeeSalaryCancelledEvent,
                    eventOccurred: expect.anything(),
                },
            );
            expect(eventBus.subscribe).toHaveBeenCalledWith(
                employeeSalaryDeletedEventName,
                expect.any(Function),
            );
            expect(fundUsageRepository.deleteFundUsage).toHaveBeenCalledWith(
                fundusageId,
            );
        });

        it("should success execute delete fund usage for universal activity", async () => {
            fundUsageRepository.isFundUsageIdExist = mockData.fundUsageIdExist;

            await deleteFundUsageCommandHandler.execute(requestFundUsageData);

            expect(fundUsageRepository.isFundUsageIdExist).toHaveBeenCalledWith(
                fundusageId,
            );
            expect(eventBus.removeSpecificListener).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
            expect(eventBus.subscribe).not.toHaveBeenCalled();
            expect(fundUsageRepository.deleteFundUsage).toHaveBeenCalledWith(
                fundusageId,
            );
        });

        it("should error execute delete fund usage on delete fund usage", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdExist;
            fundUsageRepository.deleteFundUsage = mockData.deleteFundUsageError;

            try {
                await deleteFundUsageCommandHandler.execute(requestFundUsageData);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundusageId);
                expect(
                    fundUsageRepository.deleteFundUsage,
                ).toHaveBeenCalledWith(fundusageId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete fund usage on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await deleteFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundusageId);
                expect(eventBus.removeSpecificListener).toHaveBeenCalledWith(
                    employeeSalaryDeletedEventName,
                );
                expect(eventBus.publish).toHaveBeenCalledWith(
                    cancelEmployeeSalaryEventName,
                    {
                        ...employeeSalaryCancelledEvent,
                        eventOccurred: expect.anything(),
                    },
                );
                expect(eventBus.subscribe).toHaveBeenCalledWith(
                    employeeSalaryDeletedEventName,
                    expect.any(Function),
                );
                expect(
                    fundUsageRepository.deleteFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete fund usage on empty fund usage", async () => {
            fundUsageRepository.isFundUsageIdExist =
                mockData.fundUsageIdNotExist;

            try {
                await deleteFundUsageCommandHandler.execute(
                    requestFundUsageData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    fundUsageRepository.isFundUsageIdExist,
                ).toHaveBeenCalledWith(fundusageId);
                expect(eventBus.removeSpecificListener).not.toHaveBeenCalled();
                expect(eventBus.publish).not.toHaveBeenCalled();
                expect(eventBus.subscribe).not.toHaveBeenCalled();
                expect(
                    fundUsageRepository.deleteFundUsage,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data penggunaan dana tidak ditemukan",
                );
            }
        });
    });
});
