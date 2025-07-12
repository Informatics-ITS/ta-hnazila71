# 🏁 Tugas Akhir (TA) - Final Project

**Nama Mahasiswa**: Yusuf Hasan Nazila  
**NRP**: 5025211225  
**Judul TA**: PENGEMBANGAN MODUL PAYROLL: INTEGRASI FINGERPRINT DAN OTOMASI PENGHITUNGAN GAJI BERBASIS JABATAN DENGAN KINDERFIN  
**Dosen Pembimbing**: Ir. Adhatus Solichah Ahmadiyah, S.Kom., M.Sc.  
**Dosen Ko-pembimbing**: Dr. Kelly Rossa Sungkono

---

## 📺 Demo Aplikasi
*Video demo dapat disematkan di sini jika sudah tersedia.*

---

## 🛠 Panduan Instalasi & Menjalankan Software

### Prasyarat
- **Node.js**: Versi `v18` atau yang lebih baru.
- **Yarn**: Untuk manajemen paket di frontend.
- **Database**: PostgreSQL.

### Langkah-langkah

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/Informatics-ITS/ta-hnazila71.git](https://github.com/Informatics-ITS/ta-hnazila71.git)
    cd ta-hnazila71
    ```

2.  **Instalasi Dependensi Backend**
    ```bash
    cd Backend-Kinderfin
    npm install
    ```

3.  **Instalasi Dependensi Frontend**
    ```bash
    cd ../Frontend-Kinderfin
    yarn install
    ```

4.  **Konfigurasi Lingkungan (.env)**
    - Masuk ke folder `Backend-Kinderfin`.
    - Salin atau ubah nama file `.env.example` menjadi `.env`.
    - Isi variabel lingkungan yang diperlukan, terutama untuk koneksi database PostgreSQL.

5.  **Migrasi Database**
    - Pastikan Anda berada di dalam folder `Backend-Kinderfin`.
    ```bash
    npm run migrate
    ```

6.  **Jalankan Aplikasi**
    - **Backend**: Buka satu terminal, masuk ke folder `Backend-Kinderfin`, lalu jalankan:
      ```bash
      npm run dev
      ```
    - **Frontend**: Buka terminal **baru**, masuk ke folder `Frontend-Kinderfin`, lalu jalankan:
      ```bash
      yarn dev
      ```

7.  Buka browser dan kunjungi: `http://localhost:3000` (atau port lain yang ditampilkan oleh terminal frontend).

---

## 📚 Dokumentasi Tambahan

- Anda dapat menambahkan link ke dokumentasi API, diagram arsitektur, atau skema basis data di sini.

---

## ✅ Validasi

Pastikan proyek memenuhi kriteria berikut sebelum submit:
- Source code dapat di-build/run tanpa error.
- Video demo jelas menampilkan fitur utama.
- README lengkap dan terupdate.
- Tidak ada data sensitif (password, API key) yang terekspos di dalam kode.

---

## ⁉️ Pertanyaan?

Hubungi:
- **Penulis**: 5025211225@student.its.ac.id
- **Pembimbing Utama**: adhatus@its.ac.id
- **Ko-pembimbing**: kelly@its.ac.id
