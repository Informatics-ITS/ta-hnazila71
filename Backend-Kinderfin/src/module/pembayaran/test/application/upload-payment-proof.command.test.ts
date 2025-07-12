import { StatusCodes } from "http-status-codes";
import ImageKit from "imagekit";
import { Sequelize } from "sequelize";
import { Readable } from "stream";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    UploadPaymentProofCommand,
    UploadPaymentProofCommandHandler,
} from "../../application/command";
import { IFileService } from "../../application/service";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofEntity,
    PaymentProofProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IPaymentProofRepository } from "../../domain/repository";
import { PaymentProofRepository } from "../../infrastructure/storage/repository";
import { FileService } from "./../../infrastructure/service";
const imagekitConfig = appConfig.get("/imagekit");

jest.mock("imagekit");

describe("Testing Upload PaymentProof Command", () => {
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
    ];

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

    const requestPaymentProofData: UploadPaymentProofCommand = {
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const requestPaymentProofDataTraining: UploadPaymentProofCommand = {
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Training",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        bukti_pembayaran: uploadedFile,
    };

    const requestPaymentProofDataUnitNotFound: UploadPaymentProofCommand = {
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
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-10-28"),
        nama_lengkap: "Test User",
        jenis_pembayaran: "Daftar Ujian",
        email: "testuser@gmail.com",
        nomor_telepon: "081234567890",
        file_pembayaran: paymentFileDataResult,
    } as PaymentProofProps);

    const paymentProofDataResultTraining =
        new PaymentProofEntity<PaymentProofProps>({
            tanggal_daftar: new Date("2023-10-28"),
            nama_lengkap: "Test User",
            jenis_pembayaran: "Training",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
            file_pembayaran: paymentFileDataResult,
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
        addPaymentProof: jest.fn(),
        addPaymentProofError: jest
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
    let uploadPaymentProofCommandHandler: ICommandHandler<
        UploadPaymentProofCommand,
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
            addPaymentProof: mockData.addPaymentProof,
        } as any;
        fileService = new FileService(new ImageKit());
        fileService = {
            uploadFile: mockData.uploadFile,
        } as any;
        eventBus = new EventBus();
        eventBus.removeSpecificListener = mockData.removeSpecificListener;
        eventBus.publish = mockData.publish;
        eventBus.subscribe = mockData.subscribe;
        uploadPaymentProofCommandHandler = new UploadPaymentProofCommandHandler(
            paymentProofRepository,
            fileService,
            eventBus,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Execute Upload Payment Proof", () => {
        it("should success execute upload payment proof", async () => {
            await uploadPaymentProofCommandHandler.execute(
                requestPaymentProofData,
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith(masterDatas[0].aturan);
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(paymentProofRepository.addPaymentProof).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...paymentProofDataResult,
                    id: expect.anything(),
                }),
            );
        });

        it("should success execute upload payment proof training", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyPaymentTypeMasterDataNull;

            await uploadPaymentProofCommandHandler.execute(
                requestPaymentProofDataTraining,
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
                mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData,
            ).toHaveBeenCalledWith(masterDatas);
            expect(
                mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
            ).toHaveBeenCalledWith("");
            expect(fileService.uploadFile).toHaveBeenCalledWith(uploadedFile);
            expect(paymentProofRepository.addPaymentProof).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...paymentProofDataResultTraining,
                    id: expect.anything(),
                }),
            );
        });

        it("should error execute upload payment proof", async () => {
            paymentProofRepository.addPaymentProof =
                mockData.addPaymentProofError;

            try {
                await uploadPaymentProofCommandHandler.execute(
                    requestPaymentProofData,
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
                    paymentProofRepository.addPaymentProof,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ...paymentProofDataResult,
                        id: expect.anything(),
                    }),
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute upload payment proof on upload file", async () => {
            fileService.uploadFile = mockData.uploadFileError;

            try {
                await uploadPaymentProofCommandHandler.execute(
                    requestPaymentProofData,
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
                    paymentProofRepository.addPaymentProof,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });

        it("should error execute upload payment proof on uncomplete payment type input", async () => {
            mockedPaymentProofEntity.prototype.validatePaymentTypeInput =
                mockData.validatePaymentTypeInputError;

            try {
                await uploadPaymentProofCommandHandler.execute(
                    requestPaymentProofData,
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).toHaveBeenCalledWith(masterDatas[0].aturan);
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.addPaymentProof,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Data perlu dimasukkan");
            }
        });

        it("should error execute upload payment proof on payment type not found", async () => {
            mockedPaymentProofEntity.prototype.verifyPaymentTypeMasterData =
                mockData.verifyPaymentTypeMasterDataError;

            try {
                await uploadPaymentProofCommandHandler.execute(
                    requestPaymentProofDataUnitNotFound,
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).toHaveBeenCalledWith(masterDatas);
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).not.toHaveBeenCalled();
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.addPaymentProof,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Jenis pembayaran tidak terdaftar",
                );
            }
        });

        it("should error execute upload payment proof on subscribe event", async () => {
            eventBus.subscribe = mockData.subscribeError;

            try {
                await uploadPaymentProofCommandHandler.execute(
                    requestPaymentProofData,
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
                    mockedPaymentProofEntity.prototype
                        .verifyPaymentTypeMasterData,
                ).not.toHaveBeenCalled();
                expect(
                    mockedPaymentProofEntity.prototype.validatePaymentTypeInput,
                ).not.toHaveBeenCalled();
                expect(fileService.uploadFile).not.toHaveBeenCalled();
                expect(
                    paymentProofRepository.addPaymentProof,
                ).not.toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
