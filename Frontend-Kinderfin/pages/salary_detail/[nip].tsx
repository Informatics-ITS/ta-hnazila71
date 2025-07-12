import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import {
  Button,
  Title,
  Container,
  Table,
  Loader,
  Center,
  Paper,
  Text,
  Group,
  TextInput,
  Modal,
  Notification,
  Divider,
} from '@mantine/core';
import styles from './salary_detail.module.css';

// Fungsi untuk memvalidasi tanggal yang benar
const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  // Validasi format DD-MM-YYYY
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('-').map(Number);
  
  // Validasi range
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false; // range tahun yang masuk akal
  
  // Validasi tanggal yang benar menggunakan Date object
  const date = new Date(year, month - 1, day); // month dalam Date object 0-indexed
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
};

// Fungsi untuk membandingkan tanggal (format DD-MM-YYYY)
const compareDates = (date1: string, date2: string): number => {
  const [day1, month1, year1] = date1.split('-').map(Number);
  const [day2, month2, year2] = date2.split('-').map(Number);
  
  const d1 = new Date(year1, month1 - 1, day1);
  const d2 = new Date(year2, month2 - 1, day2);
  
  return d1.getTime() - d2.getTime();
};

// Fungsi untuk mengkonversi dari format UI (DD-MM-YYYY) ke format database (YYYY-MM-DD)
const convertToDBFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Validasi format dan validitas tanggal terlebih dahulu
  if (!isValidDate(dateStr)) return dateStr;
  
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

// Fungsi untuk mengkonversi dari format database (YYYY-MM-DD) ke format UI (DD-MM-YYYY)
const convertToUIFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  // Validasi format YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return dateStr;
  
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

export default function SalaryDetailPage() {
  const router = useRouter();
  const { nip } = router.query;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [aktifFields, setAktifFields] = useState<{ field: string; label: string; type: string }[]>([]);

  const [bonusData, setBonusData] = useState<{ uang_tambahan: number; keterangan: string; start_date: string; end_date: string }[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [uangTambahan, setUangTambahan] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');

  const [manualModalOpened, setManualModalOpened] = useState(false);
  const [manualTanggal, setManualTanggal] = useState('');
  const [manualWaktu, setManualWaktu] = useState('');
  const [manualJamKeluar, setManualJamKeluar] = useState('');

  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedDateToDelete, setSelectedDateToDelete] = useState('');
  const [selectedDateUIFormat, setSelectedDateUIFormat] = useState(''); // untuk tampilan UI

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const parsedUser = userCookie ? JSON.parse(userCookie) : null;
    setUser(parsedUser);

    const fetchAktifFields = async () => {
      if (!parsedUser?.access_token) return;
      try {
        const res = await fetch(Utils.get_pengaturan_gaji_aktif, {
          headers: {
            Authorization: `Bearer ${parsedUser.access_token}`,
          },
        });
        const resJson = await res.json();
        setAktifFields(resJson.aktif || []);
      } catch (error) {
        console.error('Gagal mengambil pengaturan gaji aktif:', error);
        setError("Gagal mengambil pengaturan gaji aktif");
      }
    };

    fetchAktifFields();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!nip || !user?.access_token) return;

      try {
        const res = await fetch(`${Utils.get_salary_by_nip}/${nip}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const resJson = await res.json();
        if (res.ok) {
          // Data dari database sudah dalam format YYYY-MM-DD
          setData(resJson.data);
        } else {
          setError(resJson.error || 'Gagal mengambil detail gaji atau Tidak Ada Data Gaji');
        }
      } catch (err) {
        console.error('Error fetching salary detail:', err);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nip, user]);
  
  useEffect(() => {
    if (nip && user?.access_token) {
      fetchBonusData();
    }
  }, [nip, user]);

  const fetchBonusData = async () => {
    try {
      const res = await fetch(`${Utils.get_bonus_by_nip}/${nip}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const resJson = await res.json();
  
      if (res.ok && resJson.data?.length > 0) {
        // Konversi format tanggal bonus dari YYYY-MM-DD ke DD-MM-YYYY untuk UI
        const convertedBonusData = resJson.data.map((bonus: {
          start_date: string;
          end_date: string;
          uang_tambahan: number;
          keterangan: string;
        }) => ({
          ...bonus,
          start_date: convertToUIFormat(bonus.start_date),
          end_date: convertToUIFormat(bonus.end_date)
        }));
        setBonusData(convertedBonusData);
      } else {
        setBonusData([]);
      }
    } catch (err) {
      console.error('Gagal mengambil bonus:', err);
      setError("Gagal mengambil bonus untuk NIP ini");
      setBonusData([]);
    }
  };

  // Fungsi validasi input tanggal yang diperbarui
  const validateDateInputs = (): boolean => {
    if (!startDate || !endDate) {
      setError("Tanggal mulai dan tanggal akhir harus diisi.");
      return false;
    }

    // Validasi format dan validitas tanggal
    if (!isValidDate(startDate)) {
      setError("Tanggal mulai tidak valid. Pastikan format DD-MM-YYYY dan tanggal yang benar (contoh: 01-12-2024).");
      return false;
    }

    if (!isValidDate(endDate)) {
      setError("Tanggal akhir tidak valid. Pastikan format DD-MM-YYYY dan tanggal yang benar (contoh: 31-12-2024).");
      return false;
    }

    // Validasi range tanggal
    if (compareDates(startDate, endDate) > 0) {
      setError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return false;
    }

    // Validasi rentang tanggal maksimal (opsional)
    const dayDifference = Math.abs(compareDates(endDate, startDate)) / (1000 * 60 * 60 * 24);
    if (dayDifference > 366) {
      setError("Rentang tanggal terlalu besar. Maksimal 1 tahun.");
      return false;
    }

    return true;
  };

  const openModal = () => {
    if (!validateDateInputs()) return;
    setModalOpened(true);
  };

  const handleDelete = async () => {
    try {
      if (!user?.access_token || !nip || !selectedDateToDelete) return;
  
      // selectedDateToDelete sudah dalam format database (YYYY-MM-DD)
      const res = await fetch(`${Utils.detele_salary}/${nip}/${selectedDateToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (res.ok) {
        setSuccess(`Data gaji untuk tanggal ${selectedDateUIFormat} berhasil dihapus`);
        setDeleteModalOpened(false);
        // Refresh data setelah delete
        const fetchData = async () => {
          const res = await fetch(`${Utils.get_salary_by_nip}/${nip}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          const resJson = await res.json();
          if (res.ok) {
            setData(resJson.data);
          }
        };
        fetchData();
      } else {
        const err = await res.json();
        setError(err.error || 'Gagal menghapus data gaji');
      }
    } catch (err) {
      console.error('Error deleting salary:', err);
      setError('Terjadi kesalahan saat menghapus data');
    }
  };

  const handleSubmitDownloadWithBonus = async () => {
    try {
      if (!validateDateInputs()) return;

      // Validasi uang tambahan jika diisi
      if (uangTambahan && (isNaN(Number(uangTambahan)) || Number(uangTambahan) < 0)) {
        setError("Uang tambahan harus berupa angka positif atau 0.");
        return;
      }

      if (uangTambahan && Number(uangTambahan) > 999999999) {
        setError("Uang tambahan terlalu besar. Maksimal 999,999,999.");
        return;
      }

      // Validasi keterangan
      if (keterangan && keterangan.length > 500) {
        setError("Keterangan terlalu panjang. Maksimal 500 karakter.");
        return;
      }
  
      const res = await fetch(`${Utils.download_pdf_url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: convertToDBFormat(startDate),
          end_date: convertToDBFormat(endDate),
          nip,
          uang_tambahan: uangTambahan || null,
          keterangan: keterangan || null,
        }),
      });
  
      if (!res.ok) {
        const err = await res.json();
        setError("Gagal mengunduh PDF: " + (err.error || 'Terjadi kesalahan.'));
        return;
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary_${nip}_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess("Berhasil mengunduh PDF dengan bonus");
      setModalOpened(false);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengunduh PDF.");
    }
  };
  
  const handleSubmitDownloadWithoutBonus = async () => {
    try {
      if (!validateDateInputs()) return;
  
      const res = await fetch(`${Utils.download_pdf_url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: convertToDBFormat(startDate),
          end_date: convertToDBFormat(endDate),
          nip,
          uang_tambahan: null, 
          keterangan: null,
        }),
      });
  
      if (!res.ok) {
        const err = await res.json();
        setError("Gagal mengunduh PDF: " + (err.error || 'Terjadi kesalahan.'));
        return;
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary_${nip}_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccess("Berhasil mengunduh PDF tanpa bonus");
      setModalOpened(false);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengunduh PDF.");
    }
  };

  const handleSubmitManual = async () => {
    try {
      if (!manualTanggal) {
        setError("Tanggal wajib diisi.");
        return;
      }
  
      // Validasi tanggal manual dengan fungsi yang lebih ketat
      if (!isValidDate(manualTanggal)) {
        setError("Tanggal manual tidak valid. Pastikan format DD-MM-YYYY dan tanggal yang benar (contoh: 15-12-2024).");
        return;
      }

      // Validasi format jam jika diisi
      if (manualWaktu) {
        const timeRegex = /^([01]?[0-9]|2[0-3])[:.]([0-5][0-9])$/;
        if (!timeRegex.test(manualWaktu)) {
          setError("Format jam kehadiran tidak valid. Gunakan format HH:MM atau HH.MM (contoh: 07:30).");
          return;
        }
      }

      if (manualJamKeluar) {
        const timeRegex = /^([01]?[0-9]|2[0-3])[:.]([0-5][0-9])$/;
        if (!timeRegex.test(manualJamKeluar)) {
          setError("Format jam pulang tidak valid. Gunakan format HH:MM atau HH.MM (contoh: 16:00).");
          return;
        }
      }
  
      // Konversi format tanggal dari DD-MM-YYYY ke YYYY-MM-DD untuk database
      const formattedDate = convertToDBFormat(manualTanggal);
  
      const res = await fetch(`${Utils.manual_input_salary}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            nip,
            tanggal: formattedDate, // Gunakan format YYYY-MM-DD untuk database
            ...(manualWaktu && { waktu: manualWaktu.replace(".", ":") }),
            ...(manualJamKeluar && { jam_keluar: manualJamKeluar.replace(".", ":") }),
          },
        ]),
      });
  
      if (res.ok) {
        setSuccess("Input manual berhasil!");
        setManualModalOpened(false);
        setManualTanggal('');
        setManualWaktu('');
        setManualJamKeluar('');
        
        // Refresh data setelah input manual
        const fetchData = async () => {
          const res = await fetch(`${Utils.get_salary_by_nip}/${nip}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          const resJson = await res.json();
          if (res.ok) {
            setData(resJson.data);
          }
        };
        fetchData();
      } else {
        const err = await res.json();
        setError("Gagal input manual: " + (err.error || 'Terjadi kesalahan.'));
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat input manual.");
    }
  };

  if (loading) {
    return (
      <Center mt="xl">
        <Loader color="orange" />
      </Center>
    );
  }

  const gajiPokok = data?.[0] || {};
  const gajiPokokFields = aktifFields.filter(f => f.type === 'pokok');

  return (
    <>
      <Header />
      <Container className={styles.page_wrapper} style={{ marginTop: '2rem' }}>
        {success && (
          <Notification  onClose={() => setSuccess('')}>
            {success}
          </Notification>
        )}
        {error && (
          <Notification  onClose={() => setError('')}>
            {error}
          </Notification>
        )}
        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Title order={2} mb="xs" className={styles.title}>Gaji Pokok</Title>
          <Text fw={500} className={styles.title}>NIP: {gajiPokok.nip}</Text>
          <Text fw={500} mb="sm" className={styles.title}>Nama: {gajiPokok.nama_lengkap}</Text>

          <div className={styles.kembali__button}>
          <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            style={{ marginBottom: '1rem' }}
            onClick={() => router.push('/salary_detail')}
          >
            Kembali
          </Button>
          <Divider my="sm" />
       
          </div>

          <Table striped highlightOnHover withColumnBorders className={styles.salary__table}>
            <Table.Tbody>
              {gajiPokokFields.map((fieldData, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td><b>{fieldData.label}</b></Table.Td>
                  <Table.Td>{Utils.formatCurrency(gajiPokok[fieldData.field] || 0)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="md" radius="md" mt="md" className={styles.form_card}>
          <Title order={4} mb="sm">Input Kehadiran Manual</Title>
          <Button variant="outline"
            size="sm"
            color="green"
            radius="md" onClick={() => setManualModalOpened(true)}>
            Input Kehadiran Manual
          </Button>
        </Paper>

        <Paper withBorder p="md" radius="md" mt="md">
          <Title order={4} mb="sm">Proses Gaji Bulanan</Title>
          <Group grow>
            <TextInput
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.currentTarget.value)}
              placeholder="DD-MM-YYYY (contoh: 01-12-2024)"
              error={startDate && !isValidDate(startDate) ? "Format atau tanggal tidak valid" : null}
            />
            <TextInput
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.currentTarget.value)}
              placeholder="DD-MM-YYYY (contoh: 31-12-2024)"
              error={endDate && !isValidDate(endDate) ? "Format atau tanggal tidak valid" : null}
            />
          </Group>
          <Button variant="outline"
            size="sm"
            color="blue"
            radius="md"
            mt="md" onClick={openModal}>
            Proses 
          </Button>
        </Paper>

        <Title order={2} className={styles.title} my="lg">Detail Gaji Bulanan</Title>
      
        {(() => {
          const mergedBonuses = bonusData.reduce((acc: any[], curr) => {
            const currStart = new Date(convertToDBFormat(curr.start_date));
            const currEnd = new Date(convertToDBFormat(curr.end_date));
            // bonus yang overlap
            const overlapIdx = acc.findIndex(b => {
              const bStart = new Date(convertToDBFormat(b.start_date));
              const bEnd = new Date(convertToDBFormat(b.end_date));
              return currStart <= bEnd && currEnd >= bStart;
            });
            if (overlapIdx !== -1) {
              acc[overlapIdx].uang_tambahan += curr.uang_tambahan;
              acc[overlapIdx].keterangan.push(curr.keterangan);
              acc[overlapIdx].start_date = convertToUIFormat(
                new Date(Math.min(
                  new Date(convertToDBFormat(acc[overlapIdx].start_date)).getTime(),
                  currStart.getTime()
                )).toISOString().slice(0, 10)
              );
              acc[overlapIdx].end_date = convertToUIFormat(
                new Date(Math.max(
                  new Date(convertToDBFormat(acc[overlapIdx].end_date)).getTime(),
                  currEnd.getTime()
                )).toISOString().slice(0, 10)
              );
            } else {
              acc.push({
                start_date: curr.start_date,
                end_date: curr.end_date,
                uang_tambahan: curr.uang_tambahan,
                keterangan: [curr.keterangan],
              });
            }
            return acc;
          }, []);
          
          // Tampilkan tabel detail untuk tiap range bonus
          const bonusTables = mergedBonuses.map((bonus, idx) => {
            const filteredData = data.filter(item => {
              // item.tanggal sudah dalam format YYYY-MM-DD dari database
              const itemDate = new Date(item.tanggal);
              return itemDate >= new Date(convertToDBFormat(bonus.start_date)) && 
                     itemDate <= new Date(convertToDBFormat(bonus.end_date));
            });
            
            return (
              <div key={idx} style={{ marginBottom: '2rem' }}>
                <Paper withBorder p="md" radius="md" mb="md">
                  <Text><b>Uang Tambahan (Bonus):</b> {Utils.formatCurrency(bonus.uang_tambahan)}</Text>
                  <Text><b>Keterangan:</b> {bonus.keterangan.filter(Boolean).join(', ') || '-'}</Text>
                  <Text><b>Periode Bonus:</b> {bonus.start_date || '-'} s/d {bonus.end_date || '-'}</Text>
                </Paper>
                <div style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover withColumnBorders className={styles.salary__table}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th rowSpan={2}>Tanggal</Table.Th>
                        <Table.Th rowSpan={2}>Nama</Table.Th>
                        <Table.Th rowSpan={2}>Jam Masuk</Table.Th>
                        <Table.Th rowSpan={2}>Jam Keluar</Table.Th>
                        <Table.Th colSpan={4} style={{ backgroundColor: '#ffe5e5', textAlign: 'center' }}>Potongan</Table.Th>
                        <Table.Th rowSpan={2}>Total Salary</Table.Th>
                        <Table.Th rowSpan={2}>Aksi</Table.Th>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Datang Telat</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Pulang Cepat</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Tidak Absen Masuk</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Tidak Absen Keluar</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredData.map((item, index) => (
                        <Table.Tr key={index}>
                          {/* Konversi format tanggal dari YYYY-MM-DD dari database ke DD-MM-YYYY untuk tampilan */}
                          <Table.Td>{convertToUIFormat(item.tanggal)}</Table.Td>
                          <Table.Td>{item.nama_lengkap}</Table.Td>
                          <Table.Td>{item.jam_masuk || '-'}</Table.Td>
                          <Table.Td>{item.jam_keluar || '-'}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_datang_telat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_pulang_cepat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_masuk || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_pulang || 0)}</Table.Td>
                          <Table.Td>{Utils.formatCurrency(item.total_salary)}</Table.Td>
                          <Table.Td>
                          <Button
                              variant="outline"
                              size="xs"
                              color="red"
                              onClick={() => {
                                // Simpan tanggal dalam format database dan UI
                                setSelectedDateToDelete(item.tanggal); // Format database (YYYY-MM-DD)
                                setSelectedDateUIFormat(convertToUIFormat(item.tanggal)); // Format UI (DD-MM-YYYY)
                                setDeleteModalOpened(true);
                              }}
                            >
                              Hapus
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </div>
            );
          });

          // Tambahkan logika untuk menampilkan tabel data di luar range bonus mana pun
          const bonusRanges = mergedBonuses.map(b => ({
            start: new Date(convertToDBFormat(b.start_date)),
            end: new Date(convertToDBFormat(b.end_date)),
          }));
          
          const isOutsideBonusRange = (tanggal: string) => {
            // tanggal dalam format YYYY-MM-DD dari database
            const tgl = new Date(tanggal);
            return !bonusRanges.some(r => tgl >= r.start && tgl <= r.end);
          };
          
          const nonBonusData = data.filter(item => isOutsideBonusRange(item.tanggal));

          // Tampilkan tabel tanpa bonus jika ada data
          let nonBonusTable = null;
          if (nonBonusData.length > 0) {
            nonBonusTable = (
              <div style={{ marginBottom: '2rem' }}>
                <Paper withBorder p="md" radius="md" mb="md">
                  <Text><b>Tanpa Bonus</b></Text>
                </Paper>
                <div style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover withColumnBorders className={styles.salary__table}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th rowSpan={2}>Tanggal</Table.Th>
                        <Table.Th rowSpan={2}>Nama</Table.Th>
                        <Table.Th rowSpan={2}>Jam Masuk</Table.Th>
                        <Table.Th rowSpan={2}>Jam Keluar</Table.Th>
                        <Table.Th colSpan={4} style={{ backgroundColor: '#ffe5e5', textAlign: 'center' }}>Potongan</Table.Th>
                        <Table.Th rowSpan={2}>Total Salary</Table.Th>
                        <Table.Th rowSpan={2}>Aksi</Table.Th>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Datang Telat</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Pulang Cepat</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Tidak Absen Masuk</Table.Th>
                        <Table.Th style={{ backgroundColor: '#ffe5e5' }}>Tidak Absen Keluar</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {nonBonusData.map((item, index) => (
                        <Table.Tr key={index}>
                          {/* Konversi format tanggal dari YYYY-MM-DD dari database ke DD-MM-YYYY untuk tampilan */}
                          <Table.Td>{convertToUIFormat(item.tanggal)}</Table.Td>
                          <Table.Td>{item.nama_lengkap}</Table.Td>
                          <Table.Td>{item.jam_masuk || '-'}</Table.Td>
                          <Table.Td>{item.jam_keluar || '-'}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_datang_telat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_pulang_cepat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_masuk || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_pulang || 0)}</Table.Td>
                          <Table.Td>{Utils.formatCurrency(item.total_salary)}</Table.Td>
                          <Table.Td>
                          <Button
                                variant="outline"
                                size="xs"
                                color="red"
                                onClick={() => {
                                  // Simpan tanggal dalam format database dan UI
                                  setSelectedDateToDelete(item.tanggal); // Format database (YYYY-MM-DD)
                                  setSelectedDateUIFormat(convertToUIFormat(item.tanggal)); // Format UI (DD-MM-YYYY)
                                  setDeleteModalOpened(true);
                                }}
                              >
                                Hapus
                              </Button> 
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </div>
            );
          }
          // Gabungkan semua tabel: bonusTables + tabel non bonus (jika ada)
          return (
            <>
              {bonusTables}
              {nonBonusTable}
            </>
          );
        })()}
      </Container>

      <Footer />

        {/* Delete Confirmation Modal */}
            <Modal
              opened={deleteModalOpened}
              onClose={() => setDeleteModalOpened(false)}
              title="Konfirmasi Hapus Data"
            >
              <Text>Apakah Anda yakin ingin menghapus data gaji untuk tanggal {selectedDateUIFormat}?</Text>
              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => setDeleteModalOpened(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="filled"
                  color="red"
                  onClick={handleDelete}
                >
                  Hapus
                </Button>
              </Group>
            </Modal>

      {/* Modal Input Manual */}
      <Modal
        opened={manualModalOpened}
        onClose={() => setManualModalOpened(false)}
        title="Input Kehadiran dan Pulang"
      >
        <TextInput
          label="Tanggal Kehadiran"
          value={manualTanggal}
          onChange={(e) => setManualTanggal(e.currentTarget.value)}
          placeholder="DD-MM-YYYY (contoh: 15-12-2024)"
          error={manualTanggal && !isValidDate(manualTanggal) ? "Format atau tanggal tidak valid" : null}
          mb="sm"
        />
        <TextInput
          label="Jam Kehadiran"
          value={manualWaktu}
          onChange={(e) => setManualWaktu(e.currentTarget.value)}
          placeholder="HH:MM (contoh: 07:05)"
          mb="md"
        />
        <TextInput
          label="Jam Pulang"
          value={manualJamKeluar}
          onChange={(e) => setManualJamKeluar(e.currentTarget.value)}
          placeholder="HH:MM (contoh: 16:00)"
          mb="md"
        />
        <Group justify="flex-end" mt="md">
          <Button 
             variant="outline"
             size="sm"
             color="green"
             radius="md" onClick={handleSubmitManual}>
            Submit
          </Button>
        </Group>
      </Modal>


      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Konfirmasi Gaji Bulanan"
        
      >
          {success && (
            <Notification color="green" onClose={() => setSuccess('')} mb="md">
              {success}
            </Notification>
          )}
          {error && (
            <Notification color="red" onClose={() => setError('')} mb="md">
              {error}
            </Notification>
         )}
        <TextInput
          label="Uang Tambahan (Bonus)"
          type="number"
          value={uangTambahan}
          onChange={(e) => setUangTambahan(e.currentTarget.value)}
          placeholder="Masukkan jumlah bonus (opsional)"
          error={uangTambahan && (isNaN(Number(uangTambahan)) || Number(uangTambahan) < 0) ? "Harus berupa angka positif" : null}
          mb="sm"
        />
        <TextInput
          label="Keterangan Bonus"
          value={keterangan}
          onChange={(e) => setKeterangan(e.currentTarget.value)}
          placeholder="Masukkan keterangan bonus (opsional, max 500 karakter)"
          error={keterangan && keterangan.length > 500 ? "Keterangan terlalu panjang (max 500 karakter)" : null}
          mb="md"
        />
        <Group justify="flex-end" mt="md">
        <Button
            variant="outline"
            size="sm"
            color="green"
            radius="md"
            onClick={handleSubmitDownloadWithBonus}
          >
            Unduh PDF Dengan Bonus
          </Button>

          <Button
            variant="outline"
            size="sm"
            color="red"
            radius="md"
            onClick={handleSubmitDownloadWithoutBonus}
          >
            Unduh PDF Tanpa Bonus
          </Button>
        </Group>
      </Modal>
    </>
  );
}