import Joi from "joi";

export const addDaftarUlangSchema = Joi.object().keys({
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  biaya_perlengkapan: Joi.number().required().messages({
    "number.base": "Input biaya daftar ulang harus berupa number",
    "any.required": "Input biaya daftar ulang diperlukan",
  }),
  biaya_kegiatan: Joi.number().required().messages({
    "number.base": "Input biaya kegiatan harus berupa number",
    "any.required": "Input biaya kegiatan diperlukan",
  }),
  semester: Joi.string().valid("Ganjil", "Genap").required().messages({
    "string.base": "Input semester harus berupa string",
    "any.required": "Input semester diperlukan",
  }),
  tahun_ajaran: Joi.string().required().messages({
    "string.base": "Input tahun ajaran harus berupa string",
    "any.required": "Input tahun ajaran diperlukan",
  }),
  due_date: Joi.string().isoDate().required().messages({
    "string.base": "Input due date harus berupa string",
    "string.isoDate": "Input due date harus berformat iso",
    "any.required": "Input due date diperlukan",
  }),
});