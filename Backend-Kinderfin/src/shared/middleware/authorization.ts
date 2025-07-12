import { Request, Response, NextFunction } from "express";
import { buildResponseError, logger } from "../util";
import { StatusCodes } from "http-status-codes";
import { DefaultMessage } from "../abstract";

export const restrictedTo =
    (...allowedRoles: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
        if (!allowedRoles.includes(res.locals.role)) {
            logger.error("user does not have access to this action");
            buildResponseError(
                res,
                StatusCodes.FORBIDDEN,
                DefaultMessage.ERR_AUTH_ROLE,
            );
            return;
        }

        next();
    };
