import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../../shared/abstract";
import { EventBus, logger } from "../../../../../shared/util";
import { PemasukanEntity, PemasukanProps } from "../../domain/entity";
import { IPemasukanRepository } from "../../domain/repository";

export interface UpdatePemasukanCommand { 
  id: string;
  jenis_pemasukan: string;
  nama: string;
  nominal: number;
  user_id: string;
}

export class UpdatePemasukanCommandHandler
  implements ICommandHandler<UpdatePemasukanCommand, void> {
  constructor(
    private readonly pemasukanRepository: IPemasukanRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdatePemasukanCommand): Promise<void> {
    logger.info("command " + command.jenis_pemasukan);
    try {
      const newPemasukan = new PemasukanEntity<PemasukanProps>({
        id: command.id,
        jenis_pemasukan: command.jenis_pemasukan,
        nama: command.nama,
        nominal: command.nominal,
        user_id: command.user_id, // dummy value
      });
      await this.pemasukanRepository.updatePemasukan(newPemasukan);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}