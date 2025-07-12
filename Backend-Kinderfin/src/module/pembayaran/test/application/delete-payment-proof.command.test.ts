import { StatusCodes } from "http-status-codes";
import ImageKit from "imagekit";
import { Sequelize } from "sequelize";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import {
    DeletePaymentProofCommand,
    DeletePaymentProofCommandHandler,
} from "../../application/command";
import { IFileService } from "../../application/service";
import {
    IPaymentProofRepository,
    PaymentProofResult,
} from "../../domain/repository";
import { FileService } from "../../infrastructure/service";
import { PaymentProofRepository } from "../../infrastructure/storage/repository";

jest.mock("imagekit");

describe("Testing Delete PaymentProof Command", () => {
    const paymentProofResult: PaymentProofResult = {
        id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
        id_file_pembayaran: "65227b5688c257da338e66f8",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User A",
        jenis_pembayaran: "Daftar Ujian",
        nrp: undefined,
        email: "testinga@gmail.com",
        nomor_telepon: "081234567890",
    };

    const requestPaymentProofData: DeletePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
    };

    const mockData = {
        paymentProofIdExist: jest.fn().mockReturnValue(paymentProofResult),
        paymentProofIdNotExist: jest.fn().mockReturnValue(null),
        deletePaymentProof: jest.fn(),
        deletePaymentProofError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        deleteFile: jest.fn(),
        deleteFileError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let paymentProofRepository: IPaymentProofRepository;
    let fileService: IFileService;
    let deletePaymentProofCommandHandler: ICommandHandler<
        DeletePaymentProofCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        paymentProofRepository = new PaymentProofRepository(mockedDatabase);
        paymentProofRepository = {
            isPaymentProofIdExist: mockData.paymentProofIdExist,
            deletePaymentProof: mockData.deletePaymentProof,
        } as any;
        fileService = new FileService(new ImageKit());
        fileService = {
            deleteFile: mockData.deleteFile,
        } as any;
        deletePaymentProofCommandHandler = new DeletePaymentProofCommandHandler(
            paymentProofRepository,
            fileService,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [paymentProofId, paymentFileId] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "65227b5688c257da338e66f8",
    ];
    describe("Execute Delete Payment Proof", () => {
        it("should success execute delete payment proof", async () => {
            await deletePaymentProofCommandHandler.execute(
                requestPaymentProofData,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
            expect(
                paymentProofRepository.deletePaymentProof,
            ).toHaveBeenCalledWith(paymentProofId, paymentFileId);
            expect(fileService.deleteFile).toHaveBeenCalledWith(paymentFileId);
        });

        it("should error execute delete payment proof on delete file", async () => {
            fileService.deleteFile = mockData.deleteFileError;

            try {
                await deletePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
                expect(
                    paymentProofRepository.deletePaymentProof,
                ).toHaveBeenCalledWith(paymentProofId, paymentFileId);
                expect(fileService.deleteFile).toHaveBeenCalledWith(
                    paymentFileId,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete payment proof", async () => {
            paymentProofRepository.deletePaymentProof =
                mockData.deletePaymentProofError;

            try {
                await deletePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
                expect(
                    paymentProofRepository.deletePaymentProof,
                ).toHaveBeenCalledWith(paymentProofId, paymentFileId);
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute delete payment proof on empty payment proof", async () => {
            paymentProofRepository.isPaymentProofIdExist =
                mockData.paymentProofIdNotExist;

            try {
                await deletePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
                expect(
                    paymentProofRepository.deletePaymentProof,
                ).not.toHaveBeenCalled();
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.NOT_FOUND);
                expect(appErr.message).toEqual(
                    "Data bukti pembayaran tidak ditemukan",
                );
            }
        });
    });
});
