import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
    ApplicationError,
    DefaultMessage,
} from "../../../../../shared/abstract";
import {
    EventBus,
    buildResponseError,
    buildResponseSuccess,
    logger,
    validate,
} from "../../../../../shared/util";
import {
    InputBalanceSheetPostCommand,
    InputBalanceSheetPostCommandHandler,
    UpdateBalanceSheetPostCommand,
    UpdateBalanceSheetPostCommandHandler,
} from "../../application/command";
import { IBalanceSheetPostQueryHandler } from "../../application/query";
import { BalanceSheetPostDataRetrievedEvent } from "../../domain/event";
import { IBalanceSheetPostRepository } from "../../domain/repository";
import {
    inputBalanceSheetPostSchema,
    updateBalanceSheetPostSchema,
} from "../mapper";

export class BalanceSheetPostController {
    constructor(
        private readonly balanceSheetPostRepository: IBalanceSheetPostRepository,
        private readonly balanceSheetPostQueryHandler: IBalanceSheetPostQueryHandler,
        private readonly eventBus: EventBus,
    ) {
        this.eventBus.subscribe(
            "BalanceSheetPostDataRequested",
            this.sendBalanceSheetPost.bind(this),
        );
    }

    async inputBalanceSheetPost(req: Request, res: Response): Promise<void> {
        const { body } = req;
        try {
            const validData = validate(
                body,
                inputBalanceSheetPostSchema,
            ) as InputBalanceSheetPostCommand;
            const inputBalanceSheetPostHandler =
                new InputBalanceSheetPostCommandHandler(
                    this.balanceSheetPostRepository,
                );
            await inputBalanceSheetPostHandler.execute(validData);
            logger.info(
                "balance sheet post data has been successfully inputted",
            );
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_ADD,
            );
        } catch (error) {
            logger.error("failed to input balance sheet post data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async viewAllBalanceSheetPosts(req: Request, res: Response): Promise<void> {
        try {
            const balanceSheetPosts =
                await this.balanceSheetPostQueryHandler.getAllBalanceSheetPosts();
            logger.info(
                "all balance sheet post data has been successfully retrieved",
            );
            buildResponseSuccess(
                res,
                StatusCodes.OK,
                DefaultMessage.SUC_AGET,
                balanceSheetPosts,
            );
        } catch (error) {
            logger.error("failed to get all balance sheet post data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }

    async sendBalanceSheetPost(eventData: any): Promise<void> {
        const { tahun } = eventData.data;
        try {
            const balanceSheetPostData =
                await this.balanceSheetPostQueryHandler.getBalanceSheetPostDataByBalanceSheetPostYear(
                    tahun,
                );
            this.eventBus.publish(
                "BalanceSheetPostDataRetrieved",
                new BalanceSheetPostDataRetrievedEvent(
                    balanceSheetPostData,
                    "BalanceSheetPostDataRetrieved",
                ),
            );
            logger.info(
                "balance sheet post data has been successfully retrieved",
            );
        } catch (error) {
            const appErr = error as ApplicationError;
            this.eventBus.publish("BalanceSheetPostDataRetrieved", {
                data: {
                    status: "error",
                    code: appErr.code,
                    message: appErr.message,
                },
                eventName: "BalanceSheetPostDataRetrieved",
            });
            logger.error("failed to get balance sheet post data");
        }
    }

    async updateBalanceSheetPost(req: Request, res: Response): Promise<void> {
        const { body } = req;
        body["id"] = req.params.id;
        try {
            const validData = validate(
                body,
                updateBalanceSheetPostSchema,
            ) as UpdateBalanceSheetPostCommand;
            const updateBalanceSheetPostHandler =
                new UpdateBalanceSheetPostCommandHandler(
                    this.balanceSheetPostRepository,
                );
            await updateBalanceSheetPostHandler.execute(validData);
            logger.info(
                "balance sheet post data has been successfully updated",
            );
            buildResponseSuccess(
                res,
                StatusCodes.CREATED,
                DefaultMessage.SUC_UPDT,
            );
        } catch (error) {
            logger.error("failed to update balance sheet post data");
            const appErr = error as ApplicationError;
            buildResponseError(res, appErr.code, appErr.message);
        }
    }
}
