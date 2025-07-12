import { PengaturanGajiAktif } from "../../domain/entity/pengaturan_gaji_aktif.entity";

export class PengaturanGajiAktifRepository {
  
  async getAll(): Promise<{ field: string; label: string | null; type: string | null }[]> {
    try {
      const result = await PengaturanGajiAktif.findAll({
        attributes: ["field", "label", "type"],
        where: { aktif: true },
      });

      return result.map((item) => ({
        field: item.field,
        label: item.label ?? null,
        type: item.type ?? null,
      }));
    } catch (error) {
      console.error("[PengaturanGajiAktifRepository] Error getAll:", error);
      throw new Error("Gagal mengambil pengaturan gaji aktif.");
    }
  }

  
  async save(fields: { field: string; label?: string; type?: string }[]): Promise<void> {
    if (!Array.isArray(fields)) {
      throw new Error("Parameter 'fields' harus berupa array.");
    }

    if (fields.length === 0) {
      console.warn("[PengaturanGajiAktifRepository] Warning: No fields provided.");
      return;
    }

    try {
      await PengaturanGajiAktif.bulkCreate(
        fields.map((f) => ({
          field: f.field,
          label: f.label || null,
          type: f.type || null,
          aktif: true,
        })),
        {
          updateOnDuplicate: ["label", "type", "aktif"], 
        }
      );

      console.log("[PengaturanGajiAktifRepository] Pengaturan gaji aktif berhasil disimpan.");
    } catch (error) {
      console.error("[PengaturanGajiAktifRepository] Error save:", error);
      throw new Error("Gagal menyimpan pengaturan gaji aktif.");
    }
  }

  async deleteByField(field: string): Promise<void> {
    try {
      const deleted = await PengaturanGajiAktif.destroy({
        where: { field },
      });

      if (deleted === 0) {
        throw new Error(`Field '${field}' tidak ditemukan.`);
      }

      console.log(`[PengaturanGajiAktifRepository] Field '${field}' berhasil dihapus.`);
    } catch (error) {
      console.error("[PengaturanGajiAktifRepository] Error deleteByField:", error);
      throw new Error("Gagal menghapus pengaturan gaji aktif.");
    }
  }
}

export default new PengaturanGajiAktifRepository();
