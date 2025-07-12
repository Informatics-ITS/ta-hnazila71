import Joi from "joi";

export const addUserBillPaymentsSchema = Joi.object().keys({
  id_student_bill: Joi.string().required().messages({
    "string.base": "Input id student bill harus berupa string",
    "any.required": "Input id student bill diperlukan",
  }),
  amount_paid: Joi.number().required().messages({
    "number.base": "Input amount paid harus berupa number",
    "any.required": "Input amount paid diperlukan",
  }),
  payment_date: Joi.date().required().messages({
    "date.base": "Input payment date harus berupa date",
    "any.required": "Input payment date diperlukan",
  }),
  component_paid: Joi.string().required().messages({
    "string.base": "Input component paid harus berupa string",
    "any.required": "Input component paid diperlukan",
  }),
  id_payment_proof: Joi.string().required().messages({
    "string.base": "Input id payment proof harus berupa string",
    "any.required": "Input id payment proof diperlukan",
  }),
});

export const settleUserBillPaymentsSchema = Joi.object().keys({
  amount_paid: Joi.number().required().messages({
    "number.base": "Input amount paid harus berupa number",
    "any.required": "Input amount paid diperlukan",
  }),
  component_paid: Joi.string().required().messages({
    "string.base": "Input component paid harus berupa string",
    "any.required": "Input component paid diperlukan",
  }),
  id_student: Joi.string().required().messages({
    "string.base": "Input id student harus berupa string",
    "any.required": "Input id student diperlukan",
  }),
  id_student_bill: Joi.string().required().messages({
    "string.base": "Input id student bill harus berupa string",
    "any.required": "Input id student bill diperlukan",
  }),
  bukti_pembayaran: Joi.required().messages({
    "any.required": "Input bukti pembayaran diperlukan",
  }),
});