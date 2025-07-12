// nama_lengkap: string;
// tanggal_lahir: Date;
// alamat: string
// jenis_kelamin: Gender;
// status: string;
// grade: string;
// url_akta_kelahiran: string;
// url_kartu_keluarga: string;

import Joi from "joi";
import { SiswaProps } from "../../domain/entity";

export const addSiswaMapper = Joi.object().keys({
  nama_lengkap: Joi.string().required().messages({
    "string.base": "Input nama lengkap harus berupa string",
    "any.required": "Input nama lengkap diperlukan",
  }),
  tanggal_lahir: Joi.date().required().messages({
    "date.base": "Input tanggal lahir harus berupa date",
    "any.required": "Input tanggal lahir diperlukan",
  }),
  alamat: Joi.string().required().messages({
    "string.base": "Input alamat harus berupa string",
    "any.required": "Input alamat diperlukan",
  }),
  jenis_kelamin: Joi.string().required().messages({
    "string.base": "Input jenis kelamin harus berupa string",
    "any.required": "Input jenis kelamin diperlukan",
  }),
  // status: Joi.string().required().messages({
  //   "string.base": "Input status harus berupa string",
  //   "any.required": "Input status diperlukan",
  // }),
  // grade: Joi.string().required().messages({
  //   "string.base": "Input grade harus berupa string",
  //   "any.required": "Input grade diperlukan",
  // }),
  akta_kelahiran: Joi.required().messages({
    "string.base": "Input url akta kelahiran harus berupa string",
    "any.required": "Input url akta kelahiran diperlukan",
  }),
  kartu_keluarga: Joi.required().messages({
    "string.base": "Input url kartu keluarga harus berupa string",
    "any.required": "Input url kartu keluarga diperlukan",
  }),
  id_orang_tua: Joi.string().required().messages({
    "string.base": "Input id orang tua harus berupa string",
    "any.required": "Input id orang tua diperlukan",
  }),
});

//get all siswa mapper (withou pagination /)
// tambahkan kode disini
export const getAllSiswaMapper = (siswas: any[]): SiswaProps[] => {
  return siswas.map((siswa) => {
    return {
      nama_lengkap: siswa.nama_lengkap,
      tanggal_lahir: siswa.tanggal_lahir,
      alamat: siswa.alamat,
      jenis_kelamin: siswa.jenis_kelamin,
      status: siswa.status,
      grade: siswa.grade,
      url_akta_kelahiran: siswa.url_akta_kelahiran,
      url_kartu_keluarga: siswa.url_kartu_keluarga,
    } as SiswaProps;
  });
};
