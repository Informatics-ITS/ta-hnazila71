import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { ApplicationError, DefaultMessage } from "../abstract";

export const uploader = multer({
    storage: multer.memoryStorage(),
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: multer.FileFilterCallback,
    ) => {
        if (
            file.mimetype !== "image/png" &&
            file.mimetype !== "image/jpg" &&
            file.mimetype !== "image/jpeg"
        ) {
            callback(
                new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    DefaultMessage.ERR_INVALID_FILE_FORMAT,
                ),
            );
        } else if (file.size > 1024 * 1024) {
            callback(
                new ApplicationError(
                    StatusCodes.BAD_REQUEST,
                    DefaultMessage.ERR_INVALID_FILE_SIZE,
                ),
            );
        } else {
            callback(null, true);
        }
    },
});
