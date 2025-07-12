import Joi from "joi";
import { ApplicationError } from "../../abstract/response";
import { StatusCodes } from "http-status-codes";

export const validate = (reqData: unknown, schema: Joi.ObjectSchema<unknown>): unknown => {
    const validationData = schema.validate(reqData);
    if (validationData.error) {
        throw new ApplicationError(StatusCodes.BAD_REQUEST, validationData.error.details[0].message);
    }
    return validationData.value;
};
