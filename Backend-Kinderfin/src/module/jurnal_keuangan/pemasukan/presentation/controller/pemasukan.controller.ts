import { ApplicationError, DefaultMessage } from "../../../../../shared/abstract";
import { Request, Response } from "express";
import { buildResponseSuccess, buildResponseError ,EventBus, logger, validate} from "../../../../../shared/util";
import { AddPemasukanCommand, UpdatePemasukanCommand, DeletePemasukanCommand, AddPemasukanCommandHandler, DeletePemasukanCommandHandler, UpdatePemasukanCommandHandler } from "../../application/command";
import { IPemasukanQueryHandler } from "../../application/query";
import { PemasukanDataRetrievedEvent } from "../../domain/event";
import { IPemasukanRepository } from "../../domain/repository";
import { StatusCodes } from "http-status-codes";
import { addPemasukanSchema, updatePemasukanSchema, deletePemasukanSchema } from "../mapper";

export class PemasukanController {
    constructor(
        private readonly pemasukanRepository: IPemasukanRepository,
        private readonly pemasukanQueryHandler: IPemasukanQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "PemasukanDataRequested",
            this.sendPemasukanData.bind(this),
        );
  }
  
  async getAllPemasukan(req: Request, res: Response): Promise<void> {
    const id_user = req.query.user_id;
    logger.debug(`${id_user}`);
    try {
      if (id_user) {
        const pemasukan = await this.pemasukanQueryHandler.getPemasukanById({ id_user });
        buildResponseSuccess(
          res,
          StatusCodes.OK,
          DefaultMessage.SUC_AGET,
          pemasukan
        );
      }
      else {
        const pemasukan = await this.pemasukanQueryHandler.getAllPemasukan({});
        buildResponseSuccess(
          res,
          StatusCodes.OK,
          DefaultMessage.SUC_AGET,
          pemasukan
        );
      }
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

    async addPemasukan(req: Request, res: Response): Promise<void> {
      try {
        const [jenis_pemasukan, nama, nominal, user_id] = [req.body.jenis_pemasukan, req.body.nama, req.body.nominal, req.body.user_id];
        const valid: any = validate(
          { jenis_pemasukan, nama, nominal, user_id },
          addPemasukanSchema);
        const validData: AddPemasukanCommand = {
          jenis_pemasukan: valid.jenis_pemasukan,
          nama: valid.nama,
          nominal: valid.nominal,
          user_id: valid.user_id,
        };
        logger.debug(JSON.stringify(validData));
        const addPemasukanHandler = new AddPemasukanCommandHandler(
          this.pemasukanRepository,
          this.eventBus,
        );
        await addPemasukanHandler.execute(validData);
        logger.info("salary data has been successfully inputted");
        buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_ADD);
      } catch (error) {
        logger.error(error);
        const appErr = error as ApplicationError;
        buildResponseError(res, appErr.code, appErr.message);
      }
    }

    async updatePemasukan(req: Request, res: Response): Promise<void> {
      try {
        const { id } = req.params;
        const [jenis_pemasukan, nama, nominal, user_id] = [req.body.jenis_pemasukan, req.body.nama, req.body.nominal, req.body.user_id];
        const valid: any = validate(
          { id, jenis_pemasukan, nama, nominal, user_id },
          updatePemasukanSchema);
        const validData: UpdatePemasukanCommand = {
          id: valid.id,
          jenis_pemasukan: valid.jenis_pemasukan,
          nama: valid.nama,
          nominal: valid.nominal,
          user_id: valid.user_id, // dummy value
        };
        const updatePemasukanHandler = new UpdatePemasukanCommandHandler(
          this.pemasukanRepository,
          this.eventBus,
        );
        await updatePemasukanHandler.execute(validData);
        buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
      } catch (error) {
        logger.error(error);
        const appErr = error as ApplicationError;
        buildResponseError(res, appErr.code, appErr.message);
      }
    }

  async deletePemasukan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const valid: any = validate(
        { id },
        deletePemasukanSchema);
      const validData: DeletePemasukanCommand = {
        id: valid.id,
      };
      const deletePemasukan = new DeletePemasukanCommandHandler(
        this.pemasukanRepository,
        this.eventBus,
      );
      await deletePemasukan.execute(validData);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async sendPemasukanData(eventData: any): Promise<void> {
    try {
      const pemasukan = await this.pemasukanQueryHandler.getAllPemasukan({});
      this.eventBus.publish(
        "PemasukanDataRetrieved",
        new PemasukanDataRetrievedEvent(
          pemasukan,
          "PemasukanDataRetrieved"
        )
      );
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

}