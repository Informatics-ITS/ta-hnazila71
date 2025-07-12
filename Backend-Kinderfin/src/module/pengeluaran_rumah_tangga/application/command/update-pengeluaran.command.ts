import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, ICommandHandler } from "../../../../shared/abstract";
import { EventBus, logger } from "../../../../shared/util";
import { RumahTanggaEntity, RumahTanggaProps } from "../../domain/entity";
import { IRumahTanggaRepository } from "../../domain/repository";

export interface UpdateRumahTanggaCommand { 
  id: string;
  jenis_pengeluaran: string;
  nama: string;
  nominal: number;
  user_id: string;
}

export class UpdateRumahTanggaCommandHandler
  implements ICommandHandler<UpdateRumahTanggaCommand, void> {
  constructor(
    private readonly rumahTanggaRepository: IRumahTanggaRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateRumahTanggaCommand): Promise<void> {
    logger.info("command " + command.jenis_pengeluaran);
    try {
      const newRumahTanggaData = new RumahTanggaEntity<RumahTanggaProps>({
        id: command.id,
        jenis_pengeluaran: command.jenis_pengeluaran,
        nama: command.nama,
        nominal: command.nominal,
        user_id: command.user_id, // dummy value
      });
      await this.rumahTanggaRepository.updateRumahTangga(newRumahTanggaData);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}