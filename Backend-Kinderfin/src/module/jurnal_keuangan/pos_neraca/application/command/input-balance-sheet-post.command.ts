import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { logger } from "../../../../../shared/util";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import { BalanceSheetPostService, IBalanceSheetPostService } from "../../domain/service";

export interface InputBalanceSheetPostCommand {
    tahun_pos_neraca: number;
    saldo_tahun_lalu: number;
    saldo_penerimaan_program_reguler: number;
    saldo_kerja_sama: number;
    piutang_usaha: number;
    inventaris: number;
    penyusutan_inventaris: number;
    hutang_usaha: number;
    hutang_bank: number;
}

export class InputBalanceSheetPostCommandHandler
    implements ICommandHandler<InputBalanceSheetPostCommand, void> {
    private readonly balanceSheetPostService: IBalanceSheetPostService;

    constructor(private readonly balanceSheetPostRepository: IBalanceSheetPostRepository) {
        this.balanceSheetPostService = new BalanceSheetPostService();
    }

    async execute(command: InputBalanceSheetPostCommand): Promise<void> {
        try {
            const newBalanceSheetPostData =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    command as BalanceSheetPostProps,
                );
            const err = await this.balanceSheetPostService.validateUniqueBalanceSheetYear(
                newBalanceSheetPostData.getTahunPosNeraca()!,
                this.balanceSheetPostRepository,
            );
            if (err) {
                logger.error(
                    `balance sheet post data for ${newBalanceSheetPostData.getTahunPosNeraca()!} has been inputted`,
                );
                throw new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    err.message,
                );
            }
            newBalanceSheetPostData.calculateCash();
            newBalanceSheetPostData.validateStability();
            await this.balanceSheetPostRepository.addBalanceSheetPost(
                newBalanceSheetPostData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
