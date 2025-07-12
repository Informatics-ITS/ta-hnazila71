import { Request, Response } from "express";
import { ApplicationError } from "../../../../shared/abstract";
import { StatusCodes } from "http-status-codes";
import { DefaultMessage } from "../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../shared/util";
import {
    AddDaftarUlangCommand,
    AddDaftarUlangCommandHandler,
    AssignDaftarUlangBillToAllStudentCommandHandler,
    DeleteDaftarUlangCommandHandler,
    UpdateDaftarUlangCommandHandler,
} from "../../application/command";
import {
    IDaftarUlangRepository,
    IDiscountRepository,
    IStudentBillsRepository,
} from "../../domain/repository";
import { addDaftarUlangSchema } from "../mapper";

export class DaftarUlangController {
    constructor(
        private readonly daftarUlangRepository: IDaftarUlangRepository,
        private readonly studentBillRepository: IStudentBillsRepository,
        private readonly discountRepository: IDiscountRepository,
        private readonly eventBus: EventBus,
    ) {}

    async addDaftarUlang(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            logger.info(`Add Daftar Ulang Bill: ${JSON.stringify(body)}`);
            const validData = validate(
                body,
                addDaftarUlangSchema,
            ) as AddDaftarUlangCommand;
            const addDaftarUlangBillHandler = new AddDaftarUlangCommandHandler(
                this.daftarUlangRepository,
                this.eventBus,
            );
            logger.info(`Add Daftar Ulang Bill: ${JSON.stringify(validData)}`);
            const assignDaftarUlangBillToAllStudentHandler =
                new AssignDaftarUlangBillToAllStudentCommandHandler(
                    this.studentBillRepository,
                    this.discountRepository,
                    this.eventBus,
                );

            const bill_id = await addDaftarUlangBillHandler.execute(validData);
            const total_amount =
                validData.biaya_perlengkapan + validData.biaya_kegiatan;
            await assignDaftarUlangBillToAllStudentHandler.execute({
                id_tagihan: bill_id,
                total_amount: total_amount,
            });
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            console.log("Error caught in controller");
            logger.error(error);
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async getAllDaftarUlang(req: Request, res: Response): Promise<void> {
        try {
            const daftarUlang =
                await this.daftarUlangRepository.getAllDaftarUlang();
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                daftarUlang,
            );
        } catch (error) {
            logger.error(error);
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async deleteDaftarUlang(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const daftarUlangBill =
                await this.daftarUlangRepository.findDaftarUlangById(id);
            if (!daftarUlangBill) {
                buildResponseError(
                    res,
                    StatusCodes.NOT_FOUND,
                    "Daftar Ulang Bill not found",
                );
                throw new ApplicationError(404, "Daftar Ulang Bill not found");
            }

            const deleteDaftarUlangHandler =
                new DeleteDaftarUlangCommandHandler(
                    this.daftarUlangRepository,
                    this.studentBillRepository,
                );
            await deleteDaftarUlangHandler.execute({ id });
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_DEL);
        } catch (error) {
            logger.error(error);
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async updateDaftarUlang(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { body } = req;

        try {
            const validData = validate(
                body,
                addDaftarUlangSchema,
            ) as AddDaftarUlangCommand;

            const total_amount =
                parseFloat(validData.biaya_perlengkapan.toString()) +
                parseFloat(validData.biaya_kegiatan.toString());
            const updatedData = Object.assign({}, validData, {
                total_amount,
            });

            const updateDaftarUlangHandler =
                new UpdateDaftarUlangCommandHandler(
                    this.daftarUlangRepository,
                    this.studentBillRepository,
                    this.discountRepository,
                    this.eventBus,
                );

            await updateDaftarUlangHandler.execute({
                id,
                updatedData,
            });
            buildResponseSuccess(res, StatusCodes.OK, DefaultMessage.SUC_UPDT);
        } catch (error) {
            logger.error(error);
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
