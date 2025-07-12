import Joi from "joi";

export const uploadPaymentProofSchema = Joi.object().keys({
    nomor_pendaftaran: Joi.string().messages({
        "string.base": "Input nomor pendaftaran harus berupa string",
    }),
    tanggal_daftar: Joi.string().isoDate().required().messages({
        "string.base": "Input tanggal daftar harus berupa string",
        "string.isoDate": "Input tanggal daftar harus berformat iso",
        "any.required": "Input tanggal daftar diperlukan",
    }),
    nama_lengkap: Joi.string().required().messages({
        "string.base": "Input nama lengkap harus berupa string",
        "any.required": "Input nama lengkap diperlukan",
    }),
    jenis_pembayaran: Joi.string().required().messages({
        "string.base": "Input jenis pembayaran harus berupa string",
        "any.required": "Input jenis pembayaran diperlukan",
    }),
    nrp: Joi.string().messages({
        "string.base": "Input nrp harus berupa string",
    }),
    email: Joi.string().required().messages({
        "string.base": "Input email harus berupa string",
        "any.required": "Input email diperlukan",
    }),
    nomor_telepon: Joi.string().required().messages({
        "string.base": "Input nomor telepon harus berupa string",
        "any.required": "Input nomor telepon diperlukan",
    }),
    bukti_pembayaran: Joi.required().messages({
        "any.required": "Input bukti pembayaran diperlukan",
    }),
});

export const updatePaymentProofSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    nomor_pendaftaran: Joi.string().messages({
        "string.base": "Input nomor pendaftaran harus berupa string",
    }),
    tanggal_daftar: Joi.string().isoDate().messages({
        "string.base": "Input tanggal daftar harus berupa string",
        "string.isoDate": "Input tanggal daftar harus berformat iso",
    }),
    nama_lengkap: Joi.string().messages({
        "string.base": "Input nama lengkap harus berupa string",
    }),
    jenis_pembayaran: Joi.string().messages({
        "string.base": "Input jenis pembayaran harus berupa string",
    }),
    nrp: Joi.string().messages({
        "string.base": "Input nrp harus berupa string",
    }),
    email: Joi.string().messages({
        "string.base": "Input email harus berupa string",
    }),
    nomor_telepon: Joi.string().messages({
        "string.base": "Input nomor telepon harus berupa string",
    }),
    bukti_pembayaran: Joi.optional(),
});

export const deletePaymentProofSchema = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});
