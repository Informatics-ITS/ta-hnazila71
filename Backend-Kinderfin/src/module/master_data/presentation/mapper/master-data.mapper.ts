import Joi from "joi";

export const inputMasterDataSchema = Joi.object().keys({
    tipe: Joi.string().required().messages({
        "string.base": "Input tipe harus berupa string",
        "any.required": "Input tipe diperlukan",
    }),
    nilai: Joi.string().required().messages({
        "string.base": "Input nilai harus berupa string",
        "any.required": "Input nilai diperlukan",
    }),
    aturan: Joi.string().messages({
        "string.base": "Input aturan harus berupa string",
    }),
    deskripsi: Joi.string().messages({
        "string.base": "Input deskripsi harus berupa string",
    }),
});

export const viewAllMasterDatasSchema = Joi.object().keys({
    tipe: Joi.string().required().messages({
        "string.base": "Input tipe harus berupa string",
        "any.required": "Input tipe diperlukan",
    }),
});

export const updateMasterDataSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    nilai: Joi.string().messages({
        "string.base": "Input nilai harus berupa string",
    }),
    aturan: Joi.string().messages({
        "string.base": "Input aturan harus berupa string",
    }),
    deskripsi: Joi.string().messages({
        "string.base": "Input deskripsi harus berupa string",
    }),
});

export const deleteMasterDataSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});
