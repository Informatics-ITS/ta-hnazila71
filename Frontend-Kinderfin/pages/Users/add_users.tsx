import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  TextInput,
  Container,
  Paper,
  Title,
  Stack,
  Notification,
  Select,
  Modal,
  Text,
  Grid,
  Space,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import Cookies from 'js-cookie';
import Utils from '../../utils'; // Pastikan Utils berisi base URL
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './add_users.module.css';

const isValidUUID = (id: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default function AddUserPage() {
  const router = useRouter();
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    role: '',
    nama_bank: 'Bank BCA',
    pemilik_rekening: '',
    nomor_rekening: '',
    email: '',
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [updateFormData, setUpdateFormData] = useState({
    id: '',
    role: '',
  });
  const [deleteStatus, setDeleteStatus] = useState<{ success: string; error: string }>({ success: '', error: '' });
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');

  useEffect(() => {
    const fetchUsersAndTeachers = async () => {
      const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
      try {
        const [teachersRes, usersRes] = await Promise.all([
          fetch(Utils.get_all_teacher, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(Utils.get_all_user, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const teachersJson = await teachersRes.json();
        const usersJson = await usersRes.json();
        if (teachersRes.ok) setTeachersList(teachersJson.data);
        if (usersRes.ok) setUsersList(usersJson.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchUsersAndTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
    try {
      const res = await fetch(Utils.tambah_user, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('User berhasil ditambahkan!');
        setError('');
        setFormData({
          nip: '',
          nama_lengkap: '',
          role: 'Guru',
          nama_bank: 'Bank BCA',
          pemilik_rekening: '',
          nomor_rekening: '',
          email: '',
          password: '',
        });
        // Refresh user list
        const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
        const usersRes = await fetch(Utils.get_all_user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersJson = await usersRes.json();
        if (usersRes.ok) setUsersList(usersJson.data);
      } else {
        const err = await res.json();
        setError(err.error || 'Gagal menambahkan user');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim data');
      setSuccess('');
    }
  };

  const handleUpdateChange = (field: string, value: string) => {
    setUpdateFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
    if (!isValidUUID(updateFormData.id)) {
      setError('ID harus bertipe UUID yang valid.');
      setSuccess('');
      return;
    }
    try {
      const res = await fetch(Utils.update_user(updateFormData.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateFormData),
      });

      if (res.ok) {
        setSuccess('User berhasil diupdate!');
        setError('');
        // Refresh user list
        const usersRes = await fetch(Utils.get_all_user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersJson = await usersRes.json();
        if (usersRes.ok) setUsersList(usersJson.data);
      } else {
        const err = await res.json();
        setError(err.error || 'Gagal mengupdate user');
        setSuccess('');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat update data');
      setSuccess('');
    }
  };

  const confirmDelete = async () => {
    setModalOpened(false);
    if (!selectedUserId) return;
    const token = Cookies.get('user') ? JSON.parse(Cookies.get('user')!).access_token : '';
    try {
      const res = await fetch(Utils.delete_user(selectedUserId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsersList(usersList.filter(user => user.id !== selectedUserId));
        setDeleteStatus({ success: 'User berhasil dihapus!', error: '' });
        setSuccess('User berhasil dihapus!');
        setError('');
      } else {
        const err = await res.json();
        let errorMessage = err.error || 'Gagal menghapus user';
        
        if (err.error && err.error.includes('foreign key constraint')) {
          errorMessage = 'User tidak dapat dihapus karena masih memiliki data pengeluaran rumah tangga yang terkait. Hapus terlebih dahulu data pengeluaran user ini.';
        } else if (err.error && err.error.includes('violates foreign key')) {
          errorMessage = 'User tidak dapat dihapus karena masih memiliki data terkait di sistem. Silakan hapus data terkait terlebih dahulu.';
        }
        
        setDeleteStatus({ success: '', error: errorMessage });
        setError(errorMessage);
        setSuccess('');
      }
    } catch (err) {
      setDeleteStatus({ success: '', error: 'Terjadi kesalahan saat menghapus user' });
      setError('Terjadi kesalahan saat menghapus user');
      setSuccess('');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.page_wrapper} style={{ minHeight: '100vh', paddingBottom: '80px' }}>
        <Container size="xl" py="xl">
          {/* Global Notifications */}
          {success && (
            <Notification color="green" onClose={() => setSuccess('')} mb="lg">
              {success}
            </Notification>
          )}
          {error && (
            <Notification color="red" onClose={() => setError('')} mb="lg">
              {error}
            </Notification>
          )}

          {/* Add New User Form */}
          <Paper p="xl" shadow="sm" radius="md" withBorder mb="xl">
            <Title order={2} mb="lg" className={styles.title}>
              Tambah User Baru
            </Title>
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <TextInput 
                    label="NIP" 
                    name="nip" 
                    value={formData.nip} 
                    onChange={handleChange} 
                    required 
                  />
                  <TextInput 
                    label="Nama Lengkap" 
                    name="nama_lengkap" 
                    value={formData.nama_lengkap} 
                    onChange={handleChange} 
                    required 
                  />
                  <Select
                    label="Role"
                    name="role"
                    placeholder="Pilih role"
                    data={[
                      { value: 'Guru', label: 'Guru' },
                      { value: 'Bendahara', label: 'Bendahara' },
                      { value: 'Sekretaris', label: 'Sekretaris' },
                    ]}
                    value={formData.role}
                    onChange={(value) => setFormData({ ...formData, role: value || '' })}
                    required
                  />
                  <TextInput 
                    label="Email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <TextInput 
                    label="Pemilik Rekening" 
                    name="pemilik_rekening" 
                    value={formData.pemilik_rekening} 
                    onChange={handleChange} 
                    required 
                  />
                  <TextInput 
                    label="Nomor Rekening" 
                    name="nomor_rekening" 
                    value={formData.nomor_rekening} 
                    onChange={handleChange} 
                    required 
                  />
                  <TextInput 
                    label="Password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    type="password" 
                    required 
                  />
                </Stack>
              </Grid.Col>
            </Grid>
            
            <Space h="xl" />
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button 
                onClick={handleSubmit} 
                variant="filled" 
                color="blue" 
                radius="md"
                size="md"
              >
                Tambah User
              </Button>
              <Button 
                variant="outline" 
                color="gray" 
                radius="md" 
                size="md"
                onClick={() => router.push('/')}
              >
                Kembali 
              </Button>
            </div>
          </Paper>

          <Space h="xl" />

          {/* Update and User List Section */}
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Paper p="xl" shadow="sm" radius="md" withBorder style={{ height: 'fit-content' }}>
                <Title order={3} mb="lg" className={styles.title}>
                  Update Role User
                </Title>
                <Stack gap="lg">
                  <Select
                    label="Pilih User"
                    placeholder="Pilih user"
                    data={usersList
                      .filter((user) =>
                        user.email !== 'rootuser@gmail.com' &&
                        teachersList.some((teacher) => teacher.id === user.id_informasi_tambahan)
                      )
                      .map((user) => {
                        const teacher = teachersList.find((teacher) => teacher.id === user.id_informasi_tambahan);
                        return {
                          value: user.id,
                          label: teacher ? `${teacher.nip} - ${teacher.nama_lengkap}` : user.email,
                        };
                      })}
                    value={updateFormData.id}
                    onChange={(value) => handleUpdateChange('id', value || '')}
                    required
                  />
                  <Select
                    label="Pilih Role"
                    placeholder="Pilih role"
                    data={[
                      { value: 'Bendahara', label: 'Bendahara' },
                      { value: 'Sekretaris', label: 'Sekretaris' },
                      { value: 'Guru', label: 'Guru' },
                    ]}
                    value={updateFormData.role}
                    onChange={(value) => handleUpdateChange('role', value || '')}
                    required
                  />
                  <Button 
                    onClick={handleUpdate} 
                    variant="filled" 
                    color="teal" 
                    radius="md"
                    size="md"
                    fullWidth
                  >
                    Update User
                  </Button>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Paper 
                p="xl" 
                shadow="sm" 
                radius="md" 
                withBorder 
                style={{ height: '450px' }}
              >
                <Title order={3} mb="lg" className={styles.title}>
                  Daftar Semua User
                </Title>
                <div style={{ 
                  height: 'calc(100% - 80px)', 
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  <Stack gap="md">
                    {usersList.length > 0 ? (
                      usersList
                        .filter((user) => user.email !== 'rootuser@gmail.com')
                        .map((user) => {
                          const teacher = teachersList.find((teacher) => teacher.id === user.id_informasi_tambahan);
                          return (
                            <Paper key={user.id} p="md" withBorder shadow="xs" radius="sm">
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                gap: '16px'
                              }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ 
                                    fontWeight: 600, 
                                    marginBottom: '6px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.95rem'
                                  }}>
                                    {teacher ? teacher.nama_lengkap : user.email}
                                  </div>
                                  <div style={{ 
                                    color: '#666', 
                                    fontSize: '0.85rem',
                                    marginBottom: '4px'
                                  }}>
                                    Jabatan: {user.role}
                                  </div>
                                  {teacher && (
                                    <div style={{ 
                                      color: '#888', 
                                      fontSize: '0.8rem'
                                    }}>
                                      NIP: {teacher.nip}
                                    </div>
                                  )}
                                </div>
                                <IconTrash
                                  style={{ 
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    padding: '4px'
                                  }}
                                  color="#dc2626"
                                  size={20}
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setSelectedUserName(teacher ? teacher.nama_lengkap : user.email);
                                    setModalOpened(true);
                                  }}
                                />
                              </div>
                            </Paper>
                          );
                        })
                    ) : (
                      <Text c="dimmed" ta="center" py="xl">
                        Tidak ada user tersedia.
                      </Text>
                    )}
                  </Stack>
                </div>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        title="Konfirmasi Hapus User"
      >
        <Text mb="lg">
          Apakah Anda yakin ingin menghapus user <strong>{selectedUserName}</strong>?
        </Text>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outline"
            color="gray"
            radius="md"
            onClick={() => setModalOpened(false)}
          >
            Batal
          </Button>
          <Button
            variant="filled"
            color="red"
            radius="md"
            onClick={confirmDelete}
          >
            Ya, Hapus
          </Button>
        </div>
      </Modal>

      <Footer />
    </>
  );
}