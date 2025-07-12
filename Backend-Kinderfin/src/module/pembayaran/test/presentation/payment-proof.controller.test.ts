import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as httpMocks from "node-mocks-http";
import { Sequelize } from "sequelize";
import { Readable } from "stream";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import {
    DeletePaymentProofCommandHandler,
    UpdatePaymentProofCommandHandler,
    UploadPaymentProofCommandHandler,
} from "../../application/command";
import { IPaymentProofQueryHandler } from "../../application/query";
import { IPaymentProofRepository } from "../../domain/repository";
import { PaymentProofQueryHandler } from "../../infrastructure/storage/query";
import { PaymentProofRepository } from "../../infrastructure/storage/repository";
import { PaymentProofController } from "../../presentation/controller";

describe("Testing Payment Proof Controller", () => {
    const paymentProofDatas = [
        {
            id: "65227b5688c257da338e66f8",
            nama: "pikti_test.png",
            url_asli: "http://example.com/test-url-1",
            bukti_pembayaran: {
                id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
                nomor_pendaftaran: "012345678901234567",
                tanggal_daftar: new Date("2023-10-28"),
                nama_lengkap: "Test User A",
                jenis_pembayaran: "Daftar Ujian",
                nrp: undefined,
                email: "testinga@gmail.com",
                nomor_telepon: "081234567890",
            },
        },
        {
            id: "65227dbc88c257da3395ebaf",
            nama: "pikti_cover.png",
            url_asli: "http://example.com/test-url-2",
            bukti_pembayaran: {
                id: "138d2f14-6e2e-4794-8663-fb09c5006f35",
                nomor_pendaftaran: "012345678901234568",
                tanggal_daftar: new Date("2023-10-28"),
                nama_lengkap: "Test User B",
                jenis_pembayaran: "Daftar Ujian",
                nrp: undefined,
                email: "testingb@gmail.com",
                nomor_telepon: "081234567891",
            },
        },
    ];

    const sentMessage = {
        success: {
            upload: {
                status: "success",
                message: DefaultMessage.SUC_ADD,
            },
            view: {
                status: "success",
                message: DefaultMessage.SUC_AGET,
                data: paymentProofDatas,
            },
            update: {
                status: "success",
                message: DefaultMessage.SUC_UPDT,
            },
            delete: {
                status: "success",
                message: DefaultMessage.SUC_DEL,
            },
        },
        failed: {
            status: "failed",
            error: "Internal Server Error",
        },
    };

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
        getAllPaymentProofs: jest.fn().mockReturnValue(paymentProofDatas),
        getError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockRequest: Request;
    let mockResponse: Response;
    let mockedDatabase: Sequelize;
    let paymentProofRepository: IPaymentProofRepository;
    let paymentProofQueryHandler: IPaymentProofQueryHandler;
    let eventBus: EventBus;
    let paymentProofController: PaymentProofController;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        paymentProofRepository = new PaymentProofRepository(mockedDatabase);
        paymentProofQueryHandler = new PaymentProofQueryHandler(mockedDatabase);
        paymentProofQueryHandler = {
            getAllPaymentProofs: mockData.getAllPaymentProofs,
        } as any;
        eventBus = new EventBus();
        paymentProofController = new PaymentProofController(
            paymentProofRepository,
            paymentProofQueryHandler,
            eventBus,
        );
        mockResponse = httpMocks.createResponse();
        mockResponse.json = mockData.json;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    jest.mock("../../application/command");
    const [
        requestPaymentFile,
        requestPaymentProofData,
        requestPaymentProofDataFail,
    ] = [
        {
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
        },
        {
            nomor_pendaftaran: "012345678901234567",
            tanggal_daftar: "2023-10-28",
            nama_lengkap: "Test User",
            jenis_pembayaran: "Daftar Ujian",
            email: "testuser@gmail.com",
            nomor_telepon: "081234567890",
        },
        {
            nomor_pendaftaran: "012345678901234567",
            tanggal_daftar: "2023-10-28",
            nama_lengkap: "Test User",
            jenis_pembayaran: "Daftar Ujian",
            email: "testuser@gmail.com",
        },
    ];
    let mockedUploadPaymentProofCommandHandler: jest.MockedClass<
        typeof UploadPaymentProofCommandHandler
    >;
    describe("Upload Payment Proof Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestPaymentProofData),
                file: Object.assign({}, requestPaymentFile),
            });
            mockedUploadPaymentProofCommandHandler =
                UploadPaymentProofCommandHandler as jest.MockedClass<
                    typeof UploadPaymentProofCommandHandler
                >;
            mockedUploadPaymentProofCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response upload payment proof", async () => {
            await paymentProofController.uploadPaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUploadPaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestPaymentProofData,
                tanggal_daftar: expect.anything(),
                bukti_pembayaran: expect.objectContaining(requestPaymentFile),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.upload,
            );
        });

        it("should error return response upload payment proof on upload data", async () => {
            mockedUploadPaymentProofCommandHandler.prototype.execute =
                mockData.executeError;

            await paymentProofController.uploadPaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUploadPaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestPaymentProofData,
                tanggal_daftar: expect.anything(),
                bukti_pembayaran: expect.objectContaining(requestPaymentFile),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response upload payment proof on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestPaymentProofDataFail),
                file: Object.assign({}, requestPaymentFile),
            });

            await paymentProofController.uploadPaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUploadPaymentProofCommandHandler.prototype.execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });

    describe("View All Payment Proofs Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest();
        });

        it("should success return response view all payment proofs", async () => {
            await paymentProofController.viewAllPaymentProofs(
                mockRequest,
                mockResponse,
            );

            expect(
                paymentProofQueryHandler.getAllPaymentProofs,
            ).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.view,
            );
        });

        it("should error return response view all payment proofs", async () => {
            paymentProofQueryHandler.getAllPaymentProofs = mockData.getError;

            await paymentProofController.viewAllPaymentProofs(
                mockRequest,
                mockResponse,
            );

            expect(
                paymentProofQueryHandler.getAllPaymentProofs,
            ).toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });
    });

    const paymentProofId = "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f";
    let mockedUpdatePaymentProofCommandHandler: jest.MockedClass<
        typeof UpdatePaymentProofCommandHandler
    >;
    describe("Update Payment Proof Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestPaymentProofData),
                file: Object.assign({}, requestPaymentFile),
                params: Object.assign({}, { id: paymentProofId }),
            });
            mockedUpdatePaymentProofCommandHandler =
                UpdatePaymentProofCommandHandler as jest.MockedClass<
                    typeof UpdatePaymentProofCommandHandler
                >;
            mockedUpdatePaymentProofCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response update payment proof", async () => {
            await paymentProofController.updatePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdatePaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestPaymentProofData,
                id: paymentProofId,
                tanggal_daftar: expect.anything(),
                bukti_pembayaran: expect.objectContaining(requestPaymentFile),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.update,
            );
        });

        it("should error return response update payment proof on update data", async () => {
            mockedUpdatePaymentProofCommandHandler.prototype.execute =
                mockData.executeError;

            await paymentProofController.updatePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdatePaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                ...requestPaymentProofData,
                id: paymentProofId,
                tanggal_daftar: expect.anything(),
                bukti_pembayaran: expect.objectContaining(requestPaymentFile),
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response update payment proof on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                body: Object.assign({}, requestPaymentProofDataFail),
                file: Object.assign({}, requestPaymentFile),
                params: Object.assign(
                    {},
                    { id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338" },
                ),
            });

            await paymentProofController.updatePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedUpdatePaymentProofCommandHandler.prototype.execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });

    let mockedDeletePaymentProofCommandHandler: jest.MockedClass<
        typeof DeletePaymentProofCommandHandler
    >;
    describe("Delete Payment Proof Controller", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRequest = httpMocks.createRequest({
                params: Object.assign({}, { id: paymentProofId }),
            });
            mockedDeletePaymentProofCommandHandler =
                DeletePaymentProofCommandHandler as jest.MockedClass<
                    typeof DeletePaymentProofCommandHandler
                >;
            mockedDeletePaymentProofCommandHandler.prototype.execute =
                mockData.execute;
        });

        it("should success return response delete payment proof", async () => {
            await paymentProofController.deletePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeletePaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                id: paymentProofId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(
                sentMessage.success.delete,
            );
        });

        it("should error return response delete payment proof on delete data", async () => {
            mockedDeletePaymentProofCommandHandler.prototype.execute =
                mockData.executeError;

            await paymentProofController.deletePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeletePaymentProofCommandHandler.prototype.execute,
            ).toHaveBeenCalledWith({
                id: paymentProofId,
            });
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(sentMessage.failed);
        });

        it("should error return response delete payment proof on validate request", async () => {
            mockRequest = httpMocks.createRequest({
                params: Object.assign(
                    {},
                    { id: "78bae457-6f69-44b6-83b0-fd6a38d6937" },
                ),
            });

            await paymentProofController.deletePaymentProof(
                mockRequest,
                mockResponse,
            );

            expect(
                mockedDeletePaymentProofCommandHandler.prototype.execute,
            ).not.toHaveBeenCalled();
            expect(mockResponse.header("Content-Type")).toEqual(
                "application/json",
            );
            expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: "failed",
                }),
            );
        });
    });
});
