import Joi from "joi";
import { PPDBProps } from "../../domain/entity";

// id?: AggregateId;
// user_id?: string;
// nama_lengkap?: string;
// tanggal_lahir?: Date;
// jenis_kelamin?: string;
// alamat?: string;
// kelas?: string;
// url_file_akta?: string;
// url_file_kk?: string;
// status?: string;

export const addPPDBMapper = Joi.object().keys({
  nik: Joi.string().required().messages({
    "string.base": "Input nik harus berupa string",
    "any.required": "Input nik diperlukan",
  }),
  nama_lengkap: Joi.string().required().messages({
    "string.base": "Input nama lengkap harus berupa string",
    "any.required": "Input nama lengkap diperlukan",
  }),
  tanggal_lahir: Joi.date().required().messages({
    "date.base": "Input tanggal lahir harus berupa date",
    "any.required": "Input tanggal lahir diperlukan",
  }),
  tempat_lahir: Joi.string().required().messages({
    "string.base": "Input tempat lahir harus berupa string",
    "any.required": "Input tempat lahir diperlukan",
  }),
  alamat: Joi.string().required().messages({
    "string.base": "Input alamat harus berupa string",
    "any.required": "Input alamat diperlukan",
  }),
  jenis_kelamin: Joi.string().required().messages({
    "string.base": "Input jenis kelamin harus berupa string",
    "any.required": "Input jenis kelamin diperlukan",
  }),
  akta_kelahiran: Joi.required().messages({
    "string.base": "Input url akta kelahiran harus berupa string",
    "any.required": "Input url akta kelahiran diperlukan",
  }),
  kartu_keluarga: Joi.required().messages({
    "string.base": "Input url kartu keluarga harus berupa string",
    "any.required": "Input url kartu keluarga diperlukan",
  }),
  status: Joi.string().required().messages({
    "string.base": "Input status harus berupa string",
    "any.required": "Input status diperlukan",
  }),
  kelas: Joi.string().required().messages({
    "string.base": "Input kelas harus berupa string",
    "any.required": "Input kelas diperlukan",
  }),
  user_id: Joi.string().required().messages({
    "string.base": "Input id orang tua harus berupa string",
    "any.required": "Input id orang tua diperlukan",
  }),
  tahun_ajaran: Joi.string().required().messages({
    "string.base": "Input tahun ajaran harus berupa string",
    "any.required": "Input tahun ajaran diperlukan",
  }),
});