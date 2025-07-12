import Joi from "joi";

export const inputBalanceSheetPostSchema = Joi.object().keys({
    tahun_pos_neraca: Joi.number().required().messages({
        "number.base": "Input tahun pos neraca harus berupa angka",
        "any.required": "Input tahun pos neraca diperlukan",
    }),
    saldo_tahun_lalu: Joi.number().required().messages({
        "number.base": "Input saldo tahun lalu harus berupa angka",
        "any.required": "Input saldo tahun lalu diperlukan",
    }),
    saldo_penerimaan_program_reguler: Joi.number().required().messages({
        "number.base":
            "Input saldo penerimaan program reguler harus berupa angka",
        "any.required": "Input saldo penerimaan program reguler diperlukan",
    }),
    saldo_kerja_sama: Joi.number().required().messages({
        "number.base": "Input saldo kerja sama harus berupa angka",
        "any.required": "Input saldo kerja sama diperlukan",
    }),
    piutang_usaha: Joi.number().required().messages({
        "number.base": "Input piutang usaha harus berupa angka",
        "any.required": "Input piutang usaha diperlukan",
    }),
    inventaris: Joi.number().required().messages({
        "number.base": "Input inventaris harus berupa angka",
        "any.required": "Input inventaris diperlukan",
    }),
    penyusutan_inventaris: Joi.number().required().messages({
        "number.base": "Input penyusutan inventaris harus berupa angka",
        "any.required": "Input penyusutan inventaris diperlukan",
    }),
    hutang_usaha: Joi.number().required().messages({
        "number.base": "Input hutang usaha harus berupa angka",
        "any.required": "Input hutang usaha diperlukan",
    }),
    hutang_bank: Joi.number().required().messages({
        "number.base": "Input hutang bank harus berupa angka",
        "any.required": "Input hutang bank diperlukan",
    }),
});

export const updateBalanceSheetPostSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    tahun_pos_neraca: Joi.number().messages({
        "number.base": "Input tahun pos neraca harus berupa angka",
    }),
    saldo_tahun_lalu: Joi.number().messages({
        "number.base": "Input saldo tahun lalu harus berupa angka",
    }),
    saldo_penerimaan_program_reguler: Joi.number().messages({
        "number.base":
            "Input saldo penerimaan program reguler harus berupa angka",
    }),
    saldo_kerja_sama: Joi.number().messages({
        "number.base": "Input saldo kerja sama harus berupa angka",
    }),
    piutang_usaha: Joi.number().messages({
        "number.base": "Input piutang usaha harus berupa angka",
    }),
    inventaris: Joi.number().messages({
        "number.base": "Input inventaris harus berupa angka",
    }),
    penyusutan_inventaris: Joi.number().messages({
        "number.base": "Input penyusutan inventaris harus berupa angka",
    }),
    hutang_usaha: Joi.number().messages({
        "number.base": "Input hutang usaha harus berupa angka",
    }),
    hutang_bank: Joi.number().messages({
        "number.base": "Input hutang bank harus berupa angka",
    }),
});
