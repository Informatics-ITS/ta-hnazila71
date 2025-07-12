import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { PemasukanEntity, PemasukanProps } from "../../domain/entity";
import { IPemasukanRepository } from "../../domain/repository";

export interface DeletePemasukanCommand {
  id: string;
}

export class DeletePemasukanCommandHandler
  implements ICommandHandler<DeletePemasukanCommand, void> {
  constructor(
    private readonly pemasukanRepository: IPemasukanRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeletePemasukanCommand): Promise<void> {
    logger.info("command " + command.id);
    try {
      const { id } = command;
      const oldPemasukanData = await this.pemasukanRepository.isDataExist(id);
      if (!oldPemasukanData) {
        logger.error("Data pemasukan rumah tangga tidak ditemukan");
        throw new ApplicationError(
          StatusCodes.NOT_FOUND,
          "Data pemasukan rumah tangga tidak ditemukan",
        );
      }
      await this.pemasukanRepository.deletePemasukan(id);
      logger.info("Data pemasukan rumah tangga berhasil dihapus");
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}