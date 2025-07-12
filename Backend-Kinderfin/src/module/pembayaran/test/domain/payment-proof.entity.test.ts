import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofEntity,
    PaymentProofProps,
} from "../../domain/entity";
const imagekitConfig = appConfig.get("/imagekit");

describe("Testing Payment Proof Entity", () => {
    const mockPaymentProof: PaymentProofProps = {
        id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-09-28"),
        nama_lengkap: "Test User A",
        jenis_pembayaran: "Angsuran 1",
        nrp: "0123456789",
        email: "testinga@gmail.com",
        nomor_telepon: "081234567890",
        file_pembayaran: new PaymentFileEntity<PaymentFileProps>({
            id: "65227b5688c257da338e66f8",
            nama: "pikti_test.png",
            url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
            path: "/test-url-1",
        }),
    };

    describe("Constructor New Payment Proof Entity", () => {
        it("should success match new payment proof entity", async () => {
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProof,
            );

            expect(newPaymentProof.id).toEqual(mockPaymentProof.id);
            expect(newPaymentProof.getNomorPendaftaran()).toEqual(
                mockPaymentProof.nomor_pendaftaran,
            );
            expect(newPaymentProof.getTanggalDaftar()).toEqual(
                mockPaymentProof.tanggal_daftar,
            );
            expect(newPaymentProof.getNamaLengkap()).toEqual(
                mockPaymentProof.nama_lengkap,
            );
            expect(newPaymentProof.getJenisPembayaran()).toEqual(
                mockPaymentProof.jenis_pembayaran,
            );
            expect(newPaymentProof.getNrp()).toEqual(mockPaymentProof.nrp);
            expect(newPaymentProof.getEmail()).toEqual(mockPaymentProof.email);
            expect(newPaymentProof.getNomorTelepon()).toEqual(
                mockPaymentProof.nomor_telepon,
            );
            expect(newPaymentProof.getFilePembayaran()).toEqual(
                mockPaymentProof.file_pembayaran,
            );
        });

        it("should error match wrong telephone number pattern on new payment proof entity", async () => {
            mockPaymentProof.nomor_telepon = "08123456789f";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor telepon hanya dapat berisi angka",
                );
            }
        });

        it("should error match wrong telephone number digit on new payment proof entity", async () => {
            mockPaymentProof.nomor_telepon = "08123456789";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor telepon harus terdiri dari 12 karakter",
                );
            }
        });

        it("should error match wrong nrp pattern on new payment proof entity", async () => {
            mockPaymentProof.nrp = "012345678f";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nrp hanya dapat berisi angka",
                );
            }
        });

        it("should error match wrong nrp digit on new payment proof entity", async () => {
            mockPaymentProof.nrp = "012345678";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nrp harus terdiri dari 10 karakter",
                );
            }
        });

        it("should error match wrong email on new payment proof entity", async () => {
            mockPaymentProof.email = "Wrong Email";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual("Format email salah");
            }
        });

        it("should error match wrong full name on new payment proof entity", async () => {
            mockPaymentProof.nama_lengkap = "Test User 1";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nama lengkap hanya dapat berisi huruf, koma, titik, atau spasi",
                );
            }
        });

        it("should error match wrong registration number pattern on new payment proof entity", async () => {
            mockPaymentProof.nomor_pendaftaran = "01234567890123456f";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor pendaftaran hanya dapat berisi angka",
                );
            }
        });

        it("should error match wrong registration number digit on new payment proof entity", async () => {
            mockPaymentProof.nomor_pendaftaran = "01234567890123456";

            try {
                new PaymentProofEntity<PaymentProofProps>(mockPaymentProof);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.BAD_REQUEST);
                expect(appErr.message).toEqual(
                    "Input nomor pendaftaran harus terdiri dari 18 karakter",
                );
            }
        });
    });

    const mockPaymentProofType: PaymentProofProps = {
        id: "e1a4db23-ecfe-425a-87d2-b7a9ef2e338f",
        nomor_pendaftaran: "012345678901234567",
        tanggal_daftar: new Date("2023-09-28"),
        nama_lengkap: "Test User A",
        jenis_pembayaran: "Angsuran 1",
        nrp: undefined,
        email: "testinga@gmail.com",
        nomor_telepon: "081234567890",
        file_pembayaran: new PaymentFileEntity<PaymentFileProps>({
            id: "65227b5688c257da338e66f8",
            nama: "pikti_test.png",
            url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
            path: "/test-url-1",
        }),
    };
    let constraint = "Nomor Pendaftaran, NRP";
    describe("Validate Payment Type Input", () => {
        it("should success return error validate", async () => {
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result = newPaymentProof.validatePaymentTypeInput(constraint);

            expect(result?.message).toEqual('Data "nrp" perlu dimasukkan');
        });

        it("should success return null validate", async () => {
            mockPaymentProofType.nrp = "0123456789";
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result = newPaymentProof.validatePaymentTypeInput(constraint);

            expect(result).toBeNull();
        });

        it("should success set null validate", async () => {
            let constraint = "Nomor Pendaftaran";
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result = newPaymentProof.validatePaymentTypeInput(constraint);

            expect(newPaymentProof.getNrp()).toBeNull();
            expect(result).toBeNull();
        });
    });

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
    
    describe("Verify Payment Type Master Data", () => {
        it("should success return false verification", async () => {
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result =
                newPaymentProof.verifyPaymentTypeMasterData(masterDatas);

            expect(result.constraint).toBeUndefined();
            expect(result.err?.message).toEqual(
                "Jenis pembayaran tidak terdaftar",
            );
        });

        it("should success return true verification", async () => {
            masterDatas.push({
                id: "138d2f14-6e2e-4794-8663-fb09c5006f35",
                tipe: "Jenis Pembayaran",
                nilai: "Angsuran 1",
                aturan: "Nomor Pendaftaran, NRP",
                deskripsi: "Jenis pembayaran untuk angsuran di PIKTI",
            });
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result =
                newPaymentProof.verifyPaymentTypeMasterData(masterDatas);

            expect(result.constraint).toEqual("Nomor Pendaftaran, NRP");
            expect(result.err).toBeNull();
        });

        it("should success return true verification with null value", async () => {
            mockPaymentProofType.jenis_pembayaran = "Training"
            const newPaymentProof = new PaymentProofEntity<PaymentProofProps>(
                mockPaymentProofType,
            );
            const result =
                newPaymentProof.verifyPaymentTypeMasterData(masterDatas);

            expect(result.constraint).toEqual("");
            expect(result.err).toBeNull();
        });
    });
});
