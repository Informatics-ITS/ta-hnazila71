import Joi from "joi";


export const addPemasukanSchema = Joi.object({
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  jenis_pemasukan: Joi.string().required().messages({
    "string.base": "Input jenis pemasukan harus berupa string",
    "any.required": "Input jenis pemasukan diperlukan",
  }),
  nominal: Joi.number().required().messages({
    "number.base": "Input nominal harus berupa number",
    "any.required": "Input nominal diperlukan",
  }),
  user_id: Joi.string().required().messages({
    "string.base": "Input user id harus berupa string",
    "any.required": "Input user id diperlukan",
  }),
});

export const updatePemasukanSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
  nama: Joi.string().messages({
    "string.base": "Input nama harus berupa string",
  }),
  jenis_pemasukan: Joi.string().messages({
    "string.base": "Input jenis pemasukan harus berupa string",
  }),
  nominal: Joi.number().messages({
    "number.base": "Input nominal harus berupa number",
  }),
  user_id: Joi.string().messages({
    "string.base": "Input user id harus berupa string",
    "any.required": "Input user id diperlukan",
  }),
});

export const deletePemasukanSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
});

export const getPemasukanSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
});