export enum DefaultMessage {
    SUC_ADD = "Berhasil menambahkan data baru",
    SUC_UPDT = "Berhasil memperbarui data",
    SUC_DEL = "Berhasil menghapus data",
    SUC_AGET = "Berhasil mendapatkan semua data",
    SUC_GET = "Berhasil mendapatkan data",

    ERR_ADD = "Gagal menambahkan data baru",
    ERR_UPDT = "Gagal memperbarui data",
    ERR_DEL = "Gagal menghapus data",
    ERR_AGET = "Gagal mendapatkan semua data",
    ERR_GET = "Gagal mendapatkan data",

    ERR_AUTH_TOKEN = "User belum memiliki token login",
    ERR_INVALID_TOKEN = "Token login tidak sesuai",
    ERR_AUTH_ROLE = "User tidak memiliki akses pada aksi ini",
    ERR_INVALID_FILE_FORMAT = "Ekstensi file harus bertipe '.png', '.jpg', or '.jpeg'",
    ERR_INVALID_FILE_SIZE = "Ukuran file tidak dapat lebih dari 1MB",
}
