import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { PemasukanEntity, PemasukanProps } from "../../domain/entity";
import { IPemasukanRepository } from "../../domain/repository";

export interface AddPemasukanCommand {
  jenis_pemasukan: string;
  nama: string;
  nominal: number;
  user_id: string;
}

export class AddPemasukanCommandHandler
  implements ICommandHandler<AddPemasukanCommand, void> {
  constructor(
    private readonly pemasukanRepository: IPemasukanRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddPemasukanCommand): Promise<void> {
    logger.info("command " + command.jenis_pemasukan);
    try {
      const newPemasukanData = new PemasukanEntity<PemasukanProps>({
        jenis_pemasukan: command.jenis_pemasukan,
        nama: command.nama,
        nominal: command.nominal,
        user_id: command.user_id,

      });
      await this.pemasukanRepository.addPemasukan(newPemasukanData);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}