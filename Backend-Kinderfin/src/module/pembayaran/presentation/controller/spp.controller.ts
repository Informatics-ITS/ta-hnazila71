import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import { AddSPPBillCommand, AddSPPBillCommandHandler, AssignSPPBillToAllStudentCommandHandler } from "../../application/command";
import { IDiscountRepository, ISPPRepository, IStudentBillsRepository } from "../../domain/repository";
import { addDiscountSchema, addSPPBillSchema, editDiscountSchema, editSPPBillSchema } from "../mapper";
import { EditDiscountCommand, EditDiscountCommandHandler } from "../../application/command/edit-discount.command";
import { EditSPPCommand, EditSPPCommandHandler } from "../../application/command/edit-spp.command";
import { DeleteSPPCommandHandler } from "../../application/command/delete-spp.command";

export class SPPController {

  constructor(
    private readonly sppRepository: ISPPRepository,
    private readonly studentBillRepository: IStudentBillsRepository,
    private readonly discountRepository: IDiscountRepository,
    private readonly eventBus: EventBus,
  ) {}

  async addSPPBill(req: Request, res: Response): Promise<void> { 
    const { body } = req;
    try {
      logger.info(`Add SPP Bill: ${JSON.stringify(body)}`);
      const validData = validate(
        body,
        addSPPBillSchema,
      ) as AddSPPBillCommand;
      const addSPPBillHandler =
        new AddSPPBillCommandHandler(
          this.sppRepository,
          this.eventBus,
        );
      
      logger.info(`Add SPP Bill: ${JSON.stringify(validData)}`);
      
      const AssignSPPBillToAllStudentHandler = new AssignSPPBillToAllStudentCommandHandler(
        this.studentBillRepository,
        this.discountRepository,
        this.eventBus,
      );

      const bill_id = await addSPPBillHandler.execute(validData);
      const total_amount = validData.biaya_spp + validData.biaya_komite + validData.biaya_ekstrakulikuler;
      await AssignSPPBillToAllStudentHandler.execute({ id_tagihan: bill_id, total_amount: total_amount });

      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getSPPBill(req: Request, res: Response): Promise<void> {
    try {
      const sppBill = await this.sppRepository.getAllSPPBill();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_GET, sppBill);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getDiscounts(req: Request, res: Response): Promise<void> {
    try {
      const discounts = await this.discountRepository.getAllDiscounts();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_GET, discounts);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
  

  async editDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req;
      const { id } = req.params;
      const discount = await this.discountRepository.getDiscountById(id);
      if (!discount) {
        throw new ApplicationError(404, "Discount not found");
      }

      const validData = validate(
        { ...body, id },
        editDiscountSchema,
      ) as EditDiscountCommand;

      const editDiscountHandler = new EditDiscountCommandHandler(this.discountRepository);
      await editDiscountHandler.execute(validData);

      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async editSPPBillById(req: Request, res: Response): Promise<void> {
    try {
      const { body } = req;
      const { id } = req.params;
      const sppBill = await this.sppRepository.getSPPBillById(id);
      if (!sppBill) {
        throw new ApplicationError(404, "SPP Bill not found");
      }

      const validData = validate(
        { ...body, id },
        editSPPBillSchema,
      ) as EditSPPCommand;

      const editSPPBillHandler = new EditSPPCommandHandler(this.sppRepository, this.studentBillRepository);
      await editSPPBillHandler.execute(validData);

      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async deleteSPPBillById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sppBill = await this.sppRepository.getSPPBillById(id);
      if (!sppBill) {
        throw new ApplicationError(404, "SPP Bill not found");
      }

      const deleteSPPHandler = new DeleteSPPCommandHandler(this.sppRepository, this.studentBillRepository);

      await deleteSPPHandler.execute({ id });

      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
}