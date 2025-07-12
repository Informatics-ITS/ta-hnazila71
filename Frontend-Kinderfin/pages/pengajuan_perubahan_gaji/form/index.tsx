import React, { useState } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Container,
  Group,
  FileInput,
  Loader,
  Center,
  Notification,
} from '@mantine/core';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import Utils from '../../../utils';
import styles from '../daftar/pengajuan_perubahan_gaji.module.css';

export default function PengajuanFormPage() {
  const router = useRouter();
  const [tanggal, setTanggal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [fotoBukti, setFotoBukti] = useState<File | null>(null);
  const [fotoGaji, setFotoGaji] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!tanggal || !fotoBukti || !fotoGaji) {
      setError('Harap lengkapi semua field wajib.');
      return;
    }

    const userCookie = Cookies.get('user');
    const user = userCookie ? JSON.parse(userCookie) : null;
    if (!user?.access_token) return;

    const formData = new FormData();
    formData.append('tanggal', tanggal);
    formData.append('keterangan', keterangan);
    formData.append('foto_bukti', fotoBukti);
    formData.append('foto_gaji', fotoGaji);

    setLoading(true);

    try {
      const res = await fetch(Utils.post_pengajuan_perubahan_gaji, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        body: formData,
      });

      const resJson = await res.json();
      if (res.ok) {
        setSuccess('Pengajuan berhasil diajukan.');
        setTimeout(() => {
          router.push('/pengajuan_perubahan_gaji/daftar');
        }, 1500);
      } else {
        setError(resJson.error || 'Gagal mengajukan pengajuan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim pengajuan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      {success && (
        <Notification color="green" title="Berhasil" onClose={() => setSuccess('')}>
          {success}
        </Notification>
      )}
      {error && (
        <Notification color="red" title="Gagal" onClose={() => setError('')}>
          {error}
        </Notification>
      )}
      <div style={{ marginTop: '2rem' }} className={`${styles.page_wrapper} ${styles.centered}`}>
        <Container size="sm" py="md">
          <Paper withBorder shadow="md" p="lg" radius="md" className={styles.form_card}>
            <Title order={2} className={styles.title} mb="lg">Ajukan Perubahan Gaji</Title>

            <TextInput
              label="Tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.currentTarget.value)}
              required
            />

            <Textarea
              label="Keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.currentTarget.value)}
              mt="md"
            />

            {/* MODIFIKASI DI BAWAH INI */}
            <FileInput
              label="Foto Bukti"
              placeholder="Unggah foto bukti (JPG, JPEG, PNG)"
              onChange={setFotoBukti}
              accept="image/jpeg, image/png, image/jpg"
              mt="md"
              required
            />

            {/* MODIFIKASI DI BAWAH INI */}
            <FileInput
              label="Foto Gaji"
              placeholder="Unggah foto gaji (JPG, JPEG, PNG)"
              onChange={setFotoGaji}
              accept="image/jpeg, image/png, image/jpg"
              mt="md"
              required
            />

            <Group justify="center" mt="lg" className={styles.center_button}>
              <Button 
                variant="outline"
                size="sm"
                color="gray"
                radius="md" 
                onClick={() => router.push('/')}
              >
                Kembali
              </Button>
              <Button
                variant="outline"
                size="sm"
                color="blue"
                radius="md" 
                onClick={handleSubmit} 
                loading={loading}
              >
                Ajukan
              </Button>
            </Group>
          </Paper>
        </Container>
      </div>
      <Footer />
    </>
  );
}