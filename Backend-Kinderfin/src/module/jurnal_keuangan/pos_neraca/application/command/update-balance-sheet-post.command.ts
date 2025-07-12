import { StatusCodes } from "http-status-codes";
import {
    AggregateId,
    ApplicationError,
    ICommandHandler,
} from "../../../../../shared/abstract";
import { logger } from "../../../../../shared/util";
import {
    BalanceSheetPostEntity,
    BalanceSheetPostProps,
} from "../../domain/entity";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import {
    BalanceSheetPostService,
    IBalanceSheetPostService,
} from "../../domain/service";

export interface UpdateBalanceSheetPostCommand {
    id: AggregateId;
    tahun_pos_neraca?: number;
    saldo_tahun_lalu?: number;
    saldo_penerimaan_program_reguler?: number;
    saldo_kerja_sama?: number;
    piutang_usaha?: number;
    inventaris?: number;
    penyusutan_inventaris?: number;
    hutang_usaha?: number;
    hutang_bank?: number;
}

export class UpdateBalanceSheetPostCommandHandler
    implements ICommandHandler<UpdateBalanceSheetPostCommand, void>
{
    private readonly balanceSheetPostService: IBalanceSheetPostService;

    constructor(
        private readonly balanceSheetPostRepository: IBalanceSheetPostRepository,
    ) {
        this.balanceSheetPostService = new BalanceSheetPostService();
    }

    async execute(command: UpdateBalanceSheetPostCommand): Promise<void> {
        try {
            const balanceSheetPostData =
                new BalanceSheetPostEntity<BalanceSheetPostProps>(
                    command as BalanceSheetPostProps,
                );
            const oldBalanceSheetPost =
                await this.balanceSheetPostRepository.isBalanceSheetPostDataIdExist(
                    balanceSheetPostData.id,
                );
            if (!oldBalanceSheetPost) {
                logger.error("balance sheett post data is not found");
                throw new ApplicationError(
                    StatusCodes.NOT_FOUND,
                    "Data pos neraca tidak ditemukan",
                );
            }
            if (
                balanceSheetPostData.getTahunPosNeraca() &&
                oldBalanceSheetPost.tahun_pos_neraca !==
                    balanceSheetPostData.getTahunPosNeraca()
            ) {
                const err =
                    await this.balanceSheetPostService.validateUniqueBalanceSheetYear(
                        balanceSheetPostData.getTahunPosNeraca()!,
                        this.balanceSheetPostRepository,
                    );
                if (err) {
                    logger.error(
                        `balance sheet post data for ${balanceSheetPostData.getTahunPosNeraca()!} has been inputted`,
                    );
                    throw new ApplicationError(
                        StatusCodes.BAD_REQUEST,
                        err.message,
                    );
                }
            }
            balanceSheetPostData.calculateCash(oldBalanceSheetPost);
            balanceSheetPostData.validateStability(oldBalanceSheetPost);
            await this.balanceSheetPostRepository.updateBalanceSheetPost(
                balanceSheetPostData,
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            throw new ApplicationError(appErr.code, appErr.message);
        }
    }
}
