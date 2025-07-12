import { StatusCodes } from "http-status-codes";
import { Sequelize } from "sequelize";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";
import { IPaymentProofQueryHandler } from "../../application/query";
import { PaymentFileEntity, PaymentFileProps, PaymentProofProps } from "../../domain/entity";
import { PaymentProofQueryHandler } from "../../infrastructure/storage/query";
const imagekitConfig = appConfig.get("/imagekit");

describe("Testing Payment Proof Query", () => {
    const mockPaymentProofFileData = [
        {
            id: "65227b5688c257da338e66f8",
            nama: "pikti_test.png",
            url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
            path: "/test-url-1",
            bukti_pembayaran: {
                id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
                nomor_pendaftaran: "012345678901234567",
                tanggal_daftar: new Date("2023-09-28"),
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
            url_asli: `${imagekitConfig.urlEndpoint}/test-url-2`,
            path: "/test-url-2",
            bukti_pembayaran: {
                id: "138d2f14-6e2e-4794-8663-fb09c5006f35",
                nomor_pendaftaran: "012345678901234568",
                tanggal_daftar: new Date("2023-09-28"),
                nama_lengkap: "Test User B",
                jenis_pembayaran: "Daftar Ujian",
                nrp: undefined,
                email: "testingb@gmail.com",
                nomor_telepon: "081234567891",
            },
        },
    ];

    const mockData = {
        findAll: jest.fn().mockReturnValue(mockPaymentProofFileData),
        findAllError: jest
            .fn()
            .mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            ),
    };

    let mockedDatabase: Sequelize;
    let paymentProofQueryHandler: IPaymentProofQueryHandler;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedDatabase = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
        });
        mockedDatabase.models.file_pembayaran = {
            findAll: mockData.findAll,
        } as any;
        paymentProofQueryHandler = new PaymentProofQueryHandler(mockedDatabase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Get All Payment Proofs", () => {
        const paymentProofFileResult: PaymentProofProps[] = [
            {
                id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
                nomor_pendaftaran: "012345678901234567",
                tanggal_daftar: new Date("2023-09-28"),
                nama_lengkap: "Test User A",
                jenis_pembayaran: "Daftar Ujian",
                nrp: undefined,
                email: "testinga@gmail.com",
                nomor_telepon: "081234567890",
                file_pembayaran: new PaymentFileEntity<PaymentFileProps>({
                    id: "65227b5688c257da338e66f8",
                    nama: "pikti_test.png",
                    url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
                    path: "/test-url-1",
                }),
            },
            {
                id: "138d2f14-6e2e-4794-8663-fb09c5006f35",
                nomor_pendaftaran: "012345678901234568",
                tanggal_daftar: new Date("2023-09-28"),
                nama_lengkap: "Test User B",
                jenis_pembayaran: "Daftar Ujian",
                nrp: undefined,
                email: "testingb@gmail.com",
                nomor_telepon: "081234567891",
                file_pembayaran: new PaymentFileEntity<PaymentFileProps>({
                    id: "65227dbc88c257da3395ebaf",
                    nama: "pikti_cover.png",
                    url_asli: `${imagekitConfig.urlEndpoint}/test-url-2`,
                    path: "/test-url-2",
                }),
            },
        ];
        it("should success return all payment proof datas", async () => {
            const paymentProofs =
                await paymentProofQueryHandler.getAllPaymentProofs();

            expect(
                mockedDatabase.models.file_pembayaran.findAll,
            ).toHaveBeenCalled();
            expect(paymentProofs).toEqual(paymentProofFileResult);
        });

        it("should error return all payment proof datas", async () => {
            mockedDatabase.models.file_pembayaran.findAll =
                mockData.findAllError;

            try {
                await paymentProofQueryHandler.getAllPaymentProofs();
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(
                    mockedDatabase.models.file_pembayaran.findAll,
                ).toHaveBeenCalled();
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
