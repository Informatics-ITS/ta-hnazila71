import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
import { logger } from "../../../../shared/util";
import { EventBus } from "../../../../shared/util/event/event-bus";
import {
    PaymentFileEntity,
    PaymentFileProps,
    PaymentProofEntity,
    PaymentProofProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IPaymentProofRepository } from "../../domain/repository";
import { IFileService } from "../service";
const masterDataType = appConfig.get("/masterData");

export interface UpdatePaymentProofCommand {
    id: AggregateId;
    nomor_pendaftaran?: string;
    tanggal_daftar?: Date;
    nama_lengkap: string;
    jenis_pembayaran?: string;
    nrp?: string;
    email?: string;
    nomor_telepon?: string;
    bukti_pembayaran?: Express.Multer.File;
}

export class UpdatePaymentProofCommandHandler
    implements ICommandHandler<UpdatePaymentProofCommand, void> {
    constructor(
        private readonly paymentProofRepository: IPaymentProofRepository,
        private readonly fileService: IFileService,
        private readonly eventBus: EventBus,
    ) { }

    async execute(command: UpdatePaymentProofCommand): Promise<void> {
        // const { bukti_pembayaran } = command;
        // let updatedFile: PaymentFileEntity<PaymentFileProps>;
        // try {
        //     const paymentProofData = new PaymentProofEntity<PaymentProofProps>(
        //         command as PaymentProofProps,
        //     );
        //     const oldPaymentProof =
        //         await this.paymentProofRepository.isPaymentProofIdExist(
        //             paymentProofData.id,
        //         );
        //     if (!oldPaymentProof) {
        //         logger.error("payment proof data is not found");
        //         throw new ApplicationError(
        //             StatusCodes.NOT_FOUND,
        //             "Data bukti pembayaran tidak ditemukan",
        //         );
        //     }
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
        //                     if (!paymentProofData.getJenisPembayaran()) {
        //                         paymentProofData.setJenisPembayaran(
        //                             oldPaymentProof.jenis_pembayaran,
        //                         );
        //                     }
        //                     const paymentTypeVerification =
        //                         paymentProofData.verifyPaymentTypeMasterData(
        //                             masterData.data,
        //                         );
        //                     if (paymentTypeVerification.err) {
        //                         throw new ApplicationError(
        //                             StatusCodes.BAD_REQUEST,
        //                             paymentTypeVerification.err.message,
        //                         );
        //                     }
        //                     if (!paymentProofData.getNomorPendaftaran()) {
        //                         paymentProofData.setNomorPendaftaran(
        //                             oldPaymentProof.nomor_pendaftaran!,
        //                         );
        //                     }
        //                     if (!paymentProofData.getNrp()) {
        //                         paymentProofData.setNrp(
        //                             oldPaymentProof.nrp!,
        //                         );
        //                     }
        //                     const err =
        //                         paymentProofData.validatePaymentTypeInput(
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
        //     if (bukti_pembayaran) {
        //         updatedFile = await this.fileService.uploadFile(
        //             bukti_pembayaran,
        //         );
        //         paymentProofData.setFilePembayaran(updatedFile);
        //     }
        //     await this.paymentProofRepository.updatePaymentProof(
        //         paymentProofData,
        //         oldPaymentProof.id_file_pembayaran,
        //     );
        //     if (bukti_pembayaran) {
        //         await this.fileService.deleteFile(
        //             oldPaymentProof.id_file_pembayaran,
        //         );
        //     }
        // } catch (error) {
        //     const appErr = error as ApplicationError;
        //     throw new ApplicationError(appErr.code, appErr.message);
        // }
    }
}
