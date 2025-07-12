import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import {
  Button,
  Title,
  Container,
  Group,
  Select,
  Loader,
  Center,
  TextInput,
  NumberInput,
  Notification,
} from '@mantine/core';
import styles from './potongan_keterlambatan.module.css';

export default function TambahPotonganKeterlambatan() {
  const router = useRouter();
  const [form, setForm] = useState({
    jabatan: '',
    urutan_gaji_dipotong: 1,
    persen_potong: 0,
    batas_menit: 0,
    tipe_jam: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [aktifFields, setAktifFields] = useState<{ field: string, label: string, type: string }[]>([]);
  const [jabatanOptions, setJabatanOptions] = useState<{ value: string, label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  useEffect(() => {
    const fetchAktifFields = async () => {
      try {
        const res = await fetch(Utils.get_pengaturan_gaji_aktif, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        });
        const resJson = await res.json();
        if (res.ok) {
          setAktifFields(resJson.aktif || []);
        } else {
          console.error('Gagal mengambil field aktif');
        }
      } catch (error) {
        console.error('Gagal fetch field aktif:', error);
      }
    };

    fetchAktifFields();
  }, []);

  useEffect(() => {
    const fetchJabatan = async () => {
      try {
        const res = await fetch(Utils.get_all_jabatan, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        const resJson = await res.json();

        if (res.ok && Array.isArray(resJson.data)) {
          const options = resJson.data.map((j: any) => ({
            value: j.jabatan,
            label: j.jabatan,
          }));
          setJabatanOptions(options);
        } else {
          alert(resJson.error || 'Gagal memuat jabatan');
        }
      } catch (err) {
        console.error('Gagal ambil jabatan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJabatan();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submitData = {
      ...form,
      jenis_potongan: form.tipe_jam, // Make sure jenis_potongan is set
      batas_menit: ['tidak_absen_masuk', 'tidak_absen_pulang'].includes(form.tipe_jam) ? 0 : form.batas_menit,
    };

    try {
      const res = await fetch(Utils.tambah_potongan_keterlambatan, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(submitData),
      });

      const resJson = await res.json();

      if (res.ok) {
        // Save success message to localStorage
        localStorage.setItem('potonganSuccess', 'Potongan berhasil ditambahkan');
        router.push('/potongan_keterlambatan');
      } else {
        setError(resJson.error || 'Gagal menambahkan potongan');
        setSuccess('');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Gagal tambah potongan:', err);
      setError('Terjadi kesalahan saat menambahkan data');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Center mt="xl"><Loader /></Center>;
  }

  return (
    <>
      <Header />
      <Container size="sm" mt="xl" className={styles.form_input}>
        {success && (
          <Notification color="green" title="Berhasil" onClose={() => setSuccess('')} mb="md">
            {success}
          </Notification>
        )}
        {error && (
          <Notification color="red" title="Gagal" onClose={() => setError('')} mb="md">
            {error}
          </Notification>
        )}
        <Title order={2} mb="lg">Tambah Potongan Gaji</Title>

        <Select
          className={styles.textInput}
          label="Jabatan"
          placeholder="Pilih Jabatan"
          data={jabatanOptions}
          value={form.jabatan}
          onChange={(val) => setForm({ ...form, jabatan: val || '' })}
          required
        />

        <Select
          className={styles.textInput}
          label="Gaji Dipotong"
          placeholder="Pilih Gaji"
          data={aktifFields
            .filter(f => f.type === 'harian' && /^gaji\d+$/.test(f.field)) 
            .map(f => ({
              value: f.field.replace('gaji', ''),
              label: f.label, 
            }))
          }
          value={form.urutan_gaji_dipotong ? form.urutan_gaji_dipotong.toString() : ''}
          onChange={(val) => {
            if (val) {
              setForm({ ...form, urutan_gaji_dipotong: Number(val) });
            }
          }}
          searchable
          required
        />

        <NumberInput
          className={styles.textInput}
          label="Persen Potong (%)"
          value={form.persen_potong}
          onChange={(val) => setForm({ ...form, persen_potong: Number(val) })}
          min={0}
          max={100}
          required
        />

        <Select
          className={styles.textInput}
          label="Tipe Jam"
          placeholder="Pilih Tipe Jam"
          data={[
            { value: 'datang', label: 'Datang Terlambat' },
            { value: 'pulang', label: 'Pulang Cepat' },
            { value: 'tidak_absen_masuk', label: 'Tidak Presensi Masuk' },
            { value: 'tidak_absen_pulang', label: 'Tidak Presensi Pulang' },
          ]}
          value={form.tipe_jam}
          onChange={(val) => setForm({ ...form, tipe_jam: val || '' })}
          required
        />

        {form.tipe_jam !== 'tidak_absen_masuk' && form.tipe_jam !== 'tidak_absen_pulang' && (
          <NumberInput
            className={styles.textInput}
            label="Batas Menit"
            value={form.batas_menit}
            onChange={(val) => setForm({ ...form, batas_menit: Number(val) })}
            min={0}
            required
          />
        )}

        <Group justify="center" mt="xl">
          <Button
            variant="outline"
            size="sm"
            color="green"
            radius="md"
            onClick={handleSubmit}
            style={{ marginBottom: '1rem' }}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            style={{ marginBottom: '1rem' }}
            onClick={() => router.push('/potongan_keterlambatan')}
            disabled={isSubmitting}
          >
            Kembali
          </Button>
        </Group>
      </Container>
      <Footer />
    </>
  );
}