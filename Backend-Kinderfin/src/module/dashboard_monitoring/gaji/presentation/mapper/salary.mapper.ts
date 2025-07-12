import Joi from "joi";

const monitorAllSalariesSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    role: Joi.string().required().messages({
        "string.base": "Input role user harus berupa string",
        "any.required": "Input role user diperlukan",
    }),
});

const monitorSalaryByIdSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    role: Joi.string().required().messages({
        "string.base": "Input role user harus berupa string",
        "any.required": "Input role user diperlukan",
    }),
    user_id: Joi.string().length(36).required().messages({
        "string.base": "Input user_id harus berupa string",
        "string.length": "Input user_id harus bertipe uuid",
        "any.required": "Input user_id diperlukan",
    }),
});

const inputSalarySchema = Joi.object().keys({
    nama_lengkap: Joi.string().required().messages({
        "string.base": "Input nama_lengkap harus berupa string",
        "any.required": "Input nama_lengkap diperlukan",
    }),
    tanggal_pembayaran: Joi.date().required().messages({
        "date.base": "Input tanggal harus berupa date",
        "any.required": "Input tanggal diperlukan",
    }),
    nominal: Joi.number().required().messages({
        "number.base": "Input nominal harus berupa number",
        "any.required": "Input nominal diperlukan",
    }),
    user_id: Joi.string().length(36).required().messages({
        "string.base": "Input user_id harus berupa string",
        "string.length": "Input user_id harus bertipe uuid",
        "any.required": "Input user_id diperlukan",
    }),
});

const deleteSalarySchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});

const updateSalarySchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    nama_lengkap: Joi.string().required().messages({
        "string.base": "Input nama_lengkap harus berupa string",
        "any.required": "Input nama_lengkap diperlukan",
    }),
    tanggal_pembayaran: Joi.date().required().messages({
        "date.base": "Input tanggal harus berupa date",
        "any.required": "Input tanggal diperlukan",
    }),
    nominal: Joi.number().required().messages({
        "number.base": "Input nominal harus berupa number",
        "any.required": "Input nominal diperlukan",
    }),
    status_pembayaran: Joi.string().required().messages({
        "string.base": "Input status_pembayaran harus berupa string",
        "any.required": "Input status_pembayaran diperlukan",
    }),
});


export {
    monitorAllSalariesSchema,
    monitorSalaryByIdSchema,
    inputSalarySchema,
    deleteSalarySchema,
    updateSalarySchema,
};
