import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../../../../config";
import { ApplicationError, DefaultMessage } from "../../../../shared/abstract";
import {
    buildResponseError,
    buildResponseSuccess,
    EventBus,
    logger,
    validate,
} from "../../../../shared/util";

import { AddStudentBillsCommand, AddDiscountCommandHandler, AddStudentBillsCommandHandler } from "../../application/command";
import { IStudentBillsRepository } from "../../domain/repository";
import { addStudentBillsSchema } from "../mapper";

export class StudentBillsController {

  constructor(
    private readonly studentBillsRepository: IStudentBillsRepository,
    private readonly eventBus: EventBus,
  ) {
    this.eventBus.subscribe(
      "AddSPPBill",
      this.assignSPPBillToAllStudents.bind(this),
    )
  }

  async addStudentBills(req: Request, res: Response): Promise<void> { 
    const { body } = req;
    try {
      const validData = validate(
        body,
        addStudentBillsSchema,
      ) as AddStudentBillsCommand;
      const addStudentBillsHandler =
        new AddStudentBillsCommandHandler(
          this.studentBillsRepository,
        );
      await addStudentBillsHandler.execute(validData);
      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async assignSPPBillToAllStudents(event: any): Promise<void> {
    try {
      const { bill_id } = event;
      // get all students
      // assign bill to all students
    } catch (error) {
      logger.error(error);
    }
  }

  async getBillByParentId(req: Request, res: Response): Promise<void> { 
    const parentId = res.locals.id_user;
    try {
      const studentBills = await this.studentBillsRepository.getBillsByParentId(parentId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getDaftarUlangBillByParentId(req: Request, res: Response): Promise<void> { 
    const parentId = res.locals.id_user;
    try {
      const studentBills = await this.studentBillsRepository.getDaftarUlangBillsByParentId(parentId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
  
  async getBillByStudentId(req: Request, res: Response): Promise<void> {
    const { studentId } = req.query; 
    try {
      const studentBills = await this.studentBillsRepository.getBillsByStudentId(studentId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getBillByTagihanId(req: Request, res: Response): Promise<void> {
    const { tagihanId } = req.query; 
    try {
      const studentBills = await this.studentBillsRepository.getBillsByTagihanId(tagihanId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async deleteStudentBillsByDaftarUlangId(req: Request, res: Response): Promise<void> {
    const { daftarUlangId } = req.query; 
    try {
      await this.studentBillsRepository.deleteStudentBillsByDaftarUlangId(daftarUlangId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async updateStatusStudentBill(req: Request, res: Response): Promise<void> {
    const { status } = req.body;
    const { id } = req.params;
    if (status !== true && status !== false) {
      buildResponseError(res, StatusCodes.BAD_REQUEST, "Status tidak valid");
      return;
    }
    try {
      await this.studentBillsRepository.updateStatusStudentBill(id, status);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async updateStatusDaftarUlangStudentBill(req: Request, res: Response): Promise<void> {
    const { status } = req.body;
    const { id } = req.params;
    if (status !== true && status !== false) {
      buildResponseError(res, StatusCodes.BAD_REQUEST, "Status tidak valid");
      return;
    }
    try {
      await this.studentBillsRepository.updateStatusDaftarUlangStudentBill(id, status);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getAllStudentBills(req: Request, res: Response): Promise<void> {
    try {
      const studentBills = await this.studentBillsRepository.getAllStudentBills();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getAllDaftarUlangStudentBills(req: Request, res: Response): Promise<void> {
    try {
      const studentBills = await this.studentBillsRepository.getAllDaftarUlangStudentBills();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, studentBills);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
}