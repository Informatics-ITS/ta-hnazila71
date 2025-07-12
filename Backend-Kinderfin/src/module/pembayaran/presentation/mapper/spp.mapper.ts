import Joi from "joi";

export const addSPPBillSchema = Joi.object().keys({
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  biaya_spp: Joi.number().required().messages({
    "number.base": "Input biaya spp harus berupa number",
    "any.required": "Input biaya spp diperlukan",
  }),
  biaya_komite: Joi.number().required().messages({
    "number.base": "Input biaya komite harus berupa number",
    "any.required": "Input biaya komite diperlukan",
  }),
  biaya_ekstrakulikuler: Joi.number().required().messages({
    "number.base": "Input biaya ekstrakulikuler harus berupa number",
    "any.required": "Input biaya ekstrakulikuler diperlukan",
  }),
  bulan: Joi.string().required().messages({
    "string.base": "Input bulan harus berupa string",
    "any.required": "Input bulan diperlukan",
  }),
  tahun_ajaran: Joi.string().required().messages({
    "string.base": "Input tahun ajaran harus berupa string",
    "any.required": "Input tahun ajaran diperlukan",
  }),
  // total_amount: Joi.number().required().messages({
  //   "number.base": "Input total amount harus berupa number",
  //   "any.required": "Input total amount diperlukan",
  // }),
  due_date: Joi.string().isoDate().required().messages({
    "string.base": "Input due date harus berupa string",
    "string.isoDate": "Input due date harus berformat iso",
    "any.required": "Input due date diperlukan",
  }),
});

export const editSPPBillSchema = Joi.object().keys({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  biaya_spp: Joi.number().required().messages({
    "number.base": "Input biaya spp harus berupa number",
    "any.required": "Input biaya spp diperlukan",
  }),
  biaya_komite: Joi.number().required().messages({
    "number.base": "Input biaya komite harus berupa number",
    "any.required": "Input biaya komite diperlukan",
  }),
  biaya_ekstrakulikuler: Joi.number().required().messages({
    "number.base": "Input biaya ekstrakulikuler harus berupa number",
    "any.required": "Input biaya ekstrakulikuler diperlukan",
  }),
  bulan: Joi.string().required().messages({
    "string.base": "Input bulan harus berupa string",
    "any.required": "Input bulan diperlukan",
  }),
  tahun_ajaran: Joi.string().required().messages({
    "string.base": "Input tahun ajaran harus berupa string",
    "any.required": "Input tahun ajaran diperlukan",
  }),
  // total_amount: Joi.number().required().messages({
  //   "number.base": "Input total amount harus berupa number",
  //   "any.required": "Input total amount diperlukan",
  // }),
  due_date: Joi.string().isoDate().required().messages({
    "string.base": "Input due date harus berupa string",
    "string.isoDate": "Input due date harus berformat iso",
    "any.required": "Input due date diperlukan",
  }),
});

