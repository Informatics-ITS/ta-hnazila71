import Joi from "joi";

export const addDiscountSchema = Joi.object().keys({
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  persentase: Joi.number().required().messages({
    "number.base": "Input persentase harus berupa number",
    "any.required": "Input persentase diperlukan",
  }),
});

export const editDiscountSchema = Joi.object().keys({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
  nama: Joi.string().required().messages({
    "string.base": "Input nama harus berupa string",
    "any.required": "Input nama diperlukan",
  }),
  persentase: Joi.number().required().messages({
    "number.base": "Input persentase harus berupa number",
    "any.required": "Input persentase diperlukan",
  }),
});

export const deleteDiscountSchema = Joi.object().keys({
  id: Joi.string().required().messages({
    "string.base": "Input id harus berupa string",
    "any.required": "Input id diperlukan",
  }),
});