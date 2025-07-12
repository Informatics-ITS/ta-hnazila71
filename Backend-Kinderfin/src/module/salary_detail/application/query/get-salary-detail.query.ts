import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";

async function getSalaryDetail(teacherId: string, tanggal: string) {
  const salaryDetail = await SalaryDetailRepository.getSalaryByTeacherAndDate(teacherId, tanggal) as Record<string, any>;

  if (!salaryDetail || Object.keys(salaryDetail).length === 0) {
    return { message: "Data salary tidak ditemukan" };
  }

  return {
    teacher_id: salaryDetail["teacher_id"] || "Unknown",
    nama_lengkap: salaryDetail["nama_lengkap"] || "Unknown",
    jabatan: salaryDetail["jabatan"] || "Unknown",
    tanggal: salaryDetail["tanggal"] || "Unknown",
    jam_masuk: salaryDetail["jam_masuk"] || null,
    jam_keluar: salaryDetail["jam_keluar"] || null,
    potongan_datang_telat: salaryDetail["potongan_datang_telat"] || 0,
    potongan_pulang_cepat: salaryDetail["potongan_pulang_cepat"] || 0,
    total_salary: salaryDetail["total_salary"] || 0,
    salary_components: {
      gaji1final: salaryDetail["gaji1final"] || 0,
      gaji2final: salaryDetail["gaji2final"] || 0,
      gaji3final: salaryDetail["gaji3final"] || 0,
      gaji4final: salaryDetail["gaji4final"] || 0,
      gaji5final: salaryDetail["gaji5final"] || 0,
      gaji6final: salaryDetail["gaji6final"] || 0,
      gaji7final: salaryDetail["gaji7final"] || 0,
      gaji8final: salaryDetail["gaji8final"] || 0,
      gaji9final: salaryDetail["gaji9final"] || 0,
      gaji10final: salaryDetail["gaji10final"] || 0,
    },
  };
}

export default getSalaryDetail;