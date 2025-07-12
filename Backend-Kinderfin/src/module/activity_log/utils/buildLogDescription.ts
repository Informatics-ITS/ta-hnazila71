export function buildLogDescription(action: string, detail?: string): string {
    switch (action) {
      case "UPLOAD_SALARY":
        return `Mengunggah file salary detail: ${detail}`;
      case "CREATE_JABATAN":
        return `Menambahkan jabatan baru: ${detail}`;
      case "UPDATE_JABATAN":
        return `Memperbarui jabatan: ${detail}`;
      case "DELETE_JABATAN":
        return `Menghapus jabatan: ${detail}`;
      case "UPLOAD_POTONGAN_KETERLAMBATAN":
        return `Mengunggah file potongan keterlambatan: ${detail}`;
      case "EDIT_SALARY":
        return `Mengedit data salary detail: ${detail}`;
      case "DELETE_SALARY":
        return `Menghapus data gaji harian: ${detail}`;
      default:
        return `${action}${detail ? `: ${detail}` : ""}`;
    }
  }