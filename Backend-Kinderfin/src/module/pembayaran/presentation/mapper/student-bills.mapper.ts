import Joi from "joi";

export const addStudentBillsSchema = Joi.object().keys({
  id_student: Joi.string().required().messages({
    "string.base": "Input id student harus berupa string",
    "any.required": "Input id student diperlukan",
  }),
  id_tagihan: Joi.string().required().messages({
    "string.base": "Input id tagihan harus berupa string",
    "any.required": "Input id tagihan diperlukan",
  }),
  id_discount: Joi.string().required().messages({
    "string.base": "Input id discount harus berupa string",
    "any.required": "Input id discount diperlukan",
  }),
  total_paid: Joi.number().required().messages({
    "number.base": "Input total paid harus berupa number",
    "any.required": "Input total paid diperlukan",
  }),
  remaining_amount: Joi.number().required().messages({
    "number.base": "Input remaining amount harus berupa number",
    "any.required": "Input remaining amount diperlukan",
  }),
  payment_status: Joi.string().required().messages({
    "string.base": "Input payment status harus berupa string",
    "any.required": "Input payment status diperlukan",
  }),
});