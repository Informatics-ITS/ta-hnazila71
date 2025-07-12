import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus } from "../../../../shared/util";
import { PaymentProofEntity, PaymentProofProps } from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IPaymentProofRepository } from "../../domain/repository";
import { IFileService } from "../service";
const masterDataType = appConfig.get("/masterData");

export interface UploadPaymentProofCommand {
    nomor_pendaftaran?: string;
    tanggal_daftar: Date;
    nama_lengkap: string;
    jenis_pembayaran: string;
    nrp?: string;
    email: string;
    nomor_telepon: string;
    bukti_pembayaran: Express.Multer.File;
}

export class UploadPaymentProofCommandHandler
    implements ICommandHandler<UploadPaymentProofCommand, void>
{
    constructor(
        private readonly paymentProofRepository: IPaymentProofRepository,
        private readonly fileService: IFileService,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: UploadPaymentProofCommand): Promise<void> {
        // const { bukti_pembayaran } = command;
        // try {
        //     const newPaymentProof = new PaymentProofEntity<PaymentProofProps>({
        //         ...command,
        //     } as PaymentProofProps);
        //     this.eventBus.removeSpecificListener("MasterDataRetrieved");
        //     this.eventBus.publish(
        //         "MasterDataRequested",
        //         new MasterDataRequestedEvent(
        //             { tipe: masterDataType.paymentType },
        //             "MasterDataRequested",
        //         ),
        //     );
        //     await new Promise<void>((resolve, reject) => {
        //         this.eventBus.subscribe(
        //             "MasterDataRetrieved",
        //             async (masterData: any) => {
        //                 try {
        //                     if (masterData.data.status == "error") {
        //                         throw new ApplicationError(
        //                             masterData.data.code,
        //                             masterData.data.message,
        //                         );
        //                     }
        //                     const paymentTypeVerification =
        //                         newPaymentProof.verifyPaymentTypeMasterData(
        //                             masterData.data,
        //                         );
        //                     if (paymentTypeVerification.err) {
        //                         throw new ApplicationError(
        //                             StatusCodes.BAD_REQUEST,
        //                             paymentTypeVerification.err.message,
        //                         );
        //                     }
        //                     const err =
        //                         newPaymentProof.validatePaymentTypeInput(
        //                             paymentTypeVerification.constraint!,
        //                         );
        //                     if (err) {
        //                         throw new ApplicationError(
        //                             StatusCodes.BAD_REQUEST,
        //                             err.message,
        //                         );
        //                     }
        //                     resolve();
        //                 } catch (error) {
        //                     reject(error);
        //                 }
        //             },
        //         );
        //     });
        //     newPaymentProof.setFilePembayaran(
        //         await this.fileService.uploadFile(bukti_pembayaran),
        //     );
        //     await this.paymentProofRepository.addPaymentProof(newPaymentProof);
        // } catch (error) {
        //     const appErr = error as ApplicationError;
        //     throw new ApplicationError(appErr.code, appErr.message);
        // }
    }
}
