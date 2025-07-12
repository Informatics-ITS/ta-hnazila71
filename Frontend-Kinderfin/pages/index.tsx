import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Utils from '../utils';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

type Role = 'Bendahara' | 'Kepala Sekolah' | 'Orang Tua' | 'Sekretaris' | 'Admin' | 'Unauthorized' | 'Guru';

interface DashboardViewProps {
  role: Role;
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('Unauthorized');
  const [isLoading, setIsLoading] = useState(true);
  const [roleApps, setRoleApps] = useState<{ title: string; description: string; icon: string; link: string }[]>([]);  

  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  const applications: { [key in Role]: { title: string; description: string; icon: string; link: string; }[] } = {
    Bendahara: [
      { title: 'PPDB', description: 'Deskripsi Aplikasi', icon: '/icons/ppdb.png', link: '/ppdb' },
      { title: 'Daftar Ulang', description: 'Deskripsi Aplikasi', icon: '/icons/daftar-ulang.png', link: '/daftar_ulang' },
      { title: 'SPP, Komite dan Ekskul', description: 'Deskripsi Aplikasi', icon: '/icons/spp.png', link: '/spp_komite_ekstrakurikuler' },
      // { title: 'Gaji Pegawai', description: 'Deskripsi Aplikasi', icon: '/icons/gaji.png', link: '/gaji' },
      { title: 'Pengeluaran Rumah Tangga', description: 'Deskripsi Aplikasi', icon: '/icons/pengeluaran.png', link: '/pengeluaran_rumah_tangga' },
      { title: 'Pengaturan Gaji Aktif', description: 'Aktif/Nonaktifkan fitur Gaji', icon: '/icons/atur_gaji.png', link: '/pengaturan_gaji' },
      { title: 'Master Jabatan', description: 'Kelola jabatan & gaji', icon: '/icons/jabatan.png', link: '/master_jabatan' },
      { title: 'Potongan Gaji', description: 'Kelola Potongan Gaji', icon: '/icons/potongan.png', link: '/potongan_keterlambatan' }, 
      { title: 'Rekap Gaji Pegawai', description: 'Lihat detail gaji per pegawai', icon: '/icons/gaji2.png', link: '/salary_detail' },
      { title: 'Log Activitas', description: 'Riwayat Aktivitas', icon: '/icons/riwayat.png', link: '/activity_log' },
      { title: 'Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/pengajuan.png', link: '/pengajuan_perubahan_gaji/daftar' },
      { title: 'Form Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/form_pengajuan.png', link: '/pengajuan_perubahan_gaji/form' },
    ],
    'Kepala Sekolah': [
      { title: 'PPDB', description: 'Deskripsi Aplikasi', icon: '/icons/ppdb.png', link: '/ppdb' },
      { title: 'SPP, Komite dan Ekskul', description: 'Deskripsi Aplikasi', icon: '/icons/spp.png', link: '/spp_komite_ekstrakurikuler' },
      { title: 'Pengeluaran Rumah Tangga', description: 'Deskripsi Aplikasi', icon: '/icons/pengeluaran.png', link: '/pengeluaran_rumah_tangga' },
      { title: 'Rekap Gaji Pegawai', description: 'Lihat detail gaji per pegawai', icon: '/icons/gaji.png', link: '/salary_detail' },
      { title: 'Pengaturan Gaji Aktif', description: 'Aktif/Nonaktifkan fitur', icon: '/icons/atur_gaji.png', link: '/pengaturan_gaji' },
      { title: 'Master Jabatan', description: 'Kelola jabatan & gaji', icon: '/icons/jabatan.png', link: '/master_jabatan' },
      { title: 'Potongan Gaji', description: 'Kelola Potongan Gaji', icon: '/icons/potongan.png', link: '/potongan_keterlambatan' }, 
      { title: 'Rekap Gaji Pegawai', description: 'Lihat detail gaji per pegawai', icon: '/icons/gaji2.png', link: '/salary_detail' },
      { title: 'Log Activitas', description: 'Riwayat Aktivitas', icon: '/icons/riwayat.png', link: '/activity_log' },
      { title: 'Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/pengajuan.png', link: '/pengajuan_perubahan_gaji/daftar' },
      { title: 'Form Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/form_pengajuan.png', link: '/pengajuan_perubahan_gaji/form' },
    ],
    'Orang Tua': [
      { title: 'PPDB', description: 'Deskripsi Aplikasi', icon: '/icons/ppdb.png', link: '/ppdb' },
      { title: 'SPP, Komite dan Ekskul', description: 'Deskripsi Aplikasi', icon: '/icons/spp.png', link: '/spp_komite_ekstrakurikuler' },
    ],
    Sekretaris: [
      { title: 'Rekap Gaji Saya', description: 'Lihat riwayat gaji anda', icon: '/icons/gaji2.png', link: '/salary_detail/[id]gajiku' },
      { title: 'PPDB', description: 'Deskripsi Aplikasi', icon: '/icons/ppdb.png', link: '/ppdb' },
      { title: 'Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/pengajuan.png', link: '/pengajuan_perubahan_gaji/daftar' },
    ],
    Admin: [
      { title: 'PPDB', description: 'Deskripsi Aplikasi', icon: '/icons/ppdb.png', link: '/ppdb' },
      { title: 'Daftar Ulang', description: 'Deskripsi Aplikasi', icon: '/icons/daftar-ulang.png', link: '/daftar_ulang' },
      { title: 'SPP, Komite dan Ekskul', description: 'Deskripsi Aplikasi', icon: '/icons/spp.png', link: '/spp_komite_ekstrakurikuler' },
      // { title: 'Gaji Pegawai', description: 'Deskripsi Aplikasi', icon: '/icons/gaji.png', link: '/gaji' },
      { title: 'Pengeluaran Rumah Tangga', description: 'Deskripsi Aplikasi', icon: '/icons/pengeluaran.png', link: '/pengeluaran_rumah_tangga' },
      { title: 'Pengaturan Gaji Aktif', description: 'Aktif/Nonaktifkan fitur', icon: '/icons/atur_gaji.png', link: '/pengaturan_gaji' },
      { title: 'Master Jabatan', description: 'Kelola jabatan & gaji', icon: '/icons/jabatan.png', link: '/master_jabatan' },
      { title: 'Potongan Gaji', description: 'Kelola Potongan Gaji', icon: '/icons/potongan.png', link: '/potongan_keterlambatan' }, 
      { title: 'Rekap Gaji Pegawai', description: 'Lihat detail gaji per pegawai', icon: '/icons/gaji2.png', link: '/salary_detail' },   
      { title: 'Log Activitas', description: 'Riwayat Aktivitas', icon: '/icons/riwayat.png', link: '/activity_log' },
      { title: 'Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/pengajuan.png', link: '/pengajuan_perubahan_gaji/daftar' },
      { title: 'Form Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/form_pengajuan.png', link: '/pengajuan_perubahan_gaji/form' },
      { title: 'Tambah Edit Hapus Pengguna', description: 'Tambah atau Edit Role Pengguna ', icon: '/icons/add_user.png', link: '/Users/add_users' },
      // { title: 'Reset Password', description: 'Atur Ulang Password Pengguna ', icon: '/icons/reset_pass.png', link: '/Users/reset_pass_users' },
      // { title: 'Delete Users', description: 'Hapus Pengguna ', icon: '/icons/delete_users.png', link: '/Users/delete_users' },
    ],
    Guru: [
      { title: 'Rekap Gaji Saya', description: 'Lihat riwayat gaji anda', icon: '/icons/gaji2.png', link: '/salary_detail/[id]gajiku' },
      { title: 'Form Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/form_pengajuan.png', link: '/pengajuan_perubahan_gaji/form' },
      { title: 'Pengajuan Perubahan Gaji', description: 'Ajukan perubahan data gaji', icon: '/icons/pengajuan.png', link: '/pengajuan_perubahan_gaji/daftar' },
    ],    
    Unauthorized: [],
  };

  useEffect(() => {
    const userCookie = Cookies.get('user');

    if (!userCookie) {
      window.location.href = '/auth/login';
    } else {
      const user: { role: Role } = JSON.parse(userCookie);
      setRole(user?.role || 'Unauthorized');
      setRoleApps(applications[user?.role || 'Unauthorized']);
      setIsLoading(false); 
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <Header />
      <div className={styles.dashboard_container}>
        <header className={styles.dashboard_header}>
          <h1>Welcome, {user.username}</h1>
          <p>Silakan pilih Sub-aplikasi</p>
        </header>

        <div className={styles.app_cards}>
          {roleApps?.map((app, index) => (
            <div className={styles.app_card} key={index} onClick={() => router.push(app.link)}>
              <div className={styles.card_icon}>
                <img src={app.icon} alt={app.title} />
              </div>
              <div className={styles.details}>
                <h3>{app.title} <span className={styles.arrow}>→</span></h3>
                <p>{app.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}