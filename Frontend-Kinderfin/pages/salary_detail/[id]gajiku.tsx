import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  Notification,
} from '@mantine/core';
import styles from './salary_detail.module.css';

// Function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid date
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

export default function MySalaryDetailPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [aktifFields, setAktifFields] = useState<{ field: string; label: string; type: string }[]>([]);
  const [bonusData, setBonusData] = useState<{ uang_tambahan: number; keterangan: string; start_date: string; end_date: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const gajiPokok = data?.[0] || {};

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
        setError('Gagal mengambil pengaturan gaji aktif');
      }
    };

    fetchAktifFields();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.access_token) return;

      try {
        const res = await fetch(Utils.get_my_salary_detail, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const resJson = await res.json();
        if (res.ok) {
          setData(resJson.data);
          setSuccess('Data gaji berhasil dimuat');
          // Auto hide success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000);
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
  }, [user]);

  const fetchBonusData = async () => {
    if (!user?.access_token || !gajiPokok?.nip) return;
    try {
      const res = await fetch(`${Utils.get_bonus_by_nip}/${gajiPokok.nip}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const resJson = await res.json();
      if (res.ok && resJson.data?.length > 0) {
        setBonusData(resJson.data);
        setSuccess('Data bonus berhasil dimuat');
        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setBonusData([]);
      }
    } catch (err) {
      console.error('Gagal mengambil bonus:', err);
      setBonusData([]);
      setError('Gagal mengambil data bonus');
    }
  };

  useEffect(() => {
    if (user && gajiPokok?.nip) {
      fetchBonusData();
    }
  }, [user, gajiPokok]);

  if (loading) {
    return (
      <Center mt="xl">
        <Loader color="orange" />
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container className={styles.page_wrapper}>
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
        
        <div className={styles.salary__info}>
          <Title order={2} mb="xs" className={styles.title}>Gaji Pokok</Title>
          <Text fw={500} className={styles.centered}>NIP: {gajiPokok.nip}</Text>
          <Text fw={500} mb="sm" className={styles.centered}>Nama: {gajiPokok.nama}</Text>

          <Table striped withColumnBorders className={styles.salary__table}>
            <Table.Tbody>
              {aktifFields.filter(f => f.type === 'pokok').map((fieldData, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td><b>{fieldData.label}</b></Table.Td>
                  <Table.Td>{Utils.formatCurrency(gajiPokok[fieldData.field] || 0)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <div className={styles.kembali__button}>
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
        </div>

        <Title order={2} className={styles.title} my="lg">Detail Gaji Bulanan</Title>

        {(() => {
          const mergedBonuses = bonusData.reduce((acc: any[], curr) => {
            const currStart = new Date(curr.start_date);
            const currEnd = new Date(curr.end_date);
            const overlapIdx = acc.findIndex(b => {
              const bStart = new Date(b.start_date);
              const bEnd = new Date(b.end_date);
              return currStart <= bEnd && currEnd >= bStart;
            });
            if (overlapIdx !== -1) {
              acc[overlapIdx].uang_tambahan += curr.uang_tambahan;
              acc[overlapIdx].keterangan.push(curr.keterangan);
              acc[overlapIdx].start_date = new Date(Math.min(new Date(acc[overlapIdx].start_date).getTime(), currStart.getTime())).toISOString().slice(0, 10);
              acc[overlapIdx].end_date = new Date(Math.max(new Date(acc[overlapIdx].end_date).getTime(), currEnd.getTime())).toISOString().slice(0, 10);
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

          const bonusTables = mergedBonuses.map((bonus, idx) => {
            const filteredData = data.filter(item => {
              const itemDate = new Date(item.tanggal);
              return itemDate >= new Date(bonus.start_date) && itemDate <= new Date(bonus.end_date);
            });

            return (
              <div key={idx} style={{ marginBottom: '2rem' }}>
                <Paper withBorder p="md" radius="md" mb="md">
                  <Text><b>Uang Tambahan:</b> {Utils.formatCurrency(bonus.uang_tambahan)}</Text>
                  <Text><b>Keterangan:</b> {bonus.keterangan.filter(Boolean).join(', ') || '-'}</Text>
                  <Text><b>Periode Bonus:</b> {formatDate(bonus.start_date)} s/d {formatDate(bonus.end_date)}</Text>
                </Paper>
                <div style={{ overflowX: 'auto' }}>
                  <Table striped highlightOnHover withColumnBorders className={styles.salary__table}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th rowSpan={2}>Tanggal</Table.Th>
                        <Table.Th rowSpan={2}>Nama</Table.Th>
                        <Table.Th rowSpan={2}>Jam Masuk</Table.Th>
                        <Table.Th rowSpan={2}>Jam Keluar</Table.Th>
                        {aktifFields.filter(f => f.type === 'harian' && f.field.startsWith('gaji'))
                          .sort((a, b) => parseInt(a.field.replace('gaji', ''), 10) - parseInt(b.field.replace('gaji', ''), 10))
                          .map((f) => (
                            <Table.Th key={f.field} rowSpan={2}>{f.label}</Table.Th>
                          ))}
                        <Table.Th colSpan={4} style={{ backgroundColor: '#ffe5e5', textAlign: 'center' }}>Potongan</Table.Th>
                        <Table.Th rowSpan={2}>Total Salary</Table.Th>
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
                          <Table.Td>{formatDate(item.tanggal)}</Table.Td>
                          <Table.Td>{item.nama}</Table.Td>
                          <Table.Td>{item.jam_masuk}</Table.Td>
                          <Table.Td>{item.jam_keluar}</Table.Td>
                          {aktifFields.filter(field => field.type === 'harian' && field.field.startsWith('gaji')).sort((a, b) => Number(a.field.replace('gaji', '')) - Number(b.field.replace('gaji', ''))).map(field => (
                            <Table.Td key={field.field}>{Utils.formatCurrency(item[field.field] || 0)}</Table.Td>
                          ))}
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_datang_telat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_pulang_cepat || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_masuk || 0)}</Table.Td>
                          <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_pulang || 0)}</Table.Td>
                          <Table.Td>{Utils.formatCurrency(item.total_salary)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </div>
            );
          });

          const bonusRanges = mergedBonuses.map(b => ({
            start: new Date(b.start_date),
            end: new Date(b.end_date),
          }));

          const isOutsideBonusRange = (tanggal: string) => {
            const tgl = new Date(tanggal);
            return !bonusRanges.some(r => tgl >= r.start && tgl <= r.end);
          };

          const nonBonusData = data.filter(item => isOutsideBonusRange(item.tanggal));

          const nonBonusTable = nonBonusData.length > 0 && (
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
                      {aktifFields.filter(f => f.type === 'harian' && f.field.startsWith('gaji'))
                        .sort((a, b) => parseInt(a.field.replace('gaji', ''), 10) - parseInt(b.field.replace('gaji', ''), 10))
                        .map((f) => (
                          <Table.Th key={f.field} rowSpan={2}>{f.label}</Table.Th>
                        ))}
                      <Table.Th colSpan={4} style={{ backgroundColor: '#ffe5e5', textAlign: 'center' }}>Potongan</Table.Th>
                      <Table.Th rowSpan={2}>Total Salary</Table.Th>
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
                        <Table.Td>{formatDate(item.tanggal)}</Table.Td>
                        <Table.Td>{item.nama}</Table.Td>
                        <Table.Td>{item.jam_masuk}</Table.Td>
                        <Table.Td>{item.jam_keluar}</Table.Td>
                        {aktifFields.filter(field => field.type === 'harian' && field.field.startsWith('gaji')).sort((a, b) => Number(a.field.replace('gaji', '')) - Number(b.field.replace('gaji', ''))).map(field => (
                          <Table.Td key={field.field}>{Utils.formatCurrency(item[field.field] || 0)}</Table.Td>
                        ))}
                        <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_datang_telat || 0)}</Table.Td>
                        <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_pulang_cepat || 0)}</Table.Td>
                        <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_masuk || 0)}</Table.Td>
                        <Table.Td style={{ color: 'red' }}>-{Utils.formatCurrency(item.potongan_tidak_absen_pulang || 0)}</Table.Td>
                        <Table.Td>{Utils.formatCurrency(item.total_salary)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </div>
          );

          return (
            <>
              {bonusTables}
              {nonBonusTable}
            </>
          );
        })()}
      </Container>
      <Footer />
    </>
  )
}