import { StatusCodes } from "http-status-codes";
import { Sequelize, Transaction } from "sequelize";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofEntity,
    PaymentProofProps,
} from "../../domain/entity";
import {
    IPaymentProofRepository,
    PaymentProofResult,
} from "../../domain/repository";
import { PaymentProofRepository } from "../../infrastructure/storage/repository";
const imagekitConfig = appConfig.get("/imagekit");

describe("Testing Payment Proof Repository", () => {
    const mockPaymentProofData: PaymentProofResult = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        id_file_pembayaran: "65227b5688c257da338e66f8",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-09-28"),
        nama_lengkap: "Test User A",
        jenis_pembayaran: "Daftar Ujian",
        nrp: undefined,
        email: "testinga@gmail.com",
        nomor_telepon: "081234567890",
    };

    const requestPaymentFileData = new PaymentFileEntity<PaymentFileProps>({
        id: "65227b5688c257da338e66f8",
        nama: "pikti_test.png",
        url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
        path: "/test-url-1",
    });

    const requestPaymentProofData = new PaymentProofEntity<PaymentProofProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        file_pembayaran: requestPaymentFileData,
    } as PaymentProofProps);

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
        getFilePembayaran: jest.fn().mockReturnValue(requestPaymentFileData),
        getFilePembayaranUndefined: jest.fn().mockReturnValue(undefined),
        deleteFilePembayaran: jest.fn(),
        findByPk: jest.fn().mockReturnValue(mockPaymentProofData),
        findByPkNull: jest.fn().mockReturnValue(null),
        findByPkError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    jest.mock("../../domain/entity");
    let mockedDatabase: Sequelize;
    let mockedPaymentProofEntity: jest.MockedClass<typeof PaymentProofEntity>;
    let paymentProofRepository: IPaymentProofRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.transaction = mockData.transaction;
        mockedDatabase.models.file_pembayaran = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
        } as any;
        mockedDatabase.models.bukti_pembayaran = {
            create: mockData.modified,
            update: mockData.modified,
            destroy: mockData.modified,
            findByPk: mockData.findByPk,
        } as any;
        mockedPaymentProofEntity = PaymentProofEntity as jest.MockedClass<
            typeof PaymentProofEntity
        >;
        mockedPaymentProofEntity.prototype.getFilePembayaran =
            mockData.getFilePembayaran;
        paymentProofRepository = new PaymentProofRepository(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [transactionRun, paymentProofId, paymentFileId] = [
        {},
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "65227b5688c257da338e66f8",
    ];

    describe("Add Payment Proof", () => {
        it("should success add payment proof data", async () => {
            await paymentProofRepository.addPaymentProof(
                requestPaymentProofData,
            );

            expect(
                mockedPaymentProofEntity.prototype.getFilePembayaran,
            ).toHaveBeenCalled();
            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.file_pembayaran.create,
            ).toHaveBeenCalledWith(requestPaymentFileData, {
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.bukti_pembayaran.create,
            ).toHaveBeenCalledWith(
                {
                    ...requestPaymentProofData,
                    id_file_pembayaran: paymentFileId,
                },
                { transaction: transactionRun },
            );
        });

        it("should success add payment proof data without payment file", async () => {
            mockedPaymentProofEntity.prototype.getFilePembayaran =
                mockData.getFilePembayaranUndefined;

            await paymentProofRepository.addPaymentProof(
                requestPaymentProofData,
            );

            expect(
                mockedPaymentProofEntity.prototype.getFilePembayaran,
            ).toHaveBeenCalled();
            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.file_pembayaran.create,
            ).toHaveBeenNthCalledWith(1, undefined, {
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.bukti_pembayaran.create,
            ).toHaveBeenNthCalledWith(
                2,
                {
                    ...requestPaymentProofData,
                    id_file_pembayaran: undefined,
                },
                { transaction: transactionRun },
            );
        });

        it("should error add payment proof data on create payment data", async () => {
            mockedDatabase.models.bukti_pembayaran.create =
                mockData.modifiedError;

            try {
                await paymentProofRepository.addPaymentProof(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.create,
                ).toHaveBeenCalledWith(requestPaymentFileData, {
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.bukti_pembayaran.create,
                ).toHaveBeenCalledWith(
                    {
                        ...requestPaymentProofData,
                        id_file_pembayaran: paymentFileId,
                    },
                    { transaction: transactionRun },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error add payment proof data on create payment file", async () => {
            mockedDatabase.models.file_pembayaran.create =
                mockData.modifiedError;

            try {
                await paymentProofRepository.addPaymentProof(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.create,
                ).toHaveBeenCalledWith(requestPaymentFileData, {
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.bukti_pembayaran.create,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error add payment proof data on begin transaction", async () => {
            mockedDatabase.transaction = mockData.transactionError;

            try {
                await paymentProofRepository.addPaymentProof(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.create,
                ).not.toHaveBeenCalled();
                expect(
                    mockedDatabase.models.bukti_pembayaran.create,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Update Payment Proof", () => {
        it("should success update payment proof data", async () => {
            await paymentProofRepository.updatePaymentProof(
                requestPaymentProofData,
                paymentFileId,
            );

            expect(
                mockedPaymentProofEntity.prototype.getFilePembayaran,
            ).toHaveBeenCalled();
            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.file_pembayaran.update,
            ).toHaveBeenCalledWith(requestPaymentFileData, {
                where: { id: paymentFileId },
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.bukti_pembayaran.update,
            ).toHaveBeenCalledWith(
                {
                    ...requestPaymentProofData,
                    id_file_pembayaran: paymentFileId,
                },
                {
                    where: { id: paymentProofId },
                    transaction: transactionRun,
                },
            );
        });

        it("should success update payment proof data without payment file", async () => {
            mockedPaymentProofEntity.prototype.getFilePembayaran =
                mockData.getFilePembayaranUndefined;

            await paymentProofRepository.updatePaymentProof(
                requestPaymentProofData,
                paymentFileId,
            );

            expect(
                mockedPaymentProofEntity.prototype.getFilePembayaran,
            ).toHaveBeenCalled();
            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.bukti_pembayaran.update,
            ).toHaveBeenCalledWith(
                {
                    ...requestPaymentProofData,
                    id_file_pembayaran: undefined,
                },
                {
                    where: { id: paymentProofId },
                    transaction: transactionRun,
                },
            );
        });

        it("should error update payment proof data on update payment data", async () => {
            mockedDatabase.models.bukti_pembayaran.update =
                mockData.modifiedError;

            try {
                await paymentProofRepository.updatePaymentProof(
                    requestPaymentProofData,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.update,
                ).toHaveBeenCalledWith(requestPaymentFileData, {
                    where: { id: paymentFileId },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.bukti_pembayaran.update,
                ).toHaveBeenCalledWith(
                    {
                        ...requestPaymentProofData,
                        id_file_pembayaran: paymentFileId,
                    },
                    {
                        where: { id: paymentProofId },
                        transaction: transactionRun,
                    },
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error update payment proof data on update payment file", async () => {
            mockedDatabase.models.file_pembayaran.update =
                mockData.modifiedError;

            try {
                await paymentProofRepository.updatePaymentProof(
                    requestPaymentProofData,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.update,
                ).toHaveBeenCalledWith(requestPaymentFileData, {
                    where: { id: paymentFileId },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.bukti_pembayaran.update,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error update payment proof data on begin transaction", async () => {
            mockedDatabase.transaction = mockData.transactionError;

            try {
                await paymentProofRepository.updatePaymentProof(
                    requestPaymentProofData,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedPaymentProofEntity.prototype.getFilePembayaran,
                ).toHaveBeenCalled();
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.update,
                ).not.toHaveBeenCalled();
                expect(
                    mockedDatabase.models.bukti_pembayaran.update,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Delete Payment Proof", () => {
        it("should success delete payment proof data", async () => {
            await paymentProofRepository.deletePaymentProof(
                paymentProofId,
                paymentFileId,
            );

            expect(mockedDatabase.transaction).toHaveBeenCalled();
            expect(
                mockedDatabase.models.bukti_pembayaran.destroy,
            ).toHaveBeenCalledWith({
                where: { id: paymentProofId },
                transaction: transactionRun,
            });
            expect(
                mockedDatabase.models.file_pembayaran.destroy,
            ).toHaveBeenCalledWith({
                where: { id: paymentFileId },
                transaction: transactionRun,
            });
        });

        it("should error delete payment proof data on delete payment file", async () => {
            mockedDatabase.models.file_pembayaran.destroy =
                mockData.modifiedError;

            try {
                await paymentProofRepository.deletePaymentProof(
                    paymentProofId,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.bukti_pembayaran.destroy,
                ).toHaveBeenCalledWith({
                    where: { id: paymentProofId },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.file_pembayaran.destroy,
                ).toHaveBeenCalledWith({
                    where: { id: paymentFileId },
                    transaction: transactionRun,
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error delete payment proof data on delete payment data", async () => {
            mockedDatabase.models.bukti_pembayaran.destroy =
                mockData.modifiedError;

            try {
                await paymentProofRepository.deletePaymentProof(
                    paymentProofId,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.bukti_pembayaran.destroy,
                ).toHaveBeenCalledWith({
                    where: { id: paymentProofId },
                    transaction: transactionRun,
                });
                expect(
                    mockedDatabase.models.file_pembayaran.destroy,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error delete payment proof data on begin transaction", async () => {
            mockedDatabase.transaction = mockData.transactionError;

            try {
                await paymentProofRepository.deletePaymentProof(
                    paymentProofId,
                    paymentFileId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedDatabase.transaction).toHaveBeenCalled();
                expect(
                    mockedDatabase.models.bukti_pembayaran.destroy,
                ).not.toHaveBeenCalled();
                expect(
                    mockedDatabase.models.file_pembayaran.destroy,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    describe("Check Payment Proof Data By Id", () => {
        it("should success return a payment proof data by id", async () => {
            const paymentProof =
                await paymentProofRepository.isPaymentProofIdExist(
                    paymentProofId,
                );

            expect(
                mockedDatabase.models.bukti_pembayaran.findByPk,
            ).toHaveBeenCalledWith(paymentProofId);
            expect(paymentProof).toEqual(mockPaymentProofData);
        });

        it("should success return an empty payment proof data by id", async () => {
            mockedDatabase.models.bukti_pembayaran.findByPk =
                mockData.findByPkNull;

            const paymentProof =
                await paymentProofRepository.isPaymentProofIdExist(
                    paymentProofId,
                );

            expect(
                mockedDatabase.models.bukti_pembayaran.findByPk,
            ).toHaveBeenCalledWith(paymentProofId);
            expect(paymentProof).toBeNull();
        });

        it("should error return a payment proof data by id", async () => {
            mockedDatabase.models.bukti_pembayaran.findByPk =
                mockData.findByPkError;

            try {
                await paymentProofRepository.isPaymentProofIdExist(
                    paymentProofId,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.bukti_pembayaran.findByPk,
                ).toHaveBeenCalledWith(paymentProofId);
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
