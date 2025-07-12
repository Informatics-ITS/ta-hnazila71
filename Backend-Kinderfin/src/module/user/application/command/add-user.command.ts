import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { UserEntity, UserProps } from "../../domain/entity";
import { UserRole } from "../../domain/enum";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import {
    IPasswordService,
    IUserService,
    UserService,
} from "../../domain/service";
import { BankAccount } from "../../domain/value_object";
const masterDataType = appConfig.get("/masterData");

export interface AddUserCommand {
    nip: string;
    nama_lengkap: string;
    email: string;
    password: string;
    role?: UserRole;
    nama_bank: string;
    pemilik_rekening: string;
    nomor_rekening: string;
}

export class AddUserCommandHandler
    implements ICommandHandler<AddUserCommand, void>
{
    private readonly userService: IUserService;

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService,
        private readonly eventBus: EventBus,
    ) {
        this.userService = new UserService();
    }

    async execute(command: AddUserCommand): Promise<void> {
        const { nama_bank, pemilik_rekening, nomor_rekening } = command;
    
        try {
            const newUserData: UserEntity<any> = new UserEntity(command);
    
            // Validasi email unik
            const err = await this.userService.validateUniqueUser(
                newUserData.getEmail()!,
                this.userRepository
            );
            if (err) {
                logger.error("email has been registered");
                throw new ApplicationError(StatusCodes.BAD_REQUEST, err.message);
            }
    
            // Set akun bank
            newUserData.setAkunBank(
                new BankAccount(nama_bank, pemilik_rekening, nomor_rekening)
            );
    
            // Request data master bank
            this.eventBus.removeSpecificListener("MasterDataRetrieved");
            this.eventBus.publish(
                "MasterDataRequested",
                new MasterDataRequestedEvent(
                    { tipe: masterDataType.bank },
                    "MasterDataRequested"
                )
            );
    
            // Tunggu response validasi dari master data
            await new Promise<void>((resolve, reject) => {
                this.eventBus.subscribe(
                    "MasterDataRetrieved",
                    async (masterData: any) => {
                        try {
                            if (masterData.data.status === "error") {
                                throw new ApplicationError(
                                    masterData.data.code,
                                    masterData.data.message
                                );
                            }
    
                            // Verifikasi nama bank
                            const bankNameVerification =
                                newUserData.verifyBankNameMasterData(
                                    masterData.data
                                );
    
                            if (bankNameVerification.err) {
                                throw new ApplicationError(
                                    StatusCodes.BAD_REQUEST,
                                    bankNameVerification.err.message
                                );
                            }
    
                            // Validasi digit nomor rekening
                            const err =
                                newUserData
                                    .getAkunBank()!
                                    .validateAccountNumberDigit(
                                        bankNameVerification.constraint!
                                    );
                            if (err) {
                                throw new ApplicationError(
                                    StatusCodes.BAD_REQUEST,
                                    err.message
                                );
                            }
    
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
    
            // Hash password & simpan user
            await newUserData.setHashedPassword(this.passwordService);
            await this.userRepository.addUser(newUserData);
    
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
      
}
