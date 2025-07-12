import { StatusCodes } from "http-status-codes";
import { Sequelize, Transaction } from "sequelize";
import { ApplicationError } from "../../../../shared/abstract";
import { SalaryEntity, SalaryProps, UserProps } from "../../domain/entity";
import { SalaryStatus, UserRole } from "../../domain/enum";
import { ISalaryRepository } from "../../domain/repository";
import { SalaryRepository } from "../../infrastructure/storage/repository";

describe("Testing Salary Repository", () => {
    const userData: UserProps = {
        id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        nip: "012345678901234567",
        nama_lengkap: "Test User",
        email: "testuser@gmail.com",
        password:
            "$2b$10$t7oxiwchWGHa/B9w0AzrYO2WH2rQbA86YSuQjSTmwIrpC/0ZXN7V2",
        role: UserRole.FINANCE_ADMIN,
        nama_bank: "Test Bank",
        pemilik_rekening: "User Bank",
        nomor_rekening: "135349212211",
        login_at: undefined,
    };


    const mockSalaryData: SalaryProps = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        user_id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
        status_pembayaran: SalaryStatus.PAID,
    };

    const salaryDataRequested = new SalaryEntity<SalaryProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nama_lengkap: "Test User",
        tanggal_pembayaran: new Date("2023-10-14"),
        nominal: 2000000,
        status_pembayaran: SalaryStatus.PAID,
        user_id: "4e8d035d-0434-48cc-a4c3-270f1614739a",
    });

    const mockData = {
        transaction: jest
            .fn()
            .mockImplementation(
                async (callback: (t: Transaction) => Promise<void>) => {
                    await callback({} as Transaction);
                },
            ),
        transactionError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        modified: jest.fn(),
        modifiedError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        findOne: jest.fn().mockReturnValue(mockSalaryData),
        findOneNull: jest.fn().mockReturnValue(null),
        findOneError: jest
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

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.transaction = mockData.transaction;
        mockedDatabase.models.gaji = {
            create: mockData.modified,
            destroy: mockData.modified,
            findOne: mockData.findOne,
        } as any;
        salaryRepository = new SalaryRepository(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [transactionRun, userId, fullName, paymentDate] = [
        {},
        "4e8d035d-0434-48cc-a4c3-270f1614739a",
        "Test User",
        new Date("2023-10-14"),
    ];
    describe("Add Salary", () => {
        it("should success add a salary data", async () => {
            await salaryRepository.addSalary(salaryDataRequested);

            expect(mockedDatabase.models.gaji.create).toHaveBeenCalledWith({
                ...salaryDataRequested,
                id_user: userId,
            });
        });

        it("should error add a salary data", async () => {
            mockedDatabase.models.gaji.create = mockData.modifiedError;

            try {
                await salaryRepository.addSalary(salaryDataRequested);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.gaji.create).toHaveBeenCalledWith({
                    ...salaryDataRequested,
                    id_user: userId,
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Salary", () => {
        it("should success update salary data", async () => {
            await salaryRepository.updateSalary(
                salaryDataRequested,
                mockSalaryData,
            );

            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(mockedDatabase.models.gaji.destroy).toHaveBeenCalledWith({
                where: {
                    nama_lengkap: fullName,
                    tanggal_pembayaran: paymentDate,
                },
                transaction: transactionRun,
            });
            expect(mockedDatabase.models.gaji.create).toHaveBeenCalledWith(
                {
                    ...salaryDataRequested,
                    id_user: userId,
                },
                { transaction: transactionRun },
            );
        });

        it("should error update salary data on create salary data", async () => {
            mockedDatabase.models.gaji.create = mockData.modifiedError;

            try {
                await salaryRepository.updateSalary(
                    salaryDataRequested,
                    mockSalaryData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(mockedDatabase.models.gaji.destroy).toHaveBeenCalledWith(
                    {
                        where: {
                            nama_lengkap: fullName,
                            tanggal_pembayaran: paymentDate,
                        },
                        transaction: transactionRun,
                    },
                );
                expect(mockedDatabase.models.gaji.create).toHaveBeenCalledWith(
                    {
                        ...salaryDataRequested,
                        id_user: userId,
                    },
                    { transaction: transactionRun },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error update salary data on delete old salary data", async () => {
            mockedDatabase.models.gaji.destroy = mockData.modifiedError;

            try {
                await salaryRepository.updateSalary(
                    salaryDataRequested,
                    mockSalaryData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(mockedDatabase.models.gaji.destroy).toHaveBeenCalledWith(
                    {
                        where: {
                            nama_lengkap: fullName,
                            tanggal_pembayaran: paymentDate,
                        },
                        transaction: transactionRun,
                    },
                );
                expect(
                    mockedDatabase.models.gaji.create,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error update salary data on begin transaction", async () => {
            mockedDatabase.transaction = mockData.transactionError;

            try {
                await salaryRepository.updateSalary(
                    salaryDataRequested,
                    mockSalaryData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.gaji.destroy,
                ).not.toHaveBeenCalled();
                expect(
                    mockedDatabase.models.gaji.create,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete Salary", () => {
        it("should success delete salary data", async () => {
            await salaryRepository.deleteSalary(fullName, paymentDate);

            expect(mockedDatabase.models.gaji.destroy).toHaveBeenCalledWith({
                where: {
                    nama_lengkap: fullName,
                    tanggal_pembayaran: paymentDate,
                },
            });
        });

        it("should error delete salary data", async () => {
            mockedDatabase.models.gaji.destroy = mockData.modifiedError;

            try {
                await salaryRepository.deleteSalary(fullName, paymentDate);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.gaji.destroy).toHaveBeenCalledWith(
                    {
                        where: {
                            nama_lengkap: fullName,
                            tanggal_pembayaran: paymentDate,
                        },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Salary Data", () => {
        it("should success return a salary data", async () => {
            const salary = await salaryRepository.isSalaryDataExist(
                fullName,
                paymentDate,
            );

            expect(mockedDatabase.models.gaji.findOne).toHaveBeenCalledWith({
                where: {
                    nama_lengkap: fullName,
                    tanggal_pembayaran: paymentDate,
                },
            });
            expect(salary).toEqual(mockSalaryData);
        });

        it("should success return an empty salary data", async () => {
            mockedDatabase.models.gaji.findOne = mockData.findOneNull;

            const salary = await salaryRepository.isSalaryDataExist(
                fullName,
                paymentDate,
            );
            expect(mockedDatabase.models.gaji.findOne).toHaveBeenCalledWith({
                where: {
                    nama_lengkap: fullName,
                    tanggal_pembayaran: paymentDate,
                },
            });
            expect(salary).toBeNull();
        });

        it("should error return a salary data", async () => {
            mockedDatabase.models.gaji.findOne = mockData.findOneError;

            try {
                await salaryRepository.isSalaryDataExist(fullName, paymentDate);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.models.gaji.findOne).toHaveBeenCalledWith(
                    {
                        where: {
                            nama_lengkap: fullName,
                            tanggal_pembayaran: paymentDate,
                        },
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
