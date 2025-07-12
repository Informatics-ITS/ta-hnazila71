import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { appConfig } from "../../config";
import { DefaultMessage } from "../abstract";
import { buildResponseError, logger } from "../util";
const token = appConfig.get("/token");

export const middlewareAuthentication = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const [tokenType, accessToken] = req.headers.authorization?.split(" ") ?? [
        "",
        "",
    ];

    if (tokenType !== "Bearer" || !accessToken) {
        logger.error("user are not logged in yet");
        buildResponseError(
            res,
            StatusCodes.UNAUTHORIZED,
            DefaultMessage.ERR_AUTH_TOKEN,
        );
        return;
    }

    try {
        const validToken = jwt.verify(
            accessToken,
            token.secretKey,
        ) as jwt.JwtPayload;
        res.locals.id_user = validToken.id_user;
        res.locals.role = validToken.role;
        res.locals.id_informasi_tambahan = validToken.id_informasi_tambahan;
        next();
    } catch (error) {
        logger.error("invalid login token");
        buildResponseError(
            res,
            StatusCodes.UNAUTHORIZED,
            DefaultMessage.ERR_INVALID_TOKEN,
        );
    }
};
