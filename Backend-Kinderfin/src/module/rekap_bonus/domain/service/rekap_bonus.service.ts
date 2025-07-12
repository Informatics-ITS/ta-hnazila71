import RekapBonusRepository from "../../infrastructure/repository/rekap_bonus.repository";

export class RekapBonusService {
  async createRekap(data: {
    tanggal: string;
    start_date: string;
    end_date: string;
    nip: string; // Menerima nip
    uang_tambahan?: number;
    keterangan?: string | null;
  }) {
    // Mengirim nip ke repository
    return await RekapBonusRepository.create(data);
  }

  async getRekapByNip(nip: string) { // Menerima nip
    // Mengirim nip ke repository
    return await RekapBonusRepository.findByNip(nip);
  }
}

export default new RekapBonusService();