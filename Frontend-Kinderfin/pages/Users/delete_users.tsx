import { IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { Container, Paper, Title, Button, Notification, Modal, Text } from '@mantine/core';
import Cookies from 'js-cookie';
import Utils from '../../utils';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useRouter } from 'next/router';
import styles from './add_users.module.css';

export default function DeleteUserPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const router = useRouter();
  const [teachersList, setTeachersList] = useState<any[]>([]);
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
      } else {
        const err = await res.json();
        setDeleteStatus({ success: '', error: err.error || 'Gagal menghapus user' });
      }
    } catch (err) {
      setDeleteStatus({ success: '', error: 'Terjadi kesalahan saat menghapus user' });
    }
  };

  return (
    <>
      <Header />
      <Container size="lg" mt="xl" className={styles.formGlobal}>
      <Button variant="outline" size="sm" color="gray" radius="md" onClick={() => router.push('/')} style={{ marginBottom: '1rem' }}>
        Kembali
      </Button>
        <Paper p="md" shadow="xs" radius="md" withBorder className={styles.card}>
          <Title order={2} mb="md" className={styles.title}>Hapus User</Title>
          {deleteStatus.success && <Notification className={styles.notification} color="green">{deleteStatus.success}</Notification>}
          {deleteStatus.error && <Notification className={styles.notification} color="red">{deleteStatus.error}</Notification>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {usersList.length > 0 ? (
              usersList
                .filter((user) => user.email !== 'rootuser@gmail.com')
                .map((user) => {
                  const teacher = teachersList.find((teacher) => teacher.id === user.id_informasi_tambahan);
                  return (
                    <Paper key={user.id} p="sm" withBorder shadow="xs" className={styles.card} >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className={styles.cardHeader}>{teacher ? teacher.nama_lengkap : user.email}</div>
                          <div style={{ color: 'black' }}>Jabatan: {user.role}</div>
                        </div>
                        <IconTrash
                          style={{ cursor: 'pointer' }}
                          color="red"
                          size={18}
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
              <div>Tidak ada user tersedia.</div>
            )}
          </div>
        </Paper>
      </Container>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        centered
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        classNames={{ title: styles.modalTitle }}
        title="Konfirmasi Hapus User"
      >
        <Text className={styles.modalText}>
          Apakah Anda yakin ingin menghapus user <b>{selectedUserName}</b>?
        </Text>
        <div className={styles.modalButtonGroup}>
          <Button
            variant="outline"
            size="sm"
            color="red"
            radius="md"
            onClick={confirmDelete}
            className={styles.deleteButton}
          >
            Ya, Hapus
          </Button>
          <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            onClick={() => setModalOpened(false)}
            className={styles.backButton}
          >
            Batal
          </Button>
        </div>
      </Modal>
      <Footer />
    </>
  );
}