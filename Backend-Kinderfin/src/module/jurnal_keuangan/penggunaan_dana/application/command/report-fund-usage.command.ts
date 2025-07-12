import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";
import { MasterDataRequestedEvent, SalaryPaidEvent } from "../../domain/event";
import { IFundUsageRepository } from "../../domain/repository";
import { FundUsageService, IFundUsageService } from "../../domain/service";
const masterDataType = appConfig.get("/masterData");

const regexHR: RegExp = /HR|Honorarium/;
const months = [
    ["Januari", "January"],
    ["Februari", "February"],
    ["Maret", "March"],
    ["April", "April"],
    ["Mei", "May"],
    ["Juni", "June"],
    ["Juli", "July"],
    ["Agustus", "August"],
    ["September", "September"],
    ["Oktober", "October"],
    ["November", "November"],
    ["Desember", "December"],
];

export interface ReportFundUsageCommand {
    aktivitas: string;
    tanggal: Date;
    penerima: string;
    sub_aktivitas: string;
    uraian: string;
    jumlah: number;
}

export class ReportFundUsageCommandHandler
    implements ICommandHandler<ReportFundUsageCommand, void>
{
    private readonly fundUsageService: IFundUsageService;

    constructor(
        private readonly fundUsageRepository: IFundUsageRepository,
        private readonly eventBus: EventBus,
    ) {
        this.fundUsageService = new FundUsageService();
    }

    async execute(command: ReportFundUsageCommand): Promise<void> {
        try {
            const newFundUsage = new FundUsageEntity<FundUsageProps>(
                command as FundUsageProps,
            );
            this.eventBus.removeSpecificListener("MasterDataRetrieved");
            this.eventBus.publish(
                "MasterDataRequested",
                new MasterDataRequestedEvent(
                    { tipe: masterDataType.activity },
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
                            const err = newFundUsage.verifyActivityMasterData(
                                masterData.data,
                            );
                            if (err) {
                                throw new ApplicationError(
                                    StatusCodes.BAD_REQUEST,
                                    err.message,
                                );
                            }
                            this.eventBus.removeSpecificListener(
                                "MasterDataRetrieved",
                            );
                            this.eventBus.publish(
                                "MasterDataRequested",
                                new MasterDataRequestedEvent(
                                    { tipe: masterDataType.subActivity },
                                    "MasterDataRequested",
                                ),
                            );
                            await new Promise<void>((resolve, reject) => {
                                this.eventBus.subscribe(
                                    "MasterDataRetrieved",
                                    async (masterData: any) => {
                                        try {
                                            if (
                                                masterData.data.status ==
                                                "error"
                                            ) {
                                                throw new ApplicationError(
                                                    masterData.data.code,
                                                    masterData.data.message,
                                                );
                                            }
                                            const err =
                                                newFundUsage.verifySubActivityMasterData(
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
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    },
                );
            });
            if (
                regexHR.test(newFundUsage.getAktivitas()!) &&
                regexHR.test(newFundUsage.getSubAktivitas()!)
            ) {
                const bulan =
                    new Date(newFundUsage.getTanggal()!).getMonth() + 1;
                const tahun = new Date(
                    newFundUsage.getTanggal()!,
                ).getFullYear();
                const err =
                    await this.fundUsageService.validateUniqueFundUsageHR(
                        newFundUsage.getSubAktivitas()!,
                        bulan,
                        tahun,
                        newFundUsage.getPenerima()!,
                        this.fundUsageRepository,
                    );
                if (err) {
                    logger.error(
                        `fund usage data for sub activity ${newFundUsage.getSubAktivitas()!} to ${newFundUsage.getPenerima()!} in ${
                            months[bulan - 1][1]
                        } ${tahun} has been reported`,
                    );
                    throw new ApplicationError(
                        StatusCodes.BAD_REQUEST,
                        err.message,
                    );
                }
                this.eventBus.removeSpecificListener("EmployeeSalaryPaid");
                this.eventBus.publish(
                    "PayEmployeeSalary",
                    new SalaryPaidEvent(command, "PayEmployeeSalary"),
                );
                await new Promise<void>((resolve, reject) => {
                    this.eventBus.subscribe(
                        "EmployeeSalaryPaid",
                        async (salaryData: any) => {
                            try {
                                if (salaryData.data.status == "error") {
                                    throw new ApplicationError(
                                        salaryData.data.code,
                                        salaryData.data.message,
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
            await this.fundUsageRepository.addFundUsage(newFundUsage);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
