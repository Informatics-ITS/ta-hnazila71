import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus } from "../../../../../shared/util";
import {
    FundApplicationEntity,
    FundApplicationProps,
} from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IFundApplicationRepository } from "../../domain/repository";
const masterDataType = appConfig.get("/masterData");

export interface InputFundApplicationCommand {
    bulan: number;
    tahun: number;
    deskripsi: string;
    unit: string;
    quantity_1: number;
    quantity_2: number;
    harga_satuan: number;
}

export class InputFundApplicationCommandHandler
    implements ICommandHandler<InputFundApplicationCommand, void>
{
    constructor(
        private readonly fundApplicationRepository: IFundApplicationRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: InputFundApplicationCommand): Promise<void> {
        try {
            const newFundApplication =
                new FundApplicationEntity<FundApplicationProps>(
                    command as FundApplicationProps,
                );
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
                            const err = newFundApplication.verifyUnitMasterData(
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
            newFundApplication.calculateJumlah();
            await this.fundApplicationRepository.addFundApplication(
                newFundApplication,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
