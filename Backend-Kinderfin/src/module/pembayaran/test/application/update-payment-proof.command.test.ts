import { StatusCodes } from "http-status-codes";
import ImageKit from "imagekit";
import { Sequelize } from "sequelize";
import { Readable } from "stream";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    UpdatePaymentProofCommand,
    UpdatePaymentProofCommandHandler,
} from "../../application/command";
import { IFileService } from "../../application/service";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofEntity,
    PaymentProofProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import {
    IPaymentProofRepository,
    PaymentProofResult,
} from "../../domain/repository";
import { FileService } from "../../infrastructure/service";
import { PaymentProofRepository } from "../../infrastructure/storage/repository";
const imagekitConfig = appConfig.get("/imagekit");

jest.mock("imagekit");

describe("Testing Update PaymentProof Command", () => {
    const masterDatas = [
        {
            id: "d79fabb5-e776-4725-8ca5-a898e6c29511",
            tipe: "Jenis Pembayaran",
            nilai: "Daftar Ujian",
            aturan: "Nomor Pendaftaran",
            deskripsi:
                "Jenis pembayaran untuk calon mahasiswa PIKTI daftar ujian",
        },
        {
            id: "4fca6786-461f-40b8-8a32-6062ffbf6565",
            tipe: "Jenis Pembayaran",
            nilai: "Training",
            aturan: null,
            deskripsi: "Jenis pembayaran untuk training di PIKTI",
        },
        {
            id: "138d2f14-6e2e-4794-8663-fb09c5006f35",
            tipe: "Jenis Pembayaran",
            nilai: "Angsuran 1",
            aturan: "Nomor Pendaftaran, NRP",
            deskripsi: "Jenis pembayaran untuk angsuran di PIKTI",
        },
    ];

    const paymentProofResult: PaymentProofResult = {
        id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
        id_file_pembayaran: "65227b5688c257da338e66f8",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User A",
        jenis_pembayaran: "Angsuran 1",
        nrp: "1820937821",
        email: "testinga@gmail.com",
        nomor_telepon: "081234567890",
    };

    const uploadedFile: Express.Multer.File = {
        fieldname: "file",
        originalname: "pikti_test.jpg",
        encoding: "7bit",
        mimetype: "image/jpg",
        size: 1024,
        stream: new Readable(),
        destination: "uploads/",
        filename: "pikti_test.jpg",
        path: "uploads/pikti_test.jpg",
        buffer: Buffer.from("payment file content"),
    };

    const requestPaymentProofData: UpdatePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const requestPaymentProofDataTraining: UpdatePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Training",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const requestPaymentProofDataAngsuran: UpdatePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Angsuran 1",
        nrp: "1820937821",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const requestPaymentProofDataWithoutPaymentType: UpdatePaymentProofCommand =
        {
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            tanggal_daftar: new Date("2023-10-28"),
            nama_lengkap: "Test User",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
            bukti_pembayaran: uploadedFile,
        };

    const requestPaymentProofDataWithoutFile: UpdatePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
    };

    const requestPaymentProofDataUnitNotFound: UpdatePaymentProofCommand = {
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ulang",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const paymentFileDataResult = new PaymentFileEntity<PaymentFileProps>({
        id: "65227b5688c257da338e66f8",
        nama: "pikti_test.png",
        url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
        path: "/test-url-1",
    });

    const paymentProofDataResult = new PaymentProofEntity<PaymentProofProps>({
        id: "3679285c-707c-42ed-9c6e-9984825b22fd",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        nrp: "1820937821",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        file_pembayaran: paymentFileDataResult,
    } as PaymentProofProps);

    const paymentProofDataResultTraining =
        new PaymentProofEntity<PaymentProofProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            nomor_pendaftaran: "012345678901234567",
            tanggal_daftar: new Date("2023-10-28"),
            nama_lengkap: "Test User",
            jenis_pembayaran: "Training",
            nrp: "1820937821",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
            file_pembayaran: paymentFileDataResult,
        } as PaymentProofProps);

    const paymentProofDataResultAngsuran =
        new PaymentProofEntity<PaymentProofProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            nomor_pendaftaran: "012345678901234567",
            tanggal_daftar: new Date("2023-10-28"),
            nama_lengkap: "Test User",
            jenis_pembayaran: "Angsuran 1",
            nrp: "1820937821",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
            file_pembayaran: paymentFileDataResult,
        } as PaymentProofProps);

    const paymentProofDataResultWithoutFile =
        new PaymentProofEntity<PaymentProofProps>({
            id: "3679285c-707c-42ed-9c6e-9984825b22fd",
            nomor_pendaftaran: "012345678901234567",
            tanggal_daftar: new Date("2023-10-28"),
            nama_lengkap: "Test User",
            jenis_pembayaran: "Daftar Ujian",
            nrp: "1820937821",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
        } as PaymentProofProps);

    const [
        masterDataRequestedEventName,
        masterDataRetrievedEventName,
        masterDataType,
    ] = ["MasterDataRequested", "MasterDataRetrieved", "Jenis Pembayaran"];

    const masterDataRequestedEvent = new MasterDataRequestedEvent(
        { tipe: masterDataType },
        masterDataRequestedEventName,
    );

    const mockData = {
        verifyPaymentTypeMasterData: jest
            .fn()
            .mockReturnValue({ constraint: "Nomor Pendaftaran", err: null }),
        verifyAllPaymentTypeMasterData: jest.fn().mockReturnValue({
            constraint: "Nomor Pendaftaran, NRP",
            err: null,
        }),
        verifyPaymentTypeMasterDataNull: jest
            .fn()
            .mockReturnValue({ constraint: "", err: null }),
        verifyPaymentTypeMasterDataError: jest.fn().mockReturnValue({
            constraint: undefined,
            err: Error("Jenis pembayaran tidak terdaftar"),
        }),
        validatePaymentTypeInput: jest.fn().mockReturnValue(null),
        validatePaymentTypeInputError: jest
            .fn()
            .mockReturnValue(Error("Data perlu dimasukkan")),
        paymentProofIdExist: jest.fn().mockReturnValue(paymentProofResult),
        paymentProofIdNotExist: jest.fn().mockReturnValue(null),
        updatePaymentProof: jest.fn(),
        updatePaymentProofError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
        uploadFile: jest.fn().mockReturnValue(paymentFileDataResult),
        uploadFileError: jest
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
    let mockedPaymentProofEntity: jest.MockedClass<typeof PaymentProofEntity>;
    let paymentProofRepository: IPaymentProofRepository;
    let fileService: IFileService;
    let eventBus: EventBus;
    let updatePaymentProofCommandHandler: ICommandHandler<
        UpdatePaymentProofCommand,
        void
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedPaymentProofEntity = PaymentProofEntity as jest.MockedClass<
            typeof PaymentProofEntity
        >;
        mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
            mockData.verifyPaymentTypeMasterData;
        mockedPaymentProofEntity.prototype.validatePaymentTypeInput =
            mockData.validatePaymentTypeInput;
        paymentProofRepository = new PaymentProofRepository(mockedDatabase);
        paymentProofRepository = {
            isPaymentProofIdExist: mockData.paymentProofIdExist,
            updatePaymentProof: mockData.updatePaymentProof,
        } as any;
        fileService = new FileService(new ImageKit());
        fileService = {
            uploadFile: mockData.uploadFile,
            deleteFile: mockData.deleteFile,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        updatePaymentProofCommandHandler = new UpdatePaymentProofCommandHandler(
            paymentProofRepository,
            fileService,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const [paymentProofId, paymentFileId] = [
        "3679285c-707c-42ed-9c6e-9984825b22fd",
        "65227b5688c257da338e66f8",
    ];
    describe("Execute Update PaymentProof", () => {
        it("should success execute update payment proof", async () => {
            await updatePaymentProofCommandHandler.execute(
                requestPaymentProofData,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith(masterDatas[0].aturan);
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(
                paymentProofRepository.updatePaymentProof,
            ).toHaveBeenCalledWith(paymentProofDataResult, paymentFileId);
            expect(fileService.deleteFile).toHaveBeenCalledWith(paymentFileId);
        });

        it("should success execute update payment proof training", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyPaymentTypeMasterDataNull;

            await updatePaymentProofCommandHandler.execute(
                requestPaymentProofDataTraining,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith("");
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(
                paymentProofRepository.updatePaymentProof,
            ).toHaveBeenCalledWith(
                paymentProofDataResultTraining,
                paymentFileId,
            );
            expect(fileService.deleteFile).toHaveBeenCalledWith(paymentFileId);
        });

        it("should success execute update payment proof angsuran", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyAllPaymentTypeMasterData;

            await updatePaymentProofCommandHandler.execute(
                requestPaymentProofDataAngsuran,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith(masterDatas[2].aturan);
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(
                paymentProofRepository.updatePaymentProof,
            ).toHaveBeenCalledWith(
                paymentProofDataResultAngsuran,
                paymentFileId,
            );
            expect(fileService.deleteFile).toHaveBeenCalledWith(paymentFileId);
        });

        it("should success execute update payment proof without payment type", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyAllPaymentTypeMasterData;

            await updatePaymentProofCommandHandler.execute(
                requestPaymentProofDataWithoutPaymentType,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith(masterDatas[2].aturan);
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(
                paymentProofRepository.updatePaymentProof,
            ).toHaveBeenCalledWith(
                paymentProofDataResultAngsuran,
                paymentFileId,
            );
            expect(fileService.deleteFile).toHaveBeenCalledWith(paymentFileId);
        });

        it("should success execute update payment proof without payment file", async () => {
            await updatePaymentProofCommandHandler.execute(
                requestPaymentProofDataWithoutFile,
            );

            expect(
                paymentProofRepository.isPaymentProofIdExist,
            ).toHaveBeenCalledWith(paymentProofId);
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith(masterDatas[0].aturan);
            expect(fileService.uploadFile).not.toHaveBeenCalled();
            expect(
                paymentProofRepository.updatePaymentProof,
            ).toHaveBeenCalledWith(
                paymentProofDataResultWithoutFile,
                paymentFileId,
            );
            expect(fileService.deleteFile).not.toHaveBeenCalled();
        });

        it("should error execute update payment proof on delete file", async () => {
            fileService.deleteFile = mockData.deleteFileError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).toHaveBeenCalledWith(masterDatas[0].aturan);
                expect(fileService.uploadFile).toHaveBeenCalledWith(
                    uploadedFile,
                );
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).toHaveBeenCalledWith(paymentProofDataResult, paymentFileId);
                expect(fileService.deleteFile).toHaveBeenCalledWith(
                    paymentFileId,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update payment proof", async () => {
            paymentProofRepository.updatePaymentProof =
                mockData.updatePaymentProofError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).toHaveBeenCalledWith(masterDatas[0].aturan);
                expect(fileService.uploadFile).toHaveBeenCalledWith(
                    uploadedFile,
                );
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).toHaveBeenCalledWith(paymentProofDataResult, paymentFileId);
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update payment proof on upload file", async () => {
            fileService.uploadFile = mockData.uploadFileError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).toHaveBeenCalledWith(masterDatas[0].aturan);
                expect(fileService.uploadFile).toHaveBeenCalledWith(
                    uploadedFile,
                );
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).not.toHaveBeenCalled();
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update payment proof on uncomplete payment type input", async () => {
            mockedPaymentProofEntity.prototype.validatePaymentTypeInput =
                mockData.validatePaymentTypeInputError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).toHaveBeenCalledWith(masterDatas[0].aturan);
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).not.toHaveBeenCalled();
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data perlu dimasukkan");
            }
        });

        it("should error execute update payment proof on payment type not found", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyPaymentTypeMasterDataError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofDataUnitNotFound,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).not.toHaveBeenCalled();
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).not.toHaveBeenCalled();
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jenis pembayaran tidak terdaftar",
                );
            }
        });

        it("should error execute update payment proof on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).not.toHaveBeenCalled();
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.updatePaymentProof,
                ).not.toHaveBeenCalled();
                expect(fileService.deleteFile).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute update payment proof on empty payment proof", async () => {
            paymentProofRepository.isPaymentProofIdExist =
                mockData.paymentProofIdNotExist;

            try {
                await updatePaymentProofCommandHandler.execute(
                    requestPaymentProofData,
                );
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    paymentProofRepository.isPaymentProofIdExist,
                ).toHaveBeenCalledWith(paymentProofId);
                expect(eventBus.removeSpecificListener).not.toHaveBeenCalled();
                expect(eventBus.publish).not.toHaveBeenCalled();
                expect(eventBus.subscribe).not.toHaveBeenCalled();
                expect(
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).not.toHaveBeenCalled();
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.updatePaymentProof,
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
