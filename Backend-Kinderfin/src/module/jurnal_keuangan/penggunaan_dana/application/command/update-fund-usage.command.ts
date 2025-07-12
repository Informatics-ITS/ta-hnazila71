import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { FundUsageEntity, FundUsageProps } from "../../domain/entity";
import {
    MasterDataRequestedEvent,
    SalaryCancelledEvent,
    SalaryPaidEvent,
    SalaryUpdatedEvent,
} from "../../domain/event";
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

export interface UpdateFundUsageCommand {
    id: AggregateId;
    aktivitas?: string;
    tanggal?: Date;
    penerima?: string;
    sub_aktivitas?: string;
    uraian?: string;
    jumlah?: number;
    penggunaan_dana_lama?: FundUsageProps;
}

export class UpdateFundUsageCommandHandler
    implements ICommandHandler<UpdateFundUsageCommand, void>
{
    private readonly fundUsageService: IFundUsageService;

    constructor(
        private readonly fundUsageRepository: IFundUsageRepository,
        private readonly eventBus: EventBus,
    ) {
        this.fundUsageService = new FundUsageService();
    }

    async execute(command: UpdateFundUsageCommand): Promise<void> {
        try {
            const fundUsageData = new FundUsageEntity<FundUsageProps>(
                command as FundUsageProps,
            );
            const oldFundUsage =
                await this.fundUsageRepository.isFundUsageIdExist(
                    fundUsageData.id,
                );
            if (!oldFundUsage) {
                logger.error("fund usage data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data penggunaan dana tidak ditemukan",
                );
            }
            if (!fundUsageData.getAktivitas()) {
                fundUsageData.setAktivitas(oldFundUsage.aktivitas!);
            }
            if (!fundUsageData.getTanggal()) {
                fundUsageData.setTanggal(oldFundUsage.tanggal!);
            }
            if (!fundUsageData.getPenerima()) {
                fundUsageData.setPenerima(oldFundUsage.penerima!);
            }
            if (!fundUsageData.getSubAktivitas()) {
                fundUsageData.setSubAktivitas(oldFundUsage.sub_aktivitas!);
            }
            if (
                (regexHR.test(fundUsageData.getAktivitas()!) &&
                    !regexHR.test(fundUsageData.getSubAktivitas()!)) ||
                (!regexHR.test(fundUsageData.getAktivitas()!) &&
                    regexHR.test(fundUsageData.getSubAktivitas()!))
            ) {
                logger.error("honorary activity and sub activity do not match");
                throw new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    "Aktivitas dan sub aktivitas honorarium tidak sesuai",
                );
            }
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
                            const err = fundUsageData.verifyActivityMasterData(
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
                                    {
                                        tipe: masterDataType.subActivity,
                                    },
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
                                                fundUsageData.verifySubActivityMasterData(
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
            command.penggunaan_dana_lama = oldFundUsage;
            // if update HR activity
            if (
                regexHR.test(oldFundUsage.sub_aktivitas!) &&
                regexHR.test(fundUsageData.getSubAktivitas()!)
            ) {
                const bulan =
                    new Date(fundUsageData.getTanggal()!).getMonth() + 1;
                const tahun = new Date(
                    fundUsageData.getTanggal()!,
                ).getFullYear();
                if (
                    new Date(oldFundUsage.tanggal!).getMonth() + 1 != bulan ||
                    new Date(oldFundUsage.tanggal!).getFullYear() != tahun
                ) {
                    const err =
                        await this.fundUsageService.validateUniqueFundUsageHR(
                            fundUsageData.getSubAktivitas()!,
                            bulan,
                            tahun,
                            fundUsageData.getPenerima()!,
                            this.fundUsageRepository,
                        );
                    if (err) {
                        logger.error(
                            `fund usage data for sub activity ${fundUsageData.getSubAktivitas()!} to ${fundUsageData.getPenerima()!} in ${
                                months[
                                    new Date(
                                        fundUsageData.getTanggal()!,
                                    ).getMonth()
                                ][1]
                            } ${new Date(
                                fundUsageData.getTanggal()!,
                            ).getFullYear()} has been reported`,
                        );
                        throw new ApplicationError(
                            StatusCodes.BAD_REQUEST,
                            err.message,
                        );
                    }
                }
                this.eventBus.removeSpecificListener("EmployeeSalaryUpdated");
                this.eventBus.publish(
                    "UpdateEmployeeSalary",
                    new SalaryUpdatedEvent(command, "UpdateEmployeeSalary"),
                );
                await new Promise<void>((resolve, reject) => {
                    this.eventBus.subscribe(
                        "EmployeeSalaryUpdated",
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
            // if universal activity will replaced by HR activity
            else if (
                !regexHR.test(oldFundUsage.sub_aktivitas!) &&
                regexHR.test(fundUsageData.getSubAktivitas()!)
            ) {
                const bulan =
                    new Date(fundUsageData.getTanggal()!).getMonth() + 1;
                const tahun = new Date(
                    fundUsageData.getTanggal()!,
                ).getFullYear();
                const err =
                    await this.fundUsageService.validateUniqueFundUsageHR(
                        fundUsageData.getSubAktivitas()!,
                        bulan,
                        tahun,
                        fundUsageData.getPenerima()!,
                        this.fundUsageRepository,
                    );
                if (err) {
                    logger.error(
                        `fund usage data for sub activity ${fundUsageData.getSubAktivitas()!} to ${fundUsageData.getPenerima()!} in ${
                            months[
                                new Date(fundUsageData.getTanggal()!).getMonth()
                            ][1]
                        } ${new Date(
                            fundUsageData.getTanggal()!,
                        ).getFullYear()} has been reported`,
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
                // if HR activity will replaced by universal activity
            } else if (
                regexHR.test(oldFundUsage.sub_aktivitas!) &&
                !regexHR.test(fundUsageData.getSubAktivitas()!)
            ) {
                this.eventBus.removeSpecificListener("EmployeeSalaryDeleted");
                this.eventBus.publish(
                    "CancelEmployeeSalary",
                    new SalaryCancelledEvent(
                        {
                            tanggal: oldFundUsage.tanggal,
                            penerima: oldFundUsage.penerima,
                        },
                        "CancelEmployeeSalary",
                    ),
                );
                await new Promise<void>((resolve, reject) => {
                    this.eventBus.subscribe(
                        "EmployeeSalaryDeleted",
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
            await this.fundUsageRepository.updateFundUsage(fundUsageData);
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
