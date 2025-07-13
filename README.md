# 🏁 Tugas Akhir (TA) - Final Project

**Nama Mahasiswa**: Yusuf Hasan Nazila  
**NRP**: 5025211225  
**Judul TA**: PENGEMBANGAN MODUL PAYROLL: INTEGRASI FINGERPRINT DAN OTOMASI PENGHITUNGAN GAJI BERBASIS JABATAN DENGAN KINDERFIN  
**Dosen Pembimbing**: Ir. Adhatus Solichah Ahmadiyah, S.Kom., M.Sc.  
**Dosen Ko-pembimbing**: Dr. Kelly Rossa Sungkono

---

## 📺 Demo Aplikasi

[![Video Demo](https://img.youtube.com/vi/TPoUJPFR684/maxresdefault.jpg)](https://youtu.be/TPoUJPFR684)

---

## 🛠 Panduan Instalasi & Menjalankan Software

### Prasyarat

- **Node.js**: Versi `v18` atau yang lebih baru.
- **Yarn**: Untuk manajemen paket di frontend.
- **Database**: PostgreSQL.

### Langkah-langkah

1.  **Clone Repository**
    ```bash
    git clone https://github.com/Informatics-ITS/ta-hnazila71.git
    cd ta-hnazila71
    ```
2.  **Konfigurasi Lingkungan (.env)**
    - **Backend**: Masuk ke folder `Backend-Kinderfin`, salin `.env.example` menjadi `.env`, lalu isi:
    ```env
    SERVER_PORT=9001
    APP_ENV=development

    DB_HOST=
    DB_PORT=
    DB_USER=
    DB_PASS=
    DB_NAME=

    JWT_SECRET_KEY=p
    JWT_ISSUER=
    IMAGEKIT_PUBLIC_KEY=
    IMAGEKIT_PRIVATE_KEY=
    IMAGEKIT_URL_ENDPOINT=
    ```
    - **Frontend**: Masuk ke folder `Frontend-Kinderfin`, salin `.env.example` menjadi `.env`, lalu isi:
    ```env
    NEXT_PUBLIC_API_URL=
    NEXT_PUBLIC_API_VERSION=v1
    ```
    - **Untuk database lokal**: Buat database PostgreSQL terlebih dahulu, kemudian sesuaikan konfigurasi DB di file `.env`
    - **Isikan variabel yang kosong** (dapat hubungi saya untuk mendapatkan konfigurasi yang diperlukan).
3.  **Setup & Jalankan Backend**
    ```bash
    cd Backend-Kinderfin
    npm install
    npm run build
    npm start
    ```
    > **Catatan**:
    - Jalankan perintah `npm run build` beberapa kali untuk mengirimkan seeder data yang tersedia ke database.
      
    ### Panduan Konfigurasi CORS: Backend
    
    Dokumen ini menjelaskan cara mengubah konfigurasi CORS di file `Backend-Kinderfin/src/server.ts` untuk beralih antara lingkungan pengembangan (lokal) dan produksi (Vercel).
    
    ---
    
    #### **File Path**
    * `Backend-Kinderfin/src/server.ts`
    
    ---
    
    #### **Konfigurasi yang Diperlukan**
    
    Ubah objek `corsOptions` di dalam file tersebut sesuai dengan lingkungan yang Anda tuju.
    
    #### **1. Untuk Lokal**
    Pastikan hanya `origin` untuk `localhost` yang aktif.
    
    ``` typescript
    // ... kode lainnya
    const corsOptions = {
        sesuaikan dengan deploy frontend // origin: '[https://fe-kinderfin-new2-oinx.vercel.app](https://fe-kinderfin-new2-oinx.vercel.app)', 
        origin: 'http://localhost:3001', 
        credentials: true,
    };
    // ... kode lainnya
    ```
    ### Panduan Konfigurasi CORS: Frontend
    
    Dokumen ini menjelaskan cara mengubah konfigurasi CORS di file `Frontend-Kinderfin/utils/index.tsx` untuk beralih antara lingkungan pengembangan (lokal) dan produksi (Vercel).
    
    ---
    
    #### **File Path**
    * `Frontend-Kinderfin/utils/index.tsx`
    
    ---
    
    #### **Konfigurasi yang Diperlukan**
    
    Ubah objek `corsOptions` di dalam file tersebut sesuai dengan lingkungan yang Anda tuju.
    
    #### **1. Untuk Lokal**
    Pastikan hanya `origin` untuk `localhost` yang aktif.
    
    ``` typescript
    public static backend_base = 'https://backend-kinderfin.onrender.com/';
     public static backend_base = 'http://localhost:3000/';
    ```
    
    

4.  **Setup & Jalankan Frontend**
    - Buka terminal **baru**, lalu jalankan:
    ```bash
    cd Frontend-Kinderfin
    npm install -g yarn@berry
    yarn
    npm run dev
    ```
5.  **Akses Aplikasi**
    - **Frontend**: Buka browser dan kunjungi: `http://localhost:3001`
    - **Backend**: API tersedia di: `http://localhost:3000`

---

## 📚 Dokumentasi Tambahan

- Backend ` https://backend-kinderfin.onrender.com/`
- Frontend `https://fe-kinderfin-new2-oinx.vercel.app`

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
