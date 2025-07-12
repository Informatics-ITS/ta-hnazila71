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

import { AddUserBillPaymentsCommand, AddUserBillPaymentsCommandHandler, SettleUserBillPaymentsCommand, SettleUserBillPaymentsCommandHandler, SettleDaftarUlangBillPaymentsCommand, SettleDaftarUlangBillPaymentsCommandHandler } from "../../application/command";
import { IPaymentProofRepository, IStudentBillsRepository, IUserBillPaymentsRepository } from "../../domain/repository";
import { addUserBillPaymentsSchema, settleUserBillPaymentsSchema } from "../mapper";
import { IFileService } from "../../application/service";
import ImageKit from "imagekit";
import { FileService } from "../../infrastructure/service";
const imagekit = appConfig.get("/imagekit");


export class UserBillPaymentsController {

  constructor(
    private readonly userBillPaymentsRepository: IUserBillPaymentsRepository,
    private readonly studentBillRepository: IStudentBillsRepository,
    private readonly paymentProofRepository: IPaymentProofRepository,

  ) {}

  async addUserBillPayments(req: Request, res: Response): Promise<void> { 
    const { body } = req;
    try {
      const validData = validate(
        body,
        addUserBillPaymentsSchema,
      ) as AddUserBillPaymentsCommand;
      const addUserBillPaymentsHandler =
        new AddUserBillPaymentsCommandHandler(
          this.userBillPaymentsRepository,
        );
      await addUserBillPaymentsHandler.execute(validData);
      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async settleUserBillPayments(req: Request, res: Response): Promise<void> {
    const { body } = req;
    const { spp, student } = req.query;
    body["bukti_pembayaran"] = req.file;
    try {
      const validData = validate(
        { ...body, id_student: student, id_student_bill: spp, bukti_pembayaran: req.file },
        settleUserBillPaymentsSchema,
      ) as SettleUserBillPaymentsCommand;

      const imageKit = new ImageKit({
        publicKey: imagekit.publicKey,
        privateKey: imagekit.privateKey,
        urlEndpoint: imagekit.urlEndpoint
    });
    const fileService = new FileService(imageKit);


      const settleUserBillPaymentsHandler = 
        new SettleUserBillPaymentsCommandHandler(
          this.userBillPaymentsRepository,
          this.studentBillRepository,
          this.paymentProofRepository,
          fileService,
        );
      
      await settleUserBillPaymentsHandler.execute(validData);

      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);

    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async settleUserDaftarUlangBillPayments(req: Request, res: Response): Promise<void> {
    const { body } = req;
    const { daftar_ulang, student } = req.query;
    body["bukti_pembayaran"] = req.file;
    try {
      const validData = validate(
        { ...body, id_student: student, id_student_bill: daftar_ulang, bukti_pembayaran: req.file },
        settleUserBillPaymentsSchema,
      ) as SettleDaftarUlangBillPaymentsCommand;

      const imageKit = new ImageKit({
        publicKey: imagekit.publicKey,
        privateKey: imagekit.privateKey,
        urlEndpoint: imagekit.urlEndpoint
    });
    const fileService = new FileService(imageKit);
      const settleDaftarUlangBillPaymentsHandler = 
        new SettleDaftarUlangBillPaymentsCommandHandler(
          this.userBillPaymentsRepository,
          this.studentBillRepository,
          this.paymentProofRepository,
          fileService,
        );
      await settleDaftarUlangBillPaymentsHandler.execute(validData);
      buildResponseSuccess(res, StatusCodes.CREATED, DefaultMessage.SUC_ADD);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getHistoryPayment(req: Request, res: Response): Promise<void> {
    const parentId = res.locals.id_user;
    try {
      const userBillPayments = await this.userBillPaymentsRepository.getHistoryPayment(parentId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, userBillPayments);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getDaftarUlangHistoryPaymentByParents(req: Request, res: Response): Promise<void> {
    const parentId = res.locals.id_user;
    try {
      const userBillPayments = await this.userBillPaymentsRepository.getDaftarUlangHistoryPaymentByParents(parentId as string);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, userBillPayments);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async getDaftarUlangHistoryPayment(req: Request, res: Response): Promise<void> {
    try {
      const userBillPayments = await this.userBillPaymentsRepository.getDaftarUlangHistoryPayment();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, userBillPayments);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
  
  async getHistoryPayments(req: Request, res: Response): Promise<void> {
    try {
      const userBillPayments = await this.userBillPaymentsRepository.getAllHistoryPayments();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_AGET, userBillPayments);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async deleteAllHistoryPayments(req: Request, res: Response): Promise<void> {
    try {
      await this.userBillPaymentsRepository.deleteAllHistoryPayments();
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async deleteHistoryPaymentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      await this.userBillPaymentsRepository.deleteHistoryPaymentById(id);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async updateStatusPayment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (status !== "PENDING" && status !== "APPROVED" && status !== "REJECTED") {
      buildResponseError(res, StatusCodes.BAD_REQUEST, "Status tidak valid");
      return;
    }

    try {
      await this.userBillPaymentsRepository.updateStatusPayment(id, status, catatan);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }

  async updateStatusDaftarUlangPayment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, catatan } = req.body;

    if (status !== "PENDING" && status !== "APPROVED" && status !== "REJECTED") {
      buildResponseError(res, StatusCodes.BAD_REQUEST, "Status tidak valid");
      return;
    }

    try {
      await this.userBillPaymentsRepository.updateStatusDaftarUlangPayment(id, status, catatan);
      buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
    } catch (error) {
      logger.error(error);
      const appErr = error as ApplicationError;
      buildResponseError(res, appErr.code, appErr.message);
    }
  }
}