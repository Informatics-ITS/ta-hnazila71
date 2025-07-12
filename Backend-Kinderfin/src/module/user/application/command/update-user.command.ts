import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../shared/abstract";
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

export interface UpdateUserCommand {
    id: AggregateId;
    nip?: string;
    nama_lengkap?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    nama_bank?: string;
    pemilik_rekening?: string;
    nomor_rekening?: string;
}

export class UpdateUserCommandHandler
    implements ICommandHandler<UpdateUserCommand, void>
{
    private readonly userService: IUserService;

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordService: IPasswordService,
        private readonly eventBus: EventBus,
    ) {
        this.userService = new UserService();
    }

    async execute(command: UpdateUserCommand): Promise<void> {
        const { nama_bank, pemilik_rekening, nomor_rekening } = command;
        try {
          const oldUserData = await this.userRepository.isUserIdExist(command.id);
          if (!oldUserData) {
            logger.error("user is not registered");
            throw new ApplicationError(StatusCodes.NOT_FOUND, "User tidak terdaftar");
          }
      
          // 🚀 Buat UserEntity dan pastikan id_informasi_tambahan ikut dimasukkan
          const userData = new UserEntity<UserProps>({
            ...oldUserData,
            ...command,
            id_informasi_tambahan: oldUserData.id_informasi_tambahan,
          });
      
          // ✅ Validasi email unik jika diubah
          if (userData.getEmail() && userData.getEmail() !== oldUserData.email) {
            const err = await this.userService.validateUniqueUser(
              userData.getEmail()!,
              this.userRepository
            );
            if (err) {
              logger.error("email has been registered");
              throw new ApplicationError(StatusCodes.BAD_REQUEST, err.message);
            }
          }
      
          // ✅ Validasi & verifikasi akun bank jika ada perubahan
          if (nama_bank || pemilik_rekening || nomor_rekening) {
            userData.setAkunBank(
              new BankAccount(
                nama_bank ?? oldUserData.nama_bank!,
                pemilik_rekening ?? oldUserData.pemilik_rekening!,
                nomor_rekening ?? oldUserData.nomor_rekening!
              )
            );
      
            this.eventBus.removeSpecificListener("MasterDataRetrieved");
            this.eventBus.publish(
              "MasterDataRequested",
              new MasterDataRequestedEvent(
                { tipe: masterDataType.bank },
                "MasterDataRequested"
              )
            );
      
            await new Promise<void>((resolve, reject) => {
              this.eventBus.subscribe("MasterDataRetrieved", async (masterData: any) => {
                try {
                  if (masterData.data.status == "error") {
                    throw new ApplicationError(masterData.data.code, masterData.data.message);
                  }
      
                  const bankNameVerification = userData.verifyBankNameMasterData(masterData.data);
                  if (bankNameVerification.err) {
                    throw new ApplicationError(StatusCodes.BAD_REQUEST, bankNameVerification.err.message);
                  }
      
                  const err = userData.getAkunBank()!.validateAccountNumberDigit(bankNameVerification.constraint!);
                  if (err) {
                    throw new ApplicationError(StatusCodes.BAD_REQUEST, err.message);
                  }
      
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
            });
          }
      
          // ✅ Hash password jika dikirim
          if (userData.getPassword() !== undefined) {
            await userData.setHashedPassword(this.passwordService);
          }
      
          // ✅ Update ke repository (user + teachers sinkron)
          await this.userRepository.updateUser(userData);
      
        } catch (error) {
          const appErr = error as ApplicationError;
          throw new ApplicationError(appErr.code, appErr.message);
        }
      }
      
}
