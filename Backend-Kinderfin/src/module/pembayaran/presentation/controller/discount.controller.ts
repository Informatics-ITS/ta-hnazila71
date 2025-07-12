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

import { AddDiscountCommand, AddDiscountCommandHandler } from "../../application/command";
import { IDiscountRepository, IStudentBillsRepository } from "../../domain/repository";
import { addDiscountSchema, deleteDiscountSchema } from "../mapper";
import { DeleteDiscountCommand, DeleteDiscounCommandHandler } from "../../application/command/delete-discount.command";

export class DiscountController {

  constructor(
    private readonly discountRepository: IDiscountRepository,
    private readonly studentBillRepository: IStudentBillsRepository,
  ) { }
  
  async addDiscount(req: Request, res: Response): Promise<void> {
    const { body } = req;
    try {
      const validData = validate(
        body,
        addDiscountSchema,
      ) as AddDiscountCommand;
      const addDiscountHandler =
        new AddDiscountCommandHandler(
          this.discountRepository,
        );
      await addDiscountHandler.execute(validData);
      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async deleteDiscountById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const validData = validate(
        { id },
        deleteDiscountSchema,
      ) as DeleteDiscountCommand;

      const deleteDiscountHandler = new DeleteDiscounCommandHandler(
        this.discountRepository,
        this.studentBillRepository,
      );

      await deleteDiscountHandler.execute(validData);

      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
}