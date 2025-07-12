import RekapBonusService from "../../domain/service/rekap_bonus.service";

export class CreateRekapBonusCommand {
  async execute(data: {
    start_date: string;
    end_date: string;
    nip: string; // Menerima nip
    uang_tambahan?: number;
    keterangan?: string | null;
  }) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Start date atau end date tidak valid.");
    }

    if (start > end) {
      throw new Error("Start date tidak boleh setelah end date.");
    }

    // Melakukan loop untuk setiap hari dalam rentang tanggal
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const tanggal = d.toISOString().slice(0, 10);

      await RekapBonusService.createRekap({
        tanggal: tanggal,
        start_date: data.start_date,
        end_date: data.end_date,
        nip: data.nip, // Mengirim nip ke service
        uang_tambahan: data.uang_tambahan ?? 0,
        keterangan: data.keterangan ?? null
      });
    }
  }
}