import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './potongan_keterlambatan.module.css';
import {
  Button,
  Title,
  Container,
  Loader,
  Center,
  Notification,
  Modal,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

export default function PotonganKeterlambatanIndex() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [aktifFields, setAktifFields] = useState<{ field: string, label: string, type: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteJabatan, setDeleteJabatan] = useState<string>('');
  const [sortKey, setSortKey] = useState<'batas_menit' | 'persen_potong' | 'jabatan'>('jabatan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  type Label = {
    value: string;
    label: string;
  };
  
  const labels: Label[] = [
    { value: 'datang_telat', label: 'Datang Terlambat' },
    { value: 'pulang_cepat', label: 'Pulang Cepat' },
    { value: 'tidak_absen_masuk', label: 'Tidak Presensi Masuk' },
    { value: 'tidak_absen_pulang', label: 'Tidak Presensi Pulang' },
  ];

  useEffect(() => {
    const userCookie = Cookies.get('user');
    setUser(userCookie ? JSON.parse(userCookie) : null);
    
    const successMessage = localStorage.getItem('potonganSuccess');
    if (successMessage) {
      setSuccess(successMessage);
      localStorage.removeItem('potonganSuccess');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.access_token) return;

      try {
        const res = await fetch(Utils.get_all_potongan_keterlambatan, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        const resJson = await res.json();

        if (res.ok && Array.isArray(resJson)) {
          setData(resJson);
          const roleMap: Record<string, boolean> = {};
          resJson.forEach((item: any) => {
            const role = item.jabatan.toLowerCase();
            if (!(role in roleMap)) {
              roleMap[role] = true;
            }
          });
          setExpandedRoles(roleMap);
        } else {
          alert(resJson.error || 'Gagal memuat data');
        }

        const resFields = await fetch(Utils.get_pengaturan_gaji_aktif, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        const resFieldsJson = await resFields.json();
        if (resFields.ok) {
          setAktifFields(resFieldsJson.aktif || []);
        } else {
          console.error('Gagal fetch pengaturan gaji aktif');
        }

      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getLabelByUrutanGaji = (urutan: number) => {
    const field = aktifFields.find((f) => {
      const match = f.field.match(/^gaji(\d+)$/); 
      return match && Number(match[1]) === urutan;
    });
    return field?.label || `Urutan ${urutan}`;
  };

  const confirmDelete = (id: string, jabatan: string) => {
    setDeleteId(id);
    setDeleteJabatan(jabatan);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${Utils.delete_potongan_keterlambatan}/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      if (res.ok) {
        setData((prev) => prev.filter((d) => d.id !== deleteId));
        setSuccess('Data berhasil dihapus');
        setError('');
      } else {
        const err = await res.json();
        setError(err.message || 'Gagal menghapus data');
        setSuccess('');
      }
    } catch (err) {
      console.error('Gagal menghapus data:', err);
      setError('Terjadi kesalahan');
      setSuccess('');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleRoleSection = (role: string) => {
    setExpandedRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const groupedData = data
    .filter((item) =>
      item.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, item) => {
      const role = item.jabatan.toLowerCase();
      if (!acc[role]) acc[role] = [];
      acc[role].push(item);
      return acc;
    }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <Center mt="xl">
        <Loader color="orange" />
      </Center>
    );
  }

  return (
    <>
      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Konfirmasi Hapus"
        centered
      >
        <p>Apakah Anda yakin ingin menghapus potongan ini untuk jabatan <b>{deleteJabatan}</b>?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button  variant="outline"
            size="sm"
            color="gray"
            radius="md" onClick={() => setDeleteId(null)} style={{ marginRight: '1rem' }}>
            Batal
          </Button>
          <Button   variant="outline"
            size="sm"
            color="red"
            radius="md" onClick={handleDelete}>
            Ya, Hapus
          </Button>
        </div>
      </Modal>
      <Header />
      {success && (
        <Center mt="md">
          <Notification color="green" title="Sukses" onClose={() => setSuccess('')}>
            {success}
          </Notification>
        </Center>
      )}
      {error && (
        <Center mt="md">
          <Notification color="red" title="Error" onClose={() => setError('')}>
            {error}
          </Notification>
        </Center>
      )}
      
      <Container mt="xl">
        <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            style={{ marginBottom: '1.5rem' }}
            onClick={() => router.push('/')}
          >
            Kembali
        </Button>
        <div className={styles.page_wrapper}>
            <Title order={2} className={styles.title}>
                Data Potongan Gaji
            </Title>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div>
                    <label style={{ marginRight: '0.5rem' }}>Cari Jabatan:</label>
                    <input
                    type="text"
                    placeholder="Masukkan nama jabatan"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div>
                    <label style={{ marginRight: '0.5rem' }}>Urutan:</label>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                    <option value="asc">Naik</option>
                    <option value="desc">Turun</option>
                    </select>
                </div>
            </div>

            <div className={styles.center_button}>
            <Button 
            variant="outline"
                size="sm"
                color="green"
                radius="md"
            onClick={() => router.push('/potongan_keterlambatan/tambah')}>
                Tambah Potongan
            </Button>
            </div>

            <div className={styles.table_wrapper}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Jabatan</th>
                    <th>Gaji Dipotong</th>
                    <th>Persen Potong</th>
                    <th>Batas Menit</th>
                    <th>Jenis Pelanggaran</th>
                    <th>Aksi</th>
                </tr>
                </thead>
                {Object.keys(groupedData).map((role) => (
                <tbody key={role}>
                    <tr>
                    <td colSpan={6}>
                        <Button
                        variant="subtle"
                        color="blue"
                        onClick={() => toggleRoleSection(role)}
                        style={{ marginBottom: '0.5rem' }}
                        >
                        {expandedRoles[role] ? '' : ''} {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    </td>
                    </tr>
                    {expandedRoles[role] &&
                    groupedData[role]
                        ?.sort((a: any, b: any) => {
                        const aVal = a[sortKey];
                        const bVal = b[sortKey];
                        if (typeof aVal === 'string') {
                            return sortOrder === 'asc'
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                        }
                        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                        })
                        .map((item: any, idx: number) => (
                        <tr key={`${role}-${idx}`}>
                            <td>{item.jabatan}</td>
                            <td>{getLabelByUrutanGaji(item.urutan_gaji_dipotong)}</td>
                            <td>{item.persen_potong}%</td> 
                            <td>{item.batas_menit === 0 ? '-' : `${item.batas_menit} menit`}</td>
                            
                            <td>{labels.find((label) => label.value === item.jenis_potongan)?.label || item.jenis_potongan}</td>
                            <td style={{ textAlign: 'center' }}>
                            <Button
                                variant="transparent"
                                onClick={() => confirmDelete(item.id, item.jabatan)}
                            >
                                <IconTrash color="red" size={14} />
                            </Button>
                            </td>
                        </tr>
                        ))}
                </tbody>
                ))}
            </table> 
            </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}