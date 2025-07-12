import Joi from "joi";

export const reportFundUsageSchema = Joi.object().keys({
    aktivitas: Joi.string().required().messages({
        "string.base": "Input aktivitas harus berupa string",
        "any.required": "Input aktivitas diperlukan",
    }),
    tanggal: Joi.string().isoDate().required().messages({
        "string.base": "Input tanggal harus berupa string",
        "string.isoDate": "Input tanggal harus berformat iso",
        "any.required": "Input tanggal diperlukan",
    }),
    penerima: Joi.string().required().messages({
        "string.base": "Input penerima harus berupa string",
        "any.required": "Input penerima diperlukan",
    }),
    sub_aktivitas: Joi.string().required().messages({
        "string.base": "Input sub aktivitas harus berupa string",
        "any.required": "Input sub aktivitas diperlukan",
    }),
    uraian: Joi.string().required().messages({
        "string.base": "Input uraian harus berupa string",
        "any.required": "Input uraian diperlukan",
    }),
    jumlah: Joi.number().required().messages({
        "number.base": "Input jumlah harus berupa angka",
        "any.required": "Input jumlah diperlukan",
    }),
});

export const viewAllFundUsagesSchema = Joi.object().keys({
    bulan: Joi.number()
        .options({ convert: false })
        .min(1)
        .max(12)
        .required()
        .messages({
            "number.base": "Input bulan harus berupa angka",
            "number.min": "Bulan penggunaan dana tidak valid",
            "number.max": "Bulan penggunaan dana tidak valid",
            "any.required": "Input bulan diperlukan",
        }),
    tahun: Joi.number()
        .options({ convert: false })
        .min(2000)
        .required()
        .messages({
            "number.base": "Input tahun harus berupa angka",
            "number.min": "Tahun penggunaan dana tidak valid",
            "any.required": "Input tahun diperlukan",
        }),
});

export const updateFundUsageSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    aktivitas: Joi.string().messages({
        "string.base": "Input aktivitas harus berupa string",
    }),
    tanggal: Joi.string().isoDate().messages({
        "string.base": "Input tanggal harus berupa string",
        "string.isoDate": "Input tanggal harus berformat iso",
    }),
    penerima: Joi.string().messages({
        "string.base": "Input penerima harus berupa string",
    }),
    sub_aktivitas: Joi.string().messages({
        "string.base": "Input sub aktivitas harus berupa string",
    }),
    uraian: Joi.string().messages({
        "string.base": "Input uraian harus berupa string",
    }),
    jumlah: Joi.number().messages({
        "number.base": "Input jumlah harus berupa angka",
    }),
});

export const deleteFundUsageSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});
