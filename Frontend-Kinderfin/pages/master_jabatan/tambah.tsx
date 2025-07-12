import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './master_jabatan.module.css'; 
import {
  TextInput,
  Button,
  Title,
  Container,
  Grid,
  Group,
  Notification,
} from '@mantine/core';

export default function TambahJabatan() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<any>({ jabatan: '' });
  const [aktifFields, setAktifFields] = useState<{ field: string, label: string, type: string }[]>([]);
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
        const data = await res.json();
        setAktifFields(data.aktif || []);
      } catch (error) {
        console.error('Gagal mengambil field aktif:', error);
      }
    };

    fetchAktifFields();
  }, []);

  const formatRibuan = (val: string | number) => {
    const num = typeof val === 'number' ? val : parseInt(val.replace(/,/g, '')) || 0;
    return num.toLocaleString('en-US');
  };

  const parseToNumber = (val: string): number => {
    if (!val) return 0;
    return parseInt(val.replace(/,/g, '')) || 0;
  };

  const handleChange = (key: string, value: string) => {
    const isGajiField = key.startsWith('gaji') || key.startsWith('gaji_pokok');
    const cleaned = isGajiField ? value.replace(/[^\d,]/g, '') : value;
    setForm((prev: any) => ({
      ...prev,
      [key]: cleaned,
    }));
  };

  const handleSubmit = async () => {
    const cleanedData: any = {
      jabatan: form.jabatan,
    };

    aktifFields.forEach(({ field }) => {
      cleanedData[field] = parseToNumber(form[field] || '0');
    });

    try {
      const res = await fetch(Utils.tambah_jabatan, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      if (res.ok) {
        setSuccess('Jabatan berhasil ditambahkan');
        setError('');
        setTimeout(() => router.push('/master_jabatan'), 1000);
      } else {
        const err = await res.json();
        setError(err.message || 'Gagal menambah jabatan');
        setSuccess('');
      }
    } catch (error) {
      console.error(error);
      setError('Terjadi kesalahan');
      setSuccess('');
    }
  };

  return (
    <>
      <Header />
      <Container mt="xl">
        <Title order={2} mb="md" style={{ fontFamily: 'Poppins, sans-serif' }}>Tambah Jabatan Baru</Title>

        <div className={styles.formGlobal}>
          <TextInput
            label="Nama Jabatan"
            value={form.jabatan}
            onChange={(e) => handleChange('jabatan', e.currentTarget.value)}
          />

          <Title order={4} mt="xl">Gaji Harian</Title>
          <Grid>
            {aktifFields.filter(f => f.type === 'harian').map((fieldData, i) => (
              <Grid.Col span={3} key={`harian-${i}`}>
                <TextInput
                  label={fieldData.label}
                  value={formatRibuan(form[fieldData.field] || '0')}
                  onChange={(e) => handleChange(fieldData.field, e.currentTarget.value)}
                />
              </Grid.Col>
            ))}
          </Grid>

          <Title order={4} mt="xl">Gaji Pokok</Title>
          <Grid>
            {aktifFields.filter(f => f.type === 'pokok').map((fieldData, i) => (
              <Grid.Col span={3} key={`pokok-${i}`}>
                <TextInput
                  label={fieldData.label}
                  value={formatRibuan(form[fieldData.field] || '0')}
                  onChange={(e) => handleChange(fieldData.field, e.currentTarget.value)}
                />
              </Grid.Col>
            ))}
          </Grid>

          <Group mt="lg">
            <Button
              variant="outline"
              size="sm"
              color="green"
              radius="md" onClick={handleSubmit}>Simpan</Button>
            <Button
              variant="outline"
              size="sm"
              color="gray"
              radius="md"
              onClick={() => router.push("/master_jabatan")}
            >
              Batal
            </Button>
          </Group>
          {success && (
            <Notification color="green" mt="md" onClose={() => setSuccess('')}>
              {success}
            </Notification>
          )}
          {error && (
            <Notification color="red" mt="md" onClose={() => setError('')}>
              {error}
            </Notification>
          )}
        </div>
      </Container>
      <Footer />
    </>
  );
}
