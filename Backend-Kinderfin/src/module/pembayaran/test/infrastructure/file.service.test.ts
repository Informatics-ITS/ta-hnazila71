import { StatusCodes } from "http-status-codes";
import ImageKit from "imagekit";
import { Readable } from "stream";
import { appConfig } from "../../../../config";
import { ApplicationError } from "../../../../shared/abstract";
import { IFileService } from "../../application/service";
import { PaymentFileEntity, PaymentFileProps } from "../../domain/entity";
import { FileService } from "../../infrastructure/service";
const imagekitConfig = appConfig.get("/imagekit");

jest.mock("imagekit", () => {
    return jest.fn().mockImplementation(() => {
        return {
            upload: jest.fn().mockResolvedValue({
                fileId: "65227b5688c257da338e66f8",
                url: `${imagekitConfig.urlEndpoint}/test-url-1`,
                filePath: "/test-url-1",
            }),
            deleteFile: jest.fn(),
        };
    });
});

describe("Testing File Service", () => {
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

    const newFile = new PaymentFileEntity<PaymentFileProps>({
        id: "65227b5688c257da338e66f8",
        nama: "pikti_test.jpg",
        url_asli: `${imagekitConfig.urlEndpoint}/test-url-1`,
        path: "/test-url-1",
    });

    let fileService: IFileService;
    const mockedImageKit = new ImageKit();
    const mockedImageKitUpload = jest.spyOn(mockedImageKit, "upload");
    const mockedImageKitDelete = jest.spyOn(mockedImageKit, "deleteFile");

    beforeEach(() => {
        jest.clearAllMocks();
        fileService = new FileService(mockedImageKit);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Upload File", () => {
        it("should success return upload file", async () => {
            const file = await fileService.uploadFile(uploadedFile);

            expect(mockedImageKitUpload).toHaveBeenCalledWith({
                file: uploadedFile.buffer,
                fileName: expect.stringContaining(uploadedFile.originalname),
            });
            expect(file).toEqual(newFile);
        });

        it("should error return upload file", async () => {
            (mockedImageKitUpload as jest.Mock).mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            );

            try {
                await fileService.uploadFile(uploadedFile);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedImageKitUpload).toHaveBeenCalledWith({
                    file: uploadedFile.buffer,
                    fileName: expect.stringContaining(
                        uploadedFile.originalname,
                    ),
                });
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });

    const paymentFileId = "65227b5688c257da338e66f8";

    describe("Delete File", () => {
        it("should success return delete file", async () => {
            await fileService.deleteFile(paymentFileId);

            expect(mockedImageKitDelete).toHaveBeenCalledWith(paymentFileId);
        });

        it("should error return delete file", async () => {
            (mockedImageKitDelete as jest.Mock).mockRejectedValue(
                new ApplicationError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Internal Server Error",
                ),
            );

            try {
                await fileService.deleteFile(paymentFileId);
            } catch (error) {
                const appErr = error as ApplicationError;
                expect(mockedImageKitDelete).toHaveBeenCalledWith(
                    paymentFileId,
                );
                expect(appErr.code).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
                expect(appErr.message).toEqual("Internal Server Error");
            }
        });
    });
});
