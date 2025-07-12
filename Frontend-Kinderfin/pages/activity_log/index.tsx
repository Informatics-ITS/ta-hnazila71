import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Utils from '../../utils'; // Pastikan path ini benar
import Header from '../../components/Header/Header'; // Pastikan path ini benar
import Footer from '../../components/Footer/Footer'; // Pastikan path ini benar
import {
  Button,
  Title,
  Container,
  Table,
  Loader,
  Center,
  Text,
  Badge,
} from '@mantine/core';
import styles from './activity_log.module.css'; // Pastikan path ini benar

export default function ActivityLogIndex() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Ambil data user dari cookie saat komponen dimuat
  useEffect(() => {
    const userCookie = Cookies.get('user');
    setUser(userCookie ? JSON.parse(userCookie) : null);
  }, []);

  // Fetch log aktivitas setelah user data tersedia
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.access_token) {
        // Jika user atau access_token tidak ada, hentikan fetch
        setLoading(false); // Pastikan loading dihentikan agar tidak stuck
        return;
      }

      try {
        const res = await fetch(Utils.get_all_activity_log, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        const resJson = await res.json();

        if (res.ok) {
          setLogs(resJson);
        } else {
          // Tampilkan pesan error dari API atau pesan default
          alert(resJson.error || 'Gagal memuat log aktivitas');
        }
      } catch (err) {
        console.error('Gagal fetch log aktivitas:', err);
        alert('Terjadi kesalahan saat mengambil data log aktivitas.'); // Pesan error generic
      } finally {
        setLoading(false); // Selalu set loading ke false setelah fetch selesai
      }
    };

    fetchData();
  }, [user]); // Dependensi user agar fetch ulang jika user berubah

  if (loading) {
    return (
      <Center mt="xl" style={{ minHeight: '80vh' }}> {/* Tambah minHeight agar loader di tengah halaman */}
        <Loader color="orange" size="xl" /> {/* Ukuran loader lebih besar */}
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container mt="xl" className={styles.container}>
        <Title order={2} mb="lg" className={styles.title}>Log Aktivitas Pengguna</Title>
        <div className={styles.center_button}>
          <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            style={{ marginBottom: '1rem' }}
            onClick={() => router.push('/')}
          >
            Kembali
          </Button>
        </div>
        <Table striped highlightOnHover className={styles.table}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tanggal</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Aksi</Table.Th>
              <Table.Th>Modul</Table.Th>
              <Table.Th>Keterangan</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.length > 0 ? (
              logs.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    {/* Format tanggal dan waktu menjadi 'DD Mon YYYY, HH.MM' */}
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short', // ex: Jun
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false, // Format 24 jam
                    })}
                  </Table.Td>
                  <Table.Td>{item.email}</Table.Td>
                  <Table.Td>
                    {/* Tampilkan Aksi dengan Badge jika 'Upload Manual Salary' */}
                    {item.action === 'Upload Manual Salary' ? (
                      <Badge color="blue" variant="light">Mengunggah Gaji Manual</Badge>
                    ) : (
                      item.action
                    )}
                  </Table.Td>
                  <Table.Td>{item.module}</Table.Td>
                  <Table.Td>
                    {(() => {
                      try {
                        const prefix = 'Upload Gaji Manual:';
                        // Hapus prefix jika ada, lalu parse JSON
                        const trimmed = item.description.startsWith(prefix)
                          ? item.description.slice(prefix.length).trim()
                          : item.description;
                        const parsed = JSON.parse(trimmed);

                        // Jika berhasil di-parse dan berupa array dengan isi
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          return (
                            <div>
                              {parsed.map((entry: any, i: number) => (
                                <div key={i} style={{ marginBottom: '0.5rem' }}>
                                  {/* Semua properti size dan color dihapus agar mengikuti default Table.Td */}
                                  <Text>NIP: {entry.nip}</Text>
                                  <Text>Tanggal: {entry.tanggal}</Text>
                                  {entry.waktu && <Text>Jam Masuk: {entry.waktu}</Text>}
                                  {entry.jam_keluar && <Text>Jam Pulang: {entry.jam_keluar}</Text>}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        // Jika bukan array atau kosong, tampilkan deskripsi asli
                        return item.description;
                      } catch (e) {
                        // Jika parsing gagal, tampilkan deskripsi asli
                        return item.description;
                      }
                    })()}
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              // Pesan jika tidak ada log aktivitas
              <Table.Tr>
                <Table.Td colSpan={5} align="center">
                  <Text c="dimmed" py="md">Belum ada aktivitas tercatat</Text> {/* Tambah padding */}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Container>
      <Footer />
    </>
  );
}