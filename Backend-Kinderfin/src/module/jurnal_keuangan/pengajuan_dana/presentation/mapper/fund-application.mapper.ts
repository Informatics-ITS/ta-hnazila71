import Joi from "joi";

export const inputFundApplicationSchema = Joi.object().keys({
    bulan: Joi.number().required().messages({
        "number.base": "Input bulan harus berupa angka",
        "any.required": "Input bulan diperlukan",
    }),
    tahun: Joi.number().required().messages({
        "number.base": "Input tahun harus berupa angka",
        "any.required": "Input tahun diperlukan",
    }),
    deskripsi: Joi.string().required().messages({
        "string.base": "Input deskripsi harus berupa string",
        "any.required": "Input deskripsi diperlukan",
    }),
    unit: Joi.string().required().messages({
        "string.base": "Input unit harus berupa string",
        "any.required": "Input unit diperlukan",
    }),
    quantity_1: Joi.number().required().messages({
        "number.base": "Input quantity harus berupa angka",
        "any.required": "Input quantity diperlukan",
    }),
    quantity_2: Joi.number().required().messages({
        "number.base": "Input quantity harus berupa angka",
        "any.required": "Input quantity diperlukan",
    }),
    harga_satuan: Joi.number().required().messages({
        "number.base": "Input harga satuan harus berupa angka",
        "any.required": "Input harga satuan diperlukan",
    }),
});

export const viewAllFundApplicationsSchema = Joi.object().keys({
    bulan: Joi.number()
        .options({ convert: false })
        .min(1)
        .max(12)
        .required()
        .messages({
            "number.base": "Input bulan harus berupa angka",
            "number.min": "Bulan pengajuan dana tidak valid",
            "number.max": "Bulan pengajuan dana tidak valid",
            "any.required": "Input bulan diperlukan",
        }),
    tahun: Joi.number()
        .options({ convert: false })
        .min(2000)
        .required()
        .messages({
            "number.base": "Input tahun harus berupa angka",
            "number.min": "Tahun pengajuan dana tidak valid",
            "any.required": "Input tahun diperlukan",
        }),
});

export const updateFundApplicationSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    deskripsi: Joi.string().messages({
        "string.base": "Input deskripsi harus berupa string",
    }),
    unit: Joi.string().messages({
        "string.base": "Input unit harus berupa string",
    }),
    quantity_1: Joi.number().messages({
        "number.base": "Input quantity harus berupa angka",
    }),
    quantity_2: Joi.number().messages({
        "number.base": "Input quantity harus berupa angka",
    }),
    harga_satuan: Joi.number().messages({
        "number.base": "Input harga satuan harus berupa angka",
    }),
});

export const deleteFundApplicationSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});
