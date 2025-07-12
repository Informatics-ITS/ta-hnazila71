import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import {
  Button,
  Title,
  Loader,
  Center,
  Notification,
  Modal,
  Text,
  Group,
  Grid,
  Container,
  Paper,
} from '@mantine/core';
import { IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import styles from './master_jabatan.module.css';

export default function MasterJabatanIndex() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewJabatan, setViewJabatan] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [aktifFields, setAktifFields] = useState<{ field: string; label: string; type: string }[]>([]);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.access_token) return;
    fetch(Utils.get_pengaturan_gaji_aktif, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.access_token}` },
    })
      .then(res => res.json())
      .then(json => setAktifFields(json.aktif || []))
      .catch(err => console.error('Gagal fetch aktif fields', err));
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.access_token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(Utils.get_all_jabatan, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        if (res.ok) {
          const resJson = await res.json();
          setData(resJson.data);
        } else {
          const errorJson = await res.json();
          setError(errorJson.detail || errorJson.error || `Gagal mengambil data. Status: ${res.status}`);
        }
      } catch (err) {
        setError('Gagal terhubung ke server. Periksa koneksi internet dan masalah CORS.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (viewOpen && viewJabatan && user?.access_token) {
      setDetailLoading(true);
      fetch(`${Utils.get_detail_jabatan}/${viewJabatan}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.access_token}` },
      })
        .then(res => res.json())
        .then(json => setDetailData(json.data))
        .catch(err => console.error('Gagal fetch detail jabatan', err))
        .finally(() => setDetailLoading(false));
    }
  }, [viewOpen, viewJabatan, user]);

  const handleDelete = async () => {
    if (!selectedJabatan) return;
    try {
      const res = await fetch(`${Utils.delete_jabatan}/${selectedJabatan}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      if (res.ok) {
        setData(prev => prev.filter(d => d.jabatan !== selectedJabatan));
        setSuccess('Jabatan berhasil dihapus');
        setError('');
        
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        const err = await res.json();
        setError(err.message || 'Gagal menghapus jabatan');
        setSuccess('');
      }
    } catch (err) {
      console.error('Gagal menghapus jabatan', err);
      setError('Terjadi kesalahan');
      setSuccess('');
    } finally {
      setConfirmOpen(false);
    }
  };

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
      <Container my="xl">
        <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            mb="lg"
            onClick={() => router.push('/')}
        >
            Kembali
        </Button>

        <Paper withBorder shadow="sm" radius="md" p="lg" className={styles.page_wrapper}>
            <Title order={2} ta="center" className={styles.title}>
                Master Jabatan
            </Title>
            
            <Group justify="center" mb="lg">
                <Button
                    variant="outline"
                    size="sm"
                    color="green"
                    radius="md"
                    onClick={() => router.push('/master_jabatan/tambah')}
                >
                    Tambah Jabatan Baru 
                </Button>
            </Group>

            {error && (
            <Notification title="Error" color="red" mt="md" mb="md" onClose={() => setError('')}>
                {error}
            </Notification>
            )}
            
            {success && (
            <Notification color="green" mt="md" mb="md" onClose={() => setSuccess('')}>
                {success}
            </Notification>
            )}

            <div className={styles.table_container}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Jabatan</th>
                        <th>Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.jabatan}</td>
                            <td>
                            <Button
                                variant='transparent'
                                onClick={() => router.push(`/master_jabatan/rincian/${item.jabatan}`)}
                            >
                                <IconPencil color='green' size={14} />
                            </Button>
                            <Button
                                variant='transparent'
                                onClick={() => {
                                setViewJabatan(item.jabatan);
                                setViewOpen(true);
                                }}
                            >
                                <IconEye color='blue' size={14} />
                            </Button>
                            <Button
                                variant='transparent'
                                onClick={() => {
                                setSelectedJabatan(item.jabatan);
                                setConfirmOpen(true);
                                }}
                            >
                                <IconTrash color='red' size={14} />
                            </Button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={2} style={{ textAlign: 'center', padding: '1rem' }}>Tidak ada data jabatan.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </Paper>
      </Container>
      <Footer />

      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title="Konfirmasi Hapus" centered>
        <Text>Apakah yakin ingin menghapus jabatan {selectedJabatan}?</Text>
        <Group mt="md" justify="center">
          <Button color="red" onClick={handleDelete}>Ya, Hapus</Button>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
        </Group>
      </Modal>
      <Modal opened={viewOpen} onClose={() => setViewOpen(false)} title={`Detail Gaji: ${viewJabatan}`} size="xl" centered>
        {detailLoading ? (
          <Center><Loader /></Center>
        ) : (
          <>
            <Title order={5} style={{ fontFamily: "Poppins, sans-serif" }}>Gaji Harian</Title>
            <Grid>
              {aktifFields
                .filter(f => f.type === "harian" && f.field.startsWith("gaji"))
                .sort((a, b) => parseInt(a.field.replace("gaji", ""), 10) - parseInt(b.field.replace("gaji", ""), 10))
                .map(f => (
                  <Grid.Col span={3} key={`view-${f.field}`}>
                    <Text style={{ fontWeight: 500 }}>{f.label}</Text>
                    <Text style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {Utils.formatCurrency(detailData?.[f.field] || 0)}
                    </Text>
                  </Grid.Col>
                ))
              }
            </Grid>

            <Title order={5} mt="md" style={{ fontFamily: "Poppins, sans-serif" }}>Gaji Pokok</Title>
            <Grid>
              {aktifFields
                .filter(f => f.type === "pokok")
                .map(f => (
                  <Grid.Col span={3} key={`view-pokok-${f.field}`}>
                    <Text style={{ fontWeight: 500 }}>{f.label}</Text>
                    <Text style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {Utils.formatCurrency(detailData?.[f.field] || 0)}
                    </Text>
                  </Grid.Col>
                ))
              }
            </Grid>

            <Group mt="lg">
              <Button variant="outline" size="sm" color="gray" radius="md" onClick={() => setViewOpen(false)}>
                Tutup
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </>
  );
}