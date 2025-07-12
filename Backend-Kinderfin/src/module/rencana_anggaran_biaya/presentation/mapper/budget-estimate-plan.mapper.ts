import Joi from "joi";

export const generateBudgetEstimatePlansSchema = Joi.object().keys({
    tahun: Joi.number().required().messages({
        "number.base": "Input tahun harus berupa angka",
        "any.required": "Input tahun diperlukan",
    }),
});
