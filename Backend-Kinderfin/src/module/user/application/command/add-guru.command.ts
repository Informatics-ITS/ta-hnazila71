import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { GuruEntity, GuruProps, UserEntity, UserProps } from "../../domain/entity";
import { OrangTuaEntity, OrangTuaProps } from "../../domain/entity";
import { MasterDataRequestedEvent } from "../../domain/event";
import { IUserRepository } from "../../domain/repository";
import {
  IPasswordService,
  IUserService,
  UserService,
} from "../../domain/service";
import { BankAccount } from "../../domain/value_object";
import { UserRole } from "../../domain/enum";
const masterDataType = appConfig.get("/masterData");


export interface AddGuruCommand {
  nip?: string;
  jabatan?: string;
  nama_lengkap: string;
  email: string;
  password: string;
  role?: UserRole;
  nama_bank: string;
  pemilik_rekening: string;
  nomor_rekening: string;
}

export class AddGuruCommandHandler
  implements ICommandHandler<AddGuruCommand, void> {
  private readonly userService: IUserService;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly eventBus: EventBus,
  ) {
    this.userService = new UserService();
  }

  async execute(command: AddGuruCommand): Promise<void> {
    logger.info("command " + command.nama_bank);
    const { nama_bank, pemilik_rekening, nomor_rekening } = command;
    logger.info("data bank" + nama_bank + pemilik_rekening + nomor_rekening);
    try {
      const newGuruData = new GuruEntity<GuruProps>(
        {
          nama_lengkap: command.nama_lengkap,
          nip: command.nip,
          jabatan: command.jabatan,
          nama_bank: command.nama_bank,
          pemilik_rekening: command.pemilik_rekening,
          nomor_rekening: command.nomor_rekening,
        }
      );
      const newUserData = new UserEntity<UserProps>(
        {
          email: command.email,
          password: command.password,
          role: command.role,
        }
      );
      const err = await this.userService.validateUniqueUser(
        newUserData.getEmail()!,
        this.userRepository,
      );
      if (err) {
        logger.error("email has been registered");
        throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          err.message,
        );
      }
      newGuruData.setAkunBank(
        new BankAccount(nama_bank, pemilik_rekening, nomor_rekening),
      );
      this.eventBus.removeSpecificListener("MasterDataRetrieved");
      this.eventBus.publish(
        "MasterDataRequested",
        new MasterDataRequestedEvent(
          { tipe: masterDataType.bank },
          "MasterDataRequested",
        ),
      );
      await new Promise<void>((resolve, reject) => {
        this.eventBus.subscribe(
          "MasterDataRetrieved",
          async (masterData: any) => {
            try {
              if (masterData.data.status == 'error') {
                throw new ApplicationError(
                  masterData.data.code,
                  masterData.data.message,
                );
              }
              // print master data using logger
              const bankNameVerification = newGuruData.verifyBankNameMasterData(
                masterData.data
              );
              if (bankNameVerification.err) {
                throw new ApplicationError(
                  StatusCodes.BAD_REQUEST,
                  bankNameVerification.err.message,
                );
              }
              const err = newGuruData
              .getAkunBank()!
              .validateAccountNumberDigit(
                bankNameVerification.constraint!,
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
          }
        );
      });
      await newUserData.setHashedPassword(this.passwordService);
      await this.userRepository.addGuru(newGuruData, newUserData);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}