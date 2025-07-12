import PDFDocument from "pdfkit";
import fs from "fs";

// Interface bisa tetap sama atau disederhanakan jika potongan tidak lagi relevan di bagian lain
interface RincianHarian {
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  potongan_datang_telat: number;
  potongan_pulang_cepat: number;
  potongan_tidak_hadir: number;
  potongan_tidak_absen: number;
  total_salary: number;
}

interface GuruGajiData {
  nama: string;
  nip: string;
  jabatan: string;
  periode: string;
  total_pokok: number;
  total_harian: number;
  total_gaji: number;
  rincian: RincianHarian[];
  total_bonus?: number;
  keterangan?: string;
}

export const generateFinalSalaryPDF = (
  hasilAkhir: GuruGajiData[],
  outputPath: string,
  finalTotal?: number
) => {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    stream.on("error", (err) => {
      console.error("Error menulis file PDF:", err);
      reject(new Error("Gagal menulis file PDF."));
    });

    const drawTableLine = (y: number, width: number) => {
      doc.moveTo(40, y).lineTo(40 + width, y).stroke();
    };

    hasilAkhir.forEach((item, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const calculatedTotalHarian = item.rincian?.reduce(
        (sum, rincian) => sum + (rincian.total_salary || 0),
        0
      ) || 0;

      doc.fontSize(12).text(`Nama         : ${item.nama}`);
      doc.fontSize(12).text(`NIP          : ${item.nip}`);
      doc.fontSize(12).text(`Jabatan      : ${item.jabatan}`);
      doc.fontSize(12).text(`Periode      : ${item.periode}`);
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Gaji Pokok   : Rp ${item.total_pokok.toLocaleString("id-ID")}`);
      doc.fontSize(12).text(`Gaji Harian  : Rp ${calculatedTotalHarian.toLocaleString("id-ID")}`);

      if (item.total_bonus && item.total_bonus > 0) {
        doc.fontSize(12).text(`Bonus        : Rp ${item.total_bonus.toLocaleString("id-ID")}`);
      }

      const totalGajiGuru = Number(item.total_pokok) + Number(calculatedTotalHarian) + Number(item.total_bonus || 0);
      doc.fontSize(12).text(`Total Gaji   : Rp ${totalGajiGuru.toLocaleString("id-ID")}`);

      if (item.keterangan) {
        doc.fontSize(12).text(`Keterangan   : ${item.keterangan}`);
      }

      doc.moveDown();

      if (item.rincian?.length > 0) {
        doc.fontSize(12).text("Rincian Rekap Absensi Harian:"); // Judul disederhanakan
        doc.moveDown(0.5);

        // --- PERUBAHAN UTAMA DIMULAI DI SINI ---

        // 1. Definisikan header dan lebar kolom yang baru (tanpa potongan)
        const headers = ["Tanggal", "Masuk", "Pulang", "Gaji Harian"];
        const colWidths = [120, 100, 100, 120]; // Lebar kolom disesuaikan untuk layout baru
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);
        const rowHeight = 25;

        let tableTop = doc.y;
        if (tableTop + (item.rincian.length + 1) * rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          tableTop = doc.y;
        }

        // 2. Gambar header tabel dengan posisi X yang eksplisit
        doc.fontSize(9).font('Helvetica-Bold');
        let currentX = 40; // Posisi X awal
        headers.forEach((header, i) => {
          doc.text(header, currentX, tableTop, { width: colWidths[i], align: 'center' });
          currentX += colWidths[i]; // Pindah ke posisi X untuk kolom berikutnya
        });

        drawTableLine(tableTop + rowHeight - 10, tableWidth); // Garis bawah header

        // 3. Gambar baris data dengan cara yang sama
        doc.font('Helvetica').fontSize(8);
        let y = tableTop + rowHeight;

        item.rincian.forEach((r) => {
          const formatTime = (time?: string) => (time && time !== "-" ? time : "-");
          const formatCurrency = (amount: number) => `Rp${(amount || 0).toLocaleString("id-ID")}`;

          // 4. Siapkan data sel sesuai kolom yang baru
          const cells = [
            r.tanggal,
            formatTime(r.jam_masuk),
            formatTime(r.jam_keluar),
            formatCurrency(r.total_salary)
          ];

          // Gambar setiap sel di posisi X-nya masing-masing
          let cellX = 40;
          cells.forEach((cell, i) => {
            // Menggunakan String() untuk memastikan tipe data teks
            doc.text(String(cell), cellX, y, { width: colWidths[i], align: 'center' });
            cellX += colWidths[i];
          });

          // Pindah ke posisi Y untuk baris berikutnya
          y += rowHeight;
          drawTableLine(y - 10, tableWidth); // Garis pemisah antar baris
        });

        // --- AKHIR DARI PERUBAHAN UTAMA ---
      }
      doc.moveDown(2);
    });

    if (finalTotal !== undefined && finalTotal > 0) {
      if (doc.y + 50 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
      }
      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text(`TOTAL KESELURUHAN GAJI: Rp ${finalTotal.toLocaleString("id-ID")}`, { align: 'right' });
    }

    doc.end();
    stream.on("finish", () => resolve());
  });
};