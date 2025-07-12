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

export interface AddOrangTuaCommand {
  ayah?: string;
  pekerjaan_ayah?: string;
  ibu?: string;
  pekerjaan_ibu?: string;
  alamat?: string;
  no_telepon?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export class AddOrangTuaCommandHandler
  implements ICommandHandler<AddOrangTuaCommand, void> {
  private readonly userService: IUserService;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly eventBus: EventBus,
  ) {
    this.userService = new UserService();
  }

  async execute(command: AddOrangTuaCommand): Promise<void> { 
    try {
      const newOrangTuaData = new OrangTuaEntity<OrangTuaProps>(
        {
          ayah: command.ayah,
          pekerjaan_ayah: command.pekerjaan_ayah,
          ibu: command.ibu,
          pekerjaan_ibu: command.pekerjaan_ibu,
          alamat: command.alamat,
          no_telepon: command.no_telepon,
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
      await newUserData.setHashedPassword(this.passwordService);
      await this.userRepository.addOrangTua(newOrangTuaData, newUserData);
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}