import { CreateRekapBonusCommand } from "../../application/command/rekap_bonus.command";
import RekapBonusQuery from "../../application/query/rekap_bonus.query";
import { Request, Response } from "express";

export class RekapBonusController {
  async create(req: Request, res: Response) {
    try {
      // Menerima nip dari body request
      const { start_date, end_date, nip, uang_tambahan, keterangan } = req.body;

      if (!start_date || !end_date || !nip) {
        return res.status(400).json({ error: "start_date, end_date, dan nip wajib diisi" });
      }

      const createRekapBonusCommand = new CreateRekapBonusCommand();
      await createRekapBonusCommand.execute({
        start_date,
        end_date,
        nip, // Mengirim nip ke command
        uang_tambahan,
        keterangan
      });

      res.status(201).json({ message: "Rekap bonus berhasil dibuat" });
    } catch (error) {
      res.status(500).json({
        error: "Terjadi kesalahan saat membuat rekap bonus",
        detail: (error as Error).message
      });
    }
  }

  async getByNip(req: Request, res: Response) {
    // Menerima nip dari parameter URL
    const nip = req.params.nip?.trim(); // Mengubah 'teacherId' menjadi 'nip' untuk konsistensi

    try {
      if (!nip) {
        return res.status(400).json({ error: "NIP tidak boleh kosong" }); // Menyesuaikan pesan error
      }

      // Mengirim nip ke query
      const data = await RekapBonusQuery.GetRekapBonusByNipQuery.execute(nip);

      if (!data || data.length === 0) {
        return res.status(404).json({ message: `Data rekap bonus untuk NIP '${nip}' tidak ditemukan` });
      }

      res.status(200).json({
        message: "Data rekap bonus ditemukan",
        data
      });
    } catch (error) {
      res.status(500).json({
        error: "Terjadi kesalahan saat mengambil data rekap bonus",
        detail: (error as Error).message
      });
    }
  }
}

export default new RekapBonusController();