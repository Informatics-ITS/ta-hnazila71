import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { RumahTanggaEntity, RumahTanggaProps } from "../../domain/entity";
import { IRumahTanggaRepository } from "../../domain/repository";
import { log } from "console";

export interface DeleteRumahTanggaCommand {
  id: string;
}

export class DeleteRumahTanggaCommandHandler
  implements ICommandHandler<DeleteRumahTanggaCommand, void> {
  constructor(
    private readonly rumahTanggaRepository: IRumahTanggaRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteRumahTanggaCommand): Promise<void> {
    logger.info("command " + command.id);
    try {
      const { id } = command;
      const oldRumahTanggaData = await this.rumahTanggaRepository.isDataExist(id);
      if (!oldRumahTanggaData) {
        logger.error("Data pengeluaran rumah tangga tidak ditemukan");
        throw new ApplicationError(
          StatusCodes.NOT_FOUND,
          "Data pengeluaran rumah tangga tidak ditemukan",
        );
      }
      await this.rumahTanggaRepository.deleteRumahTangga(id);
      logger.info("Data pengeluaran rumah tangga berhasil dihapus");
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}