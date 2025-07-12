import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Utils from '../../../utils';
import Cookies from 'js-cookie';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import {
  Button,
  Title,
  Group,
  Loader,
  Center,
  Paper,
  Text,
  Notification,
  Badge,
  Modal,
  Textarea,
  Box,
} from '@mantine/core';
import styles from './pengajuan_perubahan_gaji.module.css';

export default function PengajuanPerubahanGajiPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [canApprove, setCanApprove] = useState(false);
  const [userMap, setUserMap] = useState<any>({});
  const [selectedId, setSelectedId] = useState('');
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const userData = userCookie ? JSON.parse(userCookie) : null;
    setUser(userData);

    // Check if user has approval rights (Admin, Bendahara, or Kepala Sekolah)
    if (userData) {
      const role = userData.role ? userData.role.toLowerCase() : '';
      const approvalRoles = ['admin', 'bendahara', 'kepala sekolah'];
      setCanApprove(approvalRoles.includes(role));
    }
  }, []);

  const fetchData = async () => {
    if (!user?.access_token) return;
  
    try {
      setLoading(true);
  
      // Fetch data pengajuan
      const resPengajuan = await fetch(Utils.get_pengajuan_perubahan_gaji, {
        headers: { 'Authorization': `Bearer ${user.access_token}` },
      });
      const jsonPengajuan = await resPengajuan.json();
      if (resPengajuan.ok) {
        setData(jsonPengajuan.data);
        // LOG 1: Tampilkan 1 item pengajuan untuk melihat user_id nya
        console.log('CONTOH DATA PENGAJUAN:', jsonPengajuan.data[0]); 
      } else {
        setError(jsonPengajuan.message || 'Gagal mengambil data pengajuan');
      }
  
      // Fetch data semua user
      const resUsers = await fetch(Utils.get_all_user, {
        headers: { 'Authorization': `Bearer ${user.access_token}` },
      });
      const jsonUsers = await resUsers.json();
      if (resUsers.ok) {
        // LOG 2: Tampilkan data mentah dari API user
        console.log('DATA USER MENTAH DARI API:', jsonUsers);
  
        const map = jsonUsers.data.reduce((acc: any, currentUser: any) => {
          acc[currentUser.id] = currentUser;
          return acc;
        }, {});
        setUserMap(map);
        // LOG 3: Tampilkan peta user yang sudah jadi
        console.log('PETA USER YANG DIBUAT (USER MAP):', map);
      } else {
         console.error('GAGAL MENGAMBIL DATA USER:', jsonUsers);
      }
  
    } catch (err) {
      console.error('TERJADI ERROR:', err);
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };
    
  // useEffect tetap sama, akan memanggil fetchData yang sudah kita modifikasi
  useEffect(() => {
    if (user?.access_token) {
      fetchData();
    }
  }, [user]);
  
  // Define a proper return type for the function
  type UpdateStatusResult = { success: boolean; data: any } | null;

  const updatePengajuanStatus = async (id: string, status: 'approved' | 'rejected', reason?: string): Promise<UpdateStatusResult> => {
    if (!user?.access_token) return null;
    
    try {
      const statusUrl = Utils.update_pengajuan_perubahan_gaji_status(id);
      
      console.log('Mencoba request ke URL dari Utils:', statusUrl);
      console.log('Dengan token:', user.access_token.substring(0, 10) + '...');
      
      const requestBody: any = { status };
      if (status === 'rejected' && reason) {
        requestBody.rejection_reason = reason;
      }
      
      const res = await fetch(statusUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      console.log('Response status:', res.status);
      
      let responseData;
      try {
        responseData = await res.json();
        console.log('Response data:', responseData);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        const text = await res.text();
        console.log('Response text:', text);
        responseData = { message: text || 'No response body' };
      }
      
      return { 
        success: res.ok, 
        data: responseData 
      };
    } catch (err: any) {
      console.error('Request failed details:', err);
        return {
          success: false,
          data: { 
            message: `Gagal terhubung ke server: ${err.message}. Silakan periksa koneksi jaringan Anda atau server backend.` 
          }
        };
    }
  };

  const handleApprove = async (id: string) => {
    if (!user?.access_token) return;
    
    try {
      setProcessingAction(true);
      setSelectedId(id);
      setError('');
      
      const result = await updatePengajuanStatus(id, 'approved');
      
      if (result && result.success) {
        setSuccess(result.data.message || 'Pengajuan berhasil disetujui');
        fetchData();
      } else {
        setError(result?.data?.message || 'Gagal menyetujui pengajuan');
      }
    } catch (err: any) {
      console.error('Gagal menyetujui pengajuan', err);
      setError(`Gagal terhubung ke server: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessingAction(false);
      setSelectedId('');
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedId(id);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleReject = async () => {
    if (!user?.access_token || !selectedId || !rejectionReason) {
      setError('Alasan penolakan wajib diisi');
      return;
    }
    
    try {
      setProcessingAction(true);
      setError('');
      
      const result = await updatePengajuanStatus(selectedId, 'rejected', rejectionReason);
      
      if (result && result.success) {
        setSuccess(result.data.message || 'Pengajuan berhasil ditolak');
        setRejectionModalOpen(false);
        fetchData();
      } else {
        setError(result?.data?.message || 'Gagal menolak pengajuan');
      }
    } catch (err: any) {
      console.error('Gagal menolak pengajuan', err);
      setError(`Gagal terhubung ke server: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge color="yellow">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge color="green">Disetujui</Badge>;
      case 'rejected':
        return <Badge color="red">Ditolak</Badge>;
      default:
        return <Badge color="yellow">Pending</Badge>;
    }
  };

  if (loading && data.length === 0) {
    return (
      <>
        <Header />
        <Center mt="xl">
          <Loader color="orange" />
        </Center>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <Box style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000, width: '300px' }}>
        {success && (
          <Notification
            color="green"
            title="Berhasil"
            onClose={() => setSuccess('')}
            mb="md"
          >
            {success}
          </Notification>
        )}

        {error && (
          <Notification
            color="red"
            title="Gagal"
            onClose={() => setError('')}
          >
            {error}
          </Notification>
        )}
      </Box>
      
      <div style={{ marginTop: '2rem' }} className={`${styles.page_wrapper} ${styles.centered}`}>
        <Title order={2} mb="lg">Daftar Pengajuan Perubahan Gaji</Title>

        <Group mb="xl">
          <Button   
            variant="outline"
            size="sm"
            color="gray"
            radius="md" 
            onClick={() => router.push('/')}
          >
            Kembali
          </Button>
        </Group>

        {data.length === 0 ? (
          <Text>Belum ada pengajuan</Text>
        ) : (
          data.map((item, idx) => (
            <Paper key={idx} shadow="sm" p="md" mb="md" withBorder>
              <Group justify="apart" mb="xs">
                <Text fw={500}>Tanggal: {item.tanggal}</Text>
                {getStatusBadge(item.status)}
              </Group>

              {/* ===== INI SATU-SATUNYA PERUBAHAN ===== */}
              {/* Tampilkan baris Email hanya jika role BUKAN 'guru' */}
              {user?.role?.toLowerCase() !== 'guru' && (
                <Text fw={500}>
                  Email: {userMap[item.user_id]?.email || 'Mencari...'}
                </Text>
              )}
              
              <Text fw={500}>Keterangan: {item.keterangan || '-'}</Text>
              
              {item.status === 'rejected' && item.rejection_reason && (
                <Text fw={500} color="red" mt="xs">Alasan Penolakan: {item.rejection_reason}</Text>
              )}
              
              {item.status === 'approved' && item.approved_by && (
                <Text fw={500} color="green" mt="xs">Disetujui oleh: {item.approved_by}</Text>
              )}
              
              {item.status === 'approved' && item.approved_at && (
                <Text fw={500} color="green">Tanggal Persetujuan: {new Date(item.approved_at).toLocaleDateString()}</Text>
              )}
              
              <Group mt="sm">
                <div>
                  <Text size="sm">Foto Bukti:</Text>
                  <img
                    src={`${Utils.backend_base}${item.foto_bukti_path}`}
                    alt="Foto Bukti"
                    width={150}
                    height={150}
                    style={{ objectFit: 'cover', border: '1px solid #eee', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <Text size="sm">Foto Gaji:</Text>
                  <img
                    src={`${Utils.backend_base}${item.foto_gaji_path}`}
                    alt="Foto Gaji"
                    width={150}
                    height={150}
                    style={{ objectFit: 'cover', border: '1px solid #eee', borderRadius: '4px' }}
                  />
                </div>
              </Group>
              
              {/* Approval/Rejection buttons only for authorized roles and pending requests */}
              {canApprove && (!item.status || item.status === 'pending') && (
                <Group mt="md">
                  <Button
                    variant="outline"
                    color="green"
                    size="xs"
                    onClick={() => handleApprove(item.id)}
                    loading={processingAction && selectedId === item.id}
                  >
                    Setujui
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    size="xs"
                    onClick={() => openRejectModal(item.id)}
                    loading={processingAction && selectedId === item.id}
                  >
                    Tolak
                  </Button>
                </Group>
              )}
            </Paper>
          ))
        )}
      </div>
      
      {/* Rejection Modal */}
      <Modal
        opened={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        title="Masukkan Alasan Penolakan"
        centered
      >
        <Textarea
          placeholder="Alasan penolakan"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.currentTarget.value)}
          required
          mb="md"
          minRows={3}
        />
        <Group justify="right">
          <Button
            variant="outline"
            color="gray"
            onClick={() => setRejectionModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            color="red"
            onClick={handleReject}
            loading={processingAction}
            disabled={!rejectionReason.trim()}
          >
            Tolak Pengajuan
          </Button>
        </Group>
      </Modal>
      
      <Footer />
    </>
  );
}