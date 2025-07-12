import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";
import { PaymentFileEntity, PaymentFileProps } from "../../domain/entity";
const imagekitConfig = appConfig.get("/imagekit");

describe("Testing Payment File Entity", () => {
    const mockPaymentFile: PaymentFileProps = {
        id: "65227b5688c257da338e66f8",
        nama: "pikti_test.png",
        url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
        path: "/test-url-1",
    };

    describe("Constructor New Payment File Entity", () => {
        it("should success match new payment proof entity", async () => {
            const newPaymentFile = new PaymentFileEntity<PaymentFileProps>(
                mockPaymentFile,
            );

            expect(newPaymentFile.getId()).toEqual(mockPaymentFile.id);
            expect(newPaymentFile.getNama()).toEqual(mockPaymentFile.nama);
            expect(newPaymentFile.getUrlAsli()).toEqual(mockPaymentFile.url_asli);
            expect(newPaymentFile.getPath()).toEqual(mockPaymentFile.path);
        });

        it("should error match wrong telephone number pattern on new payment proof entity", async () => {
            mockPaymentFile.url_asli = "/test-url-1";

            try {
                new PaymentFileEntity<PaymentFileProps>(mockPaymentFile);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("URL Endpoint tidak valid");
            }
        });
    });
});
