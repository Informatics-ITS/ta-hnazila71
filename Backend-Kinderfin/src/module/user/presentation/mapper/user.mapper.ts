import Joi from "joi";

export const addUserMapper = Joi.object().keys({
    nip: Joi.string().required().messages({
        "string.base": "Input nip harus berupa string",
        "any.required": "Input nip diperlukan",
    }),
    nama_lengkap: Joi.string().required().messages({
        "string.base": "Input nama lengkap harus berupa string",
        "any.required": "Input nama lengkap diperlukan",
    }),
    email: Joi.string().required().messages({
        "string.base": "Input email harus berupa string",
        "any.required": "Input email diperlukan",
    }),
    password: Joi.string()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$"))
        .required()
        .messages({
            "string.pattern.base": "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol serta minimal 8 karakter",
            "string.base": "Input password harus berupa string",
            "any.required": "Input password diperlukan",
        }),
    nama_bank: Joi.string().required().messages({
        "string.base": "Input nama bank harus berupa string",
        "any.required": "Input nama bank diperlukan",
    }),
    pemilik_rekening: Joi.string().required().messages({
        "string.base": "Input pemilik rekening harus berupa string",
        "any.required": "Input pemilik rekening diperlukan",
    }),
    nomor_rekening: Joi.string().required().messages({
        "string.base": "Input nomor rekening harus berupa string",
        "any.required": "Input nomor rekening diperlukan",
    }),
    role: Joi.string().messages({
        "string.base": "Input role user harus berupa string",
    }),
});

export const resetPasswordMapper = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    newPassword: Joi.string()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$"))
        .required()
        .messages({
            "string.pattern.base": "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol serta minimal 8 karakter",
            "string.base": "Input password baru harus berupa string",
            "any.required": "Input password baru diperlukan",
        }),
});

export const addGuruMapper = Joi.object().keys({
    nip: Joi.string().messages({
        "string.base": "Input nip harus berupa string",
    }),
    jabatan: Joi.string().messages({
        "string.base": "Input jabatan harus berupa string",
    }),
    nama_lengkap: Joi.string().required().messages({
        "string.base": "Input nama lengkap harus berupa string",
        "any.required": "Input nama lengkap diperlukan",
    }),
    email: Joi.string().required().messages({
        "string.base": "Input email harus berupa string",
        "any.required": "Input email diperlukan",
    }),
    password: Joi.string().required().messages({
        "string.base": "Input password harus berupa string",
        "any.required": "Input password diperlukan",
    }),
    nama_bank: Joi.string().required().messages({
        "string.base": "Input nama bank harus berupa string",
        "any.required": "Input nama bank diperlukan",
    }),
    pemilik_rekening: Joi.string().required().messages({
        "string.base": "Input pemilik rekening harus berupa string",
        "any.required": "Input pemilik rekening diperlukan",
    }),
    nomor_rekening: Joi.string().required().messages({
        "string.base": "Input nomor rekening harus berupa string",
        "any.required": "Input nomor rekening diperlukan",
    }),
    role: Joi.string().messages({
        "string.base": "Input role user harus berupa string",
    }),
});

export const addOrangTuaMapper = Joi.object().keys({
    ayah: Joi.string().required().messages({
        "string.base": "Input nama ayah harus berupa string",
        "any.required": "Input nama ayah diperlukan",
    }),
    ibu: Joi.string().required().messages({
        "string.base": "Input nama ibu harus berupa string",
        "any.required": "Input nama ibu diperlukan",
    }),
    pekerjaan_ayah: Joi.string().required().messages({
        "string.base": "Input pekerjaan ayah harus berupa string",
        "any.required": "Input pekerjaan ayah diperlukan",
    }),
    pekerjaan_ibu: Joi.string().required().messages({
        "string.base": "Input pekerjaan ibu harus berupa string",
        "any.required": "Input pekerjaan ibu diperlukan",
    }),
    alamat: Joi.string().required().messages({
        "string.base": "Input alamat harus berupa string",
        "any.required": "Input alamat diperlukan",
    }),
    no_telepon: Joi.string().required().messages({
        "string.base": "Input no telepon harus berupa string",
        "any.required": "Input no telepon diperlukan",
    }),
    email: Joi.string().required().messages({
        "string.base": "Input email harus berupa string",
        "any.required": "Input email diperlukan",
    }),
    password: Joi.string().required().messages({
        "string.base": "Input password harus berupa string",
        "any.required": "Input password diperlukan",
    }),
    role: Joi.string().messages({
        "string.base": "Input role user harus berupa string",
        "any.required": "Input role user diperlukan",
    }),
});

export const loginMapper = Joi.object().keys({
    email: Joi.string().required().messages({
        "string.base": "Input email harus berupa string",
        "any.required": "Input email diperlukan",
    }),
    password: Joi.string().required().messages({
        "string.base": "Input password harus berupa string",
        "any.required": "Input password diperlukan",
    }),
});

export const logoutMapper = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});

export const getUserProfileMapper = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});

export const updateUserMapper = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    nip: Joi.string().messages({
        "string.base": "Input nip harus berupa string",
    }),
    nama_lengkap: Joi.string().messages({
        "string.base": "Input nama lengkap harus berupa string",
    }),
    email: Joi.string().messages({
        "string.base": "Input email harus berupa string",
    }),
    password: Joi.string().messages({
        "string.base": "Input password harus berupa string",
    }),
    nama_bank: Joi.string().messages({
        "string.base": "Input nama bank harus berupa string",
    }),
    pemilik_rekening: Joi.string().messages({
        "string.base": "Input pemilik rekening harus berupa string",
    }),
    nomor_rekening: Joi.string().messages({
        "string.base": "Input nomor rekening harus berupa string",
    }),
    role: Joi.string().messages({
        "string.base": "Input role user harus berupa string",
    }),
});

export const deleteUserMapper = Joi.object().keys({
    id: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
    selfId: Joi.string().length(36).required().messages({
        "string.base": "Input id harus berupa string",
        "string.length": "Input id harus bertipe uuid",
        "any.required": "Input id diperlukan",
    }),
});
