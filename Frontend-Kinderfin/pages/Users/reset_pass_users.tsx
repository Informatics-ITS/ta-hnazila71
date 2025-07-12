import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  TextInput,
  Select,
  Container,
  Paper,
  Title,
  Notification,
} from '@mantine/core';
import Cookies from 'js-cookie';
import Utils from '../../utils';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default function ResetPasswordUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [usersList, setUsersList] = useState<{ id: string; email: string }[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
      try {
        const res = await fetch(Utils.get_all_user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setUsersList(json.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
    if (!isValidUUID(formData.id)) {
      setError('ID harus berupa UUID yang valid.');
      setSuccess('');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Password dan konfirmasi harus sama.');
      setSuccess('');
      return;
    }

    try {
      const res = await fetch(`${Utils.reset_password}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          newPassword: formData.newPassword,
        }),
      });

      if (res.ok) {
        setSuccess('Password berhasil direset!');
        setError('');
        setFormData({ id: '', newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        setError(err.error || 'Gagal mereset password');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim permintaan');
      setSuccess('');
    }
  };

  return (
    <>
      <Header />
      <Container size="sm" mt="xl">
        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Title order={2} mb="md">Reset Password User</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select
              label="Pilih Email User"
              placeholder="Pilih email"
              data={usersList
                .filter((user) => user.email !== 'rootuser@gmail.com')
                .map((user) => ({ value: user.id, label: user.email }))}
              value={formData.id}
              onChange={(value) => setFormData((prev) => ({ ...prev, id: value || '' }))}
              required
            />
            <TextInput
              label="Password Baru"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              type="password"
              required
            />
            <TextInput
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type="password"
              required
            />
            <Button onClick={handleSubmit} variant="outline" size="sm" color="blue" radius="md">
              Reset Password
            </Button>
            {success && <Notification color="green">{success}</Notification>}
            {error && <Notification color="red">{error}</Notification>}
            <Button variant="outline" size="sm" color="gray" radius="md" onClick={() => router.push('/')}>
              Kembali
            </Button>
          </div>
        </Paper>
      </Container>
      <Footer />
    </>
  );
}