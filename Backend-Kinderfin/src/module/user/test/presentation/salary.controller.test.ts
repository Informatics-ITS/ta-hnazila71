import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    DeleteSalaryCommandHandler,
    InputSalaryCommandHandler,
    UpdateSalaryCommandHandler,
} from "../../application/command";
import { SalaryProps } from "../../domain/entity";
import { SalaryStatus, UserRole } from "../../domain/enum";
import { SalaryDataRetrievedEvent } from "../../domain/event";
import { ISalaryRepository } from "../../domain/repository";
import { SalaryQueryHandler } from "../../infrastructure/storage/query";
import { SalaryRepository } from "../../infrastructure/storage/repository";
import { SalaryController } from "../../presentation/controller";
import { ISalaryQueryHandler } from "./../../application/query";

describe("Testing Salary Controller", () => {
    const salaryDataResult: SalaryProps[] = [
        {
            id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
            nama_lengkap: "Test User A",
            tanggal_pembayaran: new Date("2023-10-13"),
            nominal: 1800000,
            user_id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            status_pembayaran: SalaryStatus.PAID,
        },
        {
            id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
            nama_lengkap: "Test User B",
            tanggal_pembayaran: new Date("2023-10-14"),
            nominal: 2000000,
            user_id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            status_pembayaran: SalaryStatus.PAID,
        },
    ];

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
        getAllSalaries: jest.fn().mockReturnValue(salaryDataResult),
        getError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let salaryRepository: ISalaryRepository;
    let salaryQueryHandler: ISalaryQueryHandler;
    let eventBus: EventBus;
    let salaryController: SalaryController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        salaryRepository = new SalaryRepository(mockedDatabase);
        salaryQueryHandler = new SalaryQueryHandler(mockedDatabase);
        salaryQueryHandler = {
            getAllSalaries: mockData.getAllSalaries,
        } as any;
        eventBus = new EventBus();
        eventBus.publish = mockData.publish;
        salaryController = new SalaryController(
            salaryRepository,
            salaryQueryHandler,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const requestInputSalaryData = {
        data: {
            tanggal: new Date("2023-10-14"),
            penerima: "Test User",
            jumlah: 2000000,
        },
        eventName: "PayEmployeeSalary",
    };
    let mockedInputSalaryCommandHandler: jest.MockedClass<
        typeof InputSalaryCommandHandler
    >;
    describe("Input Salary Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedInputSalaryCommandHandler =
                InputSalaryCommandHandler as jest.MockedClass<
                    typeof InputSalaryCommandHandler
                >;
            mockedInputSalaryCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success execute input salary", async () => {
            await salaryController.inputSalary(requestInputSalaryData);

            expect(
                mockedInputSalaryCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                nama_lengkap: requestInputSalaryData.data.penerima,
                tanggal_pembayaran: requestInputSalaryData.data.tanggal,
                nominal: requestInputSalaryData.data.jumlah,
            });
        });
    });

    const [userId, role] = [
        "5a53d571-f85b-4373-8935-bc7eefab74f6",
        UserRole.FINANCE_ADMIN,
    ];
    const [
        salaryDataRequested,
        salaryDataRetrieved,
        salaryDataRetrievedEventName,
    ] = [
            {
                data: { id_user: userId, role: role },
                eventName: "UserDataRequestedByFullName",
            },
            salaryDataResult,
            "SalaryDataRetrieved",
        ];
    const salaryDataRetrievedSuccessEvent = new SalaryDataRetrievedEvent(
        salaryDataRetrieved,
        salaryDataRetrievedEventName,
    );
    const salaryDataRetrievedFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        eventName: salaryDataRetrievedEventName,
    };
    describe("Send Salary Data Controller", () => {
        it("should success return response send salary data", async () => {
            await salaryController.sendSalaryData(salaryDataRequested);

            expect(salaryQueryHandler.getAllSalaries).toHaveBeenCalledWith({});
            expect(eventBus.publish).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
                {
                    ...salaryDataRetrievedSuccessEvent,
                    eventOccurred: expect.anything(),
                },
            );
        });

        it("should error return response send salary data", async () => {
            salaryQueryHandler.getAllSalaries = mockData.getError;

            await salaryController.sendSalaryData(salaryDataRequested);

            expect(salaryQueryHandler.getAllSalaries).toHaveBeenCalledWith({});
            expect(eventBus.publish).toHaveBeenCalledWith(
                salaryDataRetrievedEventName,
                salaryDataRetrievedFailedEvent,
            );
        });
    });

    const [
        requestUpdateSalaryData,
        requestUpdateSalaryDataEmpty,
        employeeSalaryUpdatedEventName,
    ] = [
            {
                data: {
                    tanggal: new Date("2023-10-14"),
                    penerima: "Test User C",
                    jumlah: 2000000,
                    penggunaan_dana_lama: {
                        id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
                        tanggal: new Date("2023-10-13"),
                        penerima: "Test User A",
                        jumlah: 2000000,
                    },
                },
                eventName: "UpdateEmployeeSalary",
            },
            {
                data: {
                    penggunaan_dana_lama: {
                        id: "78365f59-680e-43ec-a793-4f0cbc7801ee",
                        tanggal: new Date("2023-10-13"),
                        penerima: "Test User A",
                        jumlah: 2000000,
                    },
                },
                eventName: "UpdateEmployeeSalary",
            },
            "EmployeeSalaryUpdated",
        ];
    const employeeSalaryPaidFailedEvent = {
        data: {
            status: "error",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        },
        eventName: employeeSalaryUpdatedEventName,
    };
    let mockedUpdateSalaryCommandHandler: jest.MockedClass<
        typeof UpdateSalaryCommandHandler
    >;
    describe("Update Salary Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedUpdateSalaryCommandHandler =
                UpdateSalaryCommandHandler as jest.MockedClass<
                    typeof UpdateSalaryCommandHandler
                >;
            mockedUpdateSalaryCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response update salary", async () => {
            await salaryController.updateSalary(requestUpdateSalaryData);

            expect(
                mockedUpdateSalaryCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                nama_lengkap: requestUpdateSalaryData.data.penerima,
                tanggal_pembayaran: requestUpdateSalaryData.data.tanggal,
                nominal: requestUpdateSalaryData.data.jumlah,
                nama_lengkap_lama:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.penerima,
                tanggal_pembayaran_lama:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.tanggal,
            });
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it("should success return response update salary empty", async () => {
            await salaryController.updateSalary(requestUpdateSalaryDataEmpty);

            expect(
                mockedUpdateSalaryCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                nama_lengkap:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.penerima,
                tanggal_pembayaran:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.tanggal,
                nominal:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.jumlah,
                nama_lengkap_lama:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.penerima,
                tanggal_pembayaran_lama:
                    requestUpdateSalaryData.data.penggunaan_dana_lama.tanggal,
            });
            expect(eventBus.publish).not.toHaveBeenCalled();
        });

        it("should error return response update salary on update data", async () => {
            mockedUpdateSalaryCommandHandler.prototype.execute =
                mockData.executeError;

            try {
                await salaryController.updateSalary(requestUpdateSalaryData);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedUpdateSalaryCommandHandler.prototype.execute,
                ).toHaveBeenCalledWith({
                    nama_lengkap: requestUpdateSalaryData.data.penerima,
                    tanggal_pembayaran: requestUpdateSalaryData.data.tanggal,
                    nominal: requestUpdateSalaryData.data.jumlah,
                    nama_lengkap_lama:
                        requestUpdateSalaryData.data.penggunaan_dana_lama
                            .penerima,
                    tanggal_pembayaran_lama:
                        requestUpdateSalaryData.data.penggunaan_dana_lama
                            .tanggal,
                });
                expect(eventBus.publish).toHaveBeenCalledWith(
                    employeeSalaryUpdatedEventName,
                    employeeSalaryPaidFailedEvent,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const requestDeletedSalaryData = {
        data: {
            tanggal: new Date("2023-10-14"),
            penerima: "Test User",
        },
        eventName: "CancelEmployeeSalary",
    };
    let mockedDeleteSalaryCommandHandler: jest.MockedClass<
        typeof DeleteSalaryCommandHandler
    >;
    describe("Delete Salary Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockedDeleteSalaryCommandHandler =
                DeleteSalaryCommandHandler as jest.MockedClass<
                    typeof DeleteSalaryCommandHandler
                >;
            mockedDeleteSalaryCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success execute delete salary", async () => {
            await salaryController.deleteSalary(requestDeletedSalaryData);

            expect(
                mockedDeleteSalaryCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                nama_lengkap: requestDeletedSalaryData.data.penerima,
                tanggal_pembayaran: requestDeletedSalaryData.data.tanggal,
            });
        });
    });
});
