import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
const masterDataType = appConfig.get("/masterData");

export interface UpdateFundApplicationCommand {
    id: AggregateId;
    deskripsi?: string;
    unit?: string;
    quantity_1?: number;
    quantity_2?: number;
    harga_satuan?: number;
}

export class UpdateFundApplicationCommandHandler
    implements ICommandHandler<UpdateFundApplicationCommand, void>
{
    constructor(
        private readonly fundApplicationRepository: IFundApplicationRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: UpdateFundApplicationCommand): Promise<void> {
        try {
            const fundApplicationData =
                new FundApplicationEntity<FundApplicationProps>(
                    command as FundApplicationProps,
                );
            const oldFundApplication =
                await this.fundApplicationRepository.isFundApplicationIdExist(
                    fundApplicationData.id,
                );
            if (!oldFundApplication) {
                logger.error("fund application data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data pengajuan dana tidak ditemukan",
                );
            }
            if (fundApplicationData.getUnit()) {
                this.eventBus.removeSpecificListener("MasterDataRetrieved");
                this.eventBus.publish(
                    "MasterDataRequested",
                    new MasterDataRequestedEvent(
                        { tipe: masterDataType.unit },
                        "MasterDataRequested",
                    ),
                );
                await new Promise<void>((resolve, reject) => {
                    this.eventBus.subscribe(
                        "MasterDataRetrieved",
                        async (masterData: any) => {
                            try {
                                if (masterData.data.status == "error") {
                                    throw new ApplicationError(
                                        masterData.data.code,
                                        masterData.data.message,
                                    );
                                }
                                const err =
                                    fundApplicationData.verifyUnitMasterData(
                                        masterData.data,
                                    );
                                if (err) {
                                    throw new ApplicationError(
                                        StatusCodes.BAD_REQUEST,
                                        err.message,
                                    );
                                }
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        },
                    );
                });
            }
            fundApplicationData.calculateJumlah(oldFundApplication);
            await this.fundApplicationRepository.updateFundApplication(
                fundApplicationData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
