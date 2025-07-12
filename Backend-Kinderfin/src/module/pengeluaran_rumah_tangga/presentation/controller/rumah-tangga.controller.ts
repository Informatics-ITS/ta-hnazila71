import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import { Request, Response } from "express";
import { buildResponseSuccess, buildResponseError ,EventBus, logger, validate } from "../../../../shared/util";
import { AddRumahTanggaCommand, UpdateRumahTanggaCommand, DeleteRumahTanggaCommand, AddRumahTanggaCommandHandler, DeleteRumahTanggaCommandHandler, UpdateRumahTanggaCommandHandler } from "../../application/command";
import { IRumahTanggaQueryHandler } from "../../application/query";
import { PengeluaranRumahTanggaDataRetrievedEvent } from "../../domain/event";
import { IRumahTanggaRepository } from "../../domain/repository";
import { StatusCodes } from "http-status-codes";
import { addRumahTanggaSchema, updateRumahTanggaSchema, deleteRumahTanggaSchema } from "../mapper";

export class RumahTanggaController {
    constructor(
        private readonly rumahTanggaRepository: IRumahTanggaRepository,
        private readonly rumahTanggaQueryHandler: IRumahTanggaQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "PengeluaranDataRequested",
            this.sendPengeluaranData.bind(this),
        );
  }
  
  async getAllRumahTangga(req: Request, res: Response): Promise<void> {
    const id_user = req.query.user_id;
    logger.debug(`${id_user}`);
    try {
      if (id_user) {
        const rumahTangga = await this.rumahTanggaQueryHandler.getRumahTanggaById({ id_user });
        buildResponseSuccess(
          res,
          StatusCodes.OK,
          DefaultMessage.SUC_AGET,
          rumahTangga
        );
      }
      else {
        const rumahTangga = await this.rumahTanggaQueryHandler.getAllRumahTangga({});
        buildResponseSuccess(
          res,
          StatusCodes.OK,
          DefaultMessage.SUC_AGET,
          rumahTangga
        );
      }
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

    async addRumahTangga(req: Request, res: Response): Promise<void> {
      try {
        const [jenis_pengeluaran, nama, nominal, user_id] = [req.body.jenis_pengeluaran, req.body.nama, req.body.nominal, req.body.user_id];
        const valid: any = validate(
          { jenis_pengeluaran, nama, nominal, user_id },
          addRumahTanggaSchema);
        const validData: AddRumahTanggaCommand = {
          jenis_pengeluaran: valid.jenis_pengeluaran,
          nama: valid.nama,
          nominal: valid.nominal,
          user_id: valid.user_id,
        };
        logger.debug(JSON.stringify(validData));
        const addRumahTanggaHandler = new AddRumahTanggaCommandHandler(
          this.rumahTanggaRepository,
          this.eventBus,
        );
        await addRumahTanggaHandler.execute(validData);
        logger.info("salary data has been successfully inputted");
        buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_ADD);
      } catch (error) {
        logger.error(error);
        const appErr = error as ApplicationError;
        buildResponseError(res, appErr.code, appErr.message);
      }
    }

    async updateRumahTangga(req: Request, res: Response): Promise<void> {
      try {
        const { id } = req.params;
        const [jenis_pengeluaran, nama, nominal, user_id] = [req.body.jenis_pengeluaran, req.body.nama, req.body.nominal, req.body.user_id];
        const valid: any = validate(
          { id, jenis_pengeluaran, nama, nominal, user_id },
          updateRumahTanggaSchema);
        const validData: UpdateRumahTanggaCommand = {
          id: valid.id,
          jenis_pengeluaran: valid.jenis_pengeluaran,
          nama: valid.nama,
          nominal: valid.nominal,
          user_id: valid.user_id, // dummy value
        };
        const updateRumahTanggaHandler = new UpdateRumahTanggaCommandHandler(
          this.rumahTanggaRepository,
          this.eventBus,
        );
        await updateRumahTanggaHandler.execute(validData);
        buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
      } catch (error) {
        logger.error(error);
        const appErr = error as ApplicationError;
        buildResponseError(res, appErr.code, appErr.message);
      }
    }

  async deleteRumahTangga(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const valid: any = validate(
        { id },
        deleteRumahTanggaSchema);
      const validData: DeleteRumahTanggaCommand = {
        id: valid.id,
      };
      const deleteRumahTanggaHandler = new DeleteRumahTanggaCommandHandler(
        this.rumahTanggaRepository,
        this.eventBus,
      );
      await deleteRumahTanggaHandler.execute(validData);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async sendPengeluaranData(eventData: any): Promise<void> {
    try {
      const pengeluaran = await this.rumahTanggaQueryHandler.getAllRumahTangga({});
      this.eventBus.publish(
        "PengeluaranDataRetrieved",
        new PengeluaranRumahTanggaDataRetrievedEvent(
          pengeluaran,
          "PengeluaranDataRetrieved"
        )
      );
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

}