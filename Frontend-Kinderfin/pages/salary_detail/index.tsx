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
  Table,
  Loader,
  Center,
  Paper,
  Text,
  TextInput,
  Select,
  FileButton,
  Notification,
} from '@mantine/core';
import styles from './salary_detail.module.css'; 

const isValidYYYYMMDD = (dateString: string): boolean => {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-').map(Number);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day &&
         !isNaN(date.getTime());
};


export default function SalaryDetailIndex() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [jabatanList, setJabatanList] = useState<string[]>([]);
  const [selectedJabatan, setSelectedJabatan] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadKey, setUploadKey] = useState(0);
  const [lastUploadInfo, setLastUploadInfo] = useState<{ nama: string; nama_file: string; tanggal?: string } | null>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [filterEmail, setFilterEmail] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [currentUploadedFile, setCurrentUploadedFile] = useState<string | null>(null);
  const [pollingSeconds, setPollingSeconds] = useState(0);
  const [allUploadedFiles, setAllUploadedFiles] = useState<{ file: string; tanggal?: string }[]>([]);

  const [fingerspotStartDate, setFingerspotStartDate] = useState('');
  const [fingerspotEndDate, setFingerspotEndDate] = useState('');
  const [isFetchingFingerspot, setIsFetchingFingerspot] = useState(false);
  const [fingerspotFetchStatus, setFingerspotFetchStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Gagal mem-parse cookie user:", e);
      }
    }

    const uploadSuccess = sessionStorage.getItem('salary_upload_success');
    if (uploadSuccess) {
      setSuccess('File berhasil diunggah dan diproses.');
      sessionStorage.removeItem('salary_upload_success');
    }
  }, []);
  
  useEffect(() => {
    const fetchAllFiles = async () => {
      if (!user?.access_token || allLogs.length === 0) return;
      try {
        const listFilesUrl = `${Utils.upload_salary_csv}/list-salary-files`;

        const res = await fetch( listFilesUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.access_token}`,
            },
          }
        );
        const json = await res.json();
        if (res.ok && Array.isArray(json.files)) {
          const combined = json.files.map((file: any) => {
            const fileName = typeof file === 'string' ? file : (file?.name || file?.filename || JSON.stringify(file));
            const logEntry = allLogs.find((logDetail) =>
              logDetail.description?.toLowerCase().includes(fileName.toLowerCase())
            );
            
            let dateFromFile = '';
            if (!logEntry?.created_at) {
              const timestampMatch = fileName.match(/^(\d+)-/); 
              if (timestampMatch && timestampMatch[1]) {
                const ms = parseInt(timestampMatch[1]);
                if (!isNaN(ms)) {
                  dateFromFile = new Date(ms).toISOString();
                }
              }
            }
            return {
              file: fileName,
              tanggal: logEntry?.created_at || dateFromFile || '', 
            };
          });
          
          setAllUploadedFiles(combined);
        } else {
          console.error('Gagal fetch daftar file:', json.message || json.error || 'Struktur respons tidak sesuai');
        }
      } catch (err) {
        console.error('Gagal mengambil semua file:', err);
      }
    };

    if (user?.access_token && allLogs.length > 0) {
        fetchAllFiles();
    }
  }, [user, allLogs]);

  useEffect(() => {
    const isUploadingSession = sessionStorage.getItem('uploading_salary') === 'true';
    const startTimeSession = sessionStorage.getItem('upload_salary_start_time');

    if (isUploadingSession) {
      setUploading(true);
      if (startTimeSession) {
        const elapsed = Math.floor((Date.now() - parseInt(startTimeSession)) / 1000);
        setPollingSeconds(elapsed > 0 ? elapsed : 0);
      }
    } else {
        setUploading(false);
        setPollingSeconds(0);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.access_token) {
        setLoading(false); 
        return;
      }
      setLoading(true); 
      try {
        const res = await fetch(Utils.get_all_teacher, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });
        const resJson = await res.json();
        if (res.ok && Array.isArray(resJson.data)) {
          // Sembunyikan data Admin dari daftar dan filter
          const nonAdminData = resJson.data.filter((d: any) => d.jabatan !== 'Admin');
          
          setData(nonAdminData);
          setFilteredData(nonAdminData); 
          
          const jabatanSet = new Set<string>(nonAdminData.map((d: any) => d.jabatan).filter(Boolean)); 
          setJabatanList(Array.from(jabatanSet));

        } else {
          setError(resJson.message || resJson.error || 'Gagal memuat data guru.');
        }
      } catch (err) {
        console.error('Gagal mengambil data guru:', err);
        setError('Terjadi kesalahan saat mengambil data guru.');
      } finally {
        setLoading(false);
      }
    };

    if (user) { 
        fetchData();
    } else {
        setLoading(false); 
    }
  }, [user]);

  useEffect(() => {
    const fetchAllLogs = async () => {
      if (!user?.access_token) return;
      try {
        const res = await fetch(Utils.get_all_activity_log, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });
        const resJson = await res.json();
        if (res.ok && Array.isArray(resJson)) {
          setAllLogs(resJson); 
        } else {
          console.error('Gagal mengambil log aktivitas:', resJson.message || resJson.error || 'Format respons log tidak sesuai');
        }
      } catch (err) {
        console.error('Gagal fetch semua log aktivitas:', err);
      }
    };
    if (user?.access_token) { 
        fetchAllLogs();
    }
  }, [user]);

  useEffect(() => {
    let result = data;
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter((d) =>
        d.nama_lengkap?.toLowerCase().includes(searchTerm) ||
        d.nip?.includes(searchTerm) 
      );
    }
    if (selectedJabatan) {
      result = result.filter((d) => d.jabatan === selectedJabatan);
    }
    setFilteredData(result);
  }, [search, selectedJabatan, data]);

  const handleFileUpload = async (file: File | null) => {
    if (!file || !user?.access_token) {
      setError("File tidak dipilih atau sesi pengguna tidak valid.");
      return;
    }
    
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentUploadId(uploadId);
    
    setCurrentUploadedFile(file.name); 
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true); 
    setSuccess(''); 
    setError('');
    setPollingSeconds(0); 
    
    sessionStorage.setItem('uploading_salary', 'true');
    sessionStorage.setItem('upload_salary_start_time', Date.now().toString());
    sessionStorage.setItem('current_upload_id', uploadId);
    sessionStorage.setItem('upload_filename', file.name);
    
    setUploadKey(prev => prev + 1); 
    
    try {
      const res = await fetch(Utils.upload_salary_csv, { 
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.access_token}`, 
        },
        body: formData,
      });
      const result = await res.json();

      const activeUploadId = sessionStorage.getItem('current_upload_id');
      if (activeUploadId !== uploadId) {
        console.log('Upload session changed, ignoring response');
        return;
      }

      if (!res.ok) {
        setError(result.message || result.error || 'Gagal memulai proses unggah file.');
        resetUploadState();
        return;
      }
      
      if (result.success === false || result.error) {
        setError(result.message || result.error || 'Server menolak file yang diunggah.');
        resetUploadState();
        return;
      }
      
      console.log('Upload initiated successfully, starting polling for session:', uploadId);
      
    } catch (err) {
      console.error('Network error during upload:', err);
      
      const activeUploadId = sessionStorage.getItem('current_upload_id');
      if (activeUploadId === uploadId) {
        setError('Terjadi kesalahan teknis saat unggah file.');
        resetUploadState();
      }
    }
  };

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | undefined;
    let timerInterval: NodeJS.Timeout | undefined;
    
    const fetchLastUpload = async () => {
      const activeUploadId = sessionStorage.getItem('current_upload_id');
      const isUploadingActive = sessionStorage.getItem('uploading_salary') === 'true';
      
      if (!activeUploadId || !isUploadingActive || !user?.access_token) {
        if (pollingInterval) clearInterval(pollingInterval);
        if (timerInterval) clearInterval(timerInterval);
        return;
      }
      
      try {
        const res = await fetch(Utils.get_all_activity_log, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
        });
        const resJson = await res.json();
        
        if (res.ok && Array.isArray(resJson)) {
          const startTime = sessionStorage.getItem('upload_salary_start_time');
          const uploadedFileName = sessionStorage.getItem('upload_filename');
          const thresholdTime = startTime ? parseInt(startTime) : 0;
          
          const relevantLogs = resJson.filter((item: any) => {
            const isCorrectModule = item.module === 'Salary Detail';
            const isAfterThreshold = new Date(item.created_at).getTime() > thresholdTime;
            const containsFileName = uploadedFileName && 
              item.description?.toLowerCase().includes(uploadedFileName.toLowerCase());
            
            return isCorrectModule && isAfterThreshold && containsFileName;
          });

          const errorLog = relevantLogs.find((item: any) => 
            item.action?.toLowerCase().includes('error') || 
            item.action?.toLowerCase().includes('fail') ||
            item.description?.toLowerCase().includes('gagal') ||
            item.description?.toLowerCase().includes('error') ||
            item.description?.toLowerCase().includes('format')
          );

          if (errorLog) {
            if (sessionStorage.getItem('current_upload_id') === activeUploadId) {
              setError(errorLog.description || 'Terjadi kesalahan saat memproses file.');
              resetUploadState();
            }
            if (pollingInterval) clearInterval(pollingInterval);
            if (timerInterval) clearInterval(timerInterval);
            return;
          }
          
          const successLog = relevantLogs.find((item: any) => 
            item.action === 'Upload File Presensi Gaji' &&
            (item.description?.toLowerCase().includes('upload file presensi gaji:') || 
            item.description?.toLowerCase().includes('mengunggah file salary detail:'))
          );

          if (successLog) {
            if (sessionStorage.getItem('current_upload_id') === activeUploadId) {
              let nama_file = uploadedFileName || 'Tidak diketahui';
              if (successLog.description) {
                const patterns = [
                  /upload file presensi gaji:\s*(.+)/i,
                  /mengunggah file salary detail:\s*(.+)/i,
                  /upload.*file.*:\s*(.+)/i
                ];
                for (const pattern of patterns) {
                  const match = successLog.description.match(pattern);
                  if (match && match[1]) {
                    nama_file = match[1].trim();
                    break;
                  }
                }
              }
              setLastUploadInfo({
                nama: successLog.email || 'Tidak diketahui',
                nama_file,
                tanggal: successLog.created_at || '',
              });
              resetUploadState();
              setSuccess('File berhasil diunggah dan diproses.');
              setAllLogs(resJson);
              window.dispatchEvent(new Event('manualLogTrigger'));
              setTimeout(() => setSuccess(''), 5000);
            }
            if (pollingInterval) clearInterval(pollingInterval);
            if (timerInterval) clearInterval(timerInterval);
          }
        }
      } catch (err) {
        console.error('Error during polling:', err);
      }
    };
    
    if (uploading && user?.access_token && currentUploadId) { 
      console.log(`Starting polling for upload session: ${currentUploadId}`);
      fetchLastUpload(); 
      pollingInterval = setInterval(fetchLastUpload, 3000); 
      
      const savedStart = sessionStorage.getItem('upload_salary_start_time');
      if (savedStart) {
        timerInterval = setInterval(() => {
          const currentStartTime = sessionStorage.getItem('upload_salary_start_time'); 
          const activeSession = sessionStorage.getItem('current_upload_id');
          if (currentStartTime && activeSession === currentUploadId) { 
            const elapsed = Math.floor((Date.now() - parseInt(currentStartTime)) / 1000);
            setPollingSeconds(elapsed > 0 ? elapsed : 0);
          } else { 
            if (timerInterval) clearInterval(timerInterval); 
            setPollingSeconds(0);
          }
        }, 1000);
      }
    }
    
    return () => { 
      if (pollingInterval) clearInterval(pollingInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [user, uploading, currentUploadId]);

  const resetUploadState = () => {
    setUploading(false);
    setCurrentUploadId(null);
    setCurrentUploadedFile(null);
    setPollingSeconds(0);
    sessionStorage.removeItem('uploading_salary');
    sessionStorage.removeItem('upload_salary_start_time');
    sessionStorage.removeItem('current_upload_id');
    sessionStorage.removeItem('upload_filename');
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (uploading) {
        resetUploadState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploading]);

  const handleFetchFingerspotData = async () => {
      if (!user?.access_token) {
          setFingerspotFetchStatus({ type: 'error', message: "Sesi pengguna tidak ditemukan, silakan login ulang." });
          return;
      }
      setFingerspotFetchStatus(null); 
      if (!fingerspotStartDate || !fingerspotEndDate) {
        setFingerspotFetchStatus({ type: 'error', message: "Tanggal mulai dan tanggal akhir harus diisi." });
        return;
      }
      if (!isValidYYYYMMDD(fingerspotStartDate) || !isValidYYYYMMDD(fingerspotEndDate)) {
        setFingerspotFetchStatus({ type: 'error', message: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD." });
        return;
      }
      const startDateObj = new Date(fingerspotStartDate);
      const endDateObj = new Date(fingerspotEndDate);
      if (startDateObj > endDateObj) {
        setFingerspotFetchStatus({ type: 'error', message: "Tanggal mulai tidak boleh setelah tanggal akhir." });
        return;
      }
      const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 2) { 
        setFingerspotFetchStatus({ type: 'error', message: "Rentang tanggal tidak boleh lebih dari 2 hari." });
        return;
      }
      
      setIsFetchingFingerspot(true);
      try {
        const res = await fetch(Utils.fetch_fingerspot_attendance, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({
            start_date: fingerspotStartDate,
            end_date: fingerspotEndDate,
          }),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setFingerspotFetchStatus({ type: 'success', message: result.message || 'Data absensi berhasil diproses.' });
          window.dispatchEvent(new Event('manualLogTrigger')); 
        } else {
          setFingerspotFetchStatus({ type: 'error', message: result.message || result.error || 'Gagal memproses data absensi dari Fingerspot.' });
        }
      } catch (err: any) {
        console.error('Gagal fetch data Fingerspot:', err);
        setFingerspotFetchStatus({ type: 'error', message: err.message || 'Terjadi kesalahan jaringan saat mengambil data absensi.' });
      } finally {
        setIsFetchingFingerspot(false);
      }
    };

    useEffect(() => {
          const handleManualLogTrigger = async () => { 
              if(user?.access_token) {
                  try {
                      const res = await fetch(Utils.get_all_activity_log, {
                      method: 'GET',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${user.access_token}`,
                      },
                      });
                      const resJson = await res.json();
                      if (res.ok && Array.isArray(resJson)) {
                        setAllLogs(resJson); 
                      } else {
                          console.error("Gagal memuat ulang log setelah trigger:", resJson.message || resJson.error);
                      }
                  } catch (err) {
                      console.error('Gagal fetch semua log aktivitas setelah trigger manual:', err);
                  }
              }
          };
          window.addEventListener('manualLogTrigger', handleManualLogTrigger);
          return () => {
              window.removeEventListener('manualLogTrigger', handleManualLogTrigger);
          };
      }, [user]); 

  // --- FUNGSI BARU UNTUK MEMPERBAIKI TAMPILAN LOG (VERSI FINAL) ---
  const formatLogDescription = (logEntry: any): string => {
    // Hanya format jika aksi adalah 'Upload Gaji Manual' dan deskripsi ada
    if (logEntry.action === 'Upload Gaji Manual' && logEntry.description) {
      
      // PERBAIKAN 1: Cari awal dari string JSON, yaitu karakter '['
      const jsonStartIndex = logEntry.description.indexOf('[');

      // Jika karakter '[' ditemukan
      if (jsonStartIndex !== -1) {
        // Ambil hanya bagian string yang merupakan JSON
        const jsonString = logEntry.description.substring(jsonStartIndex);
        
        try {
          const data = JSON.parse(jsonString);

          if (Array.isArray(data) && data.length > 0) {
            const formattedItems = data.map(item => 
              // PERBAIKAN 2: Gunakan 'jam_keluar' dan tambahkan label yang sesuai
              `- NIP: ${item.nip || 'N/A'}, Tanggal: ${item.tanggal || 'N/A'}, Jam: ${item.jam_keluar || item.waktu || 'N/A'}`
            ).join('\n'); // Gabungkan setiap item dengan baris baru

            // Tampilkan prefix yang bersih + data yang sudah diformat
            return `Data Gaji Manual:\n${formattedItems}`;
          }
        } catch (e) {
          // Jika parsing gagal, kembalikan deskripsi asli untuk mencegah error
          console.error("Gagal mem-parsing JSON dari log:", jsonString, e);
          return logEntry.description;
        }
      }
    }
    // Untuk log lainnya, kembalikan deskripsi asli
    return logEntry.description;
  };

  if (loading && !user) { 
    return (
      <Center style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Loader color="var(--primary-color, orange)" /> 
        <Text mt="sm">Memuat data pengguna...</Text>
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container className={styles.page_wrapper} size="xl" mt="md" mb="md">
        <Title order={1} className={styles.centered} mb="xl"> 
          Daftar Guru dan Pengelolaan Gaji
        </Title>

        {success && (
          <Notification title="Sukses" withCloseButton onClose={() => { setSuccess(''); resetUploadState(); }} mb="md" radius="md">
            {success}
          </Notification>
        )}
        {error && (
          <Notification title="Error" withCloseButton onClose={() => { setError(''); resetUploadState(); }} mb="md" radius="md">
            {error}
          </Notification>
        )}
         {fingerspotFetchStatus && (
          <Notification
            color={fingerspotFetchStatus.type === 'success' ? 'green' : 'red'}
            title={fingerspotFetchStatus.type === 'success' ? 'Sukses Sinkronisasi' : 'Error Sinkronisasi'}
            withCloseButton
            onClose={() => setFingerspotFetchStatus(null)}
            mb="md"
            radius="md"
          >
            {fingerspotFetchStatus.message}
          </Notification>
        )}

        <Paper shadow="sm" p="lg" mb="lg" radius="md" withBorder>
          <Title order={3} mb="lg" style={{ color: 'var(--primary-color, #228be6)' }}>Filter dan Aksi Cepat</Title>
          <Group grow mb="md" align="flex-start">
            <TextInput
              label="Cari Nama atau NIP"
              placeholder="Masukkan nama atau NIP"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="sm"
            />
            <Select
              label="Filter Jabatan"
              placeholder="Pilih jabatan"
              data={jabatanList.map((j) => ({ value: j, label: j }))}
              value={selectedJabatan}
              onChange={setSelectedJabatan}
              clearable
              searchable
              nothingFoundMessage="Jabatan tidak ditemukan"
              radius="sm"
            />
            <div> 
              <Text size="sm" fw={500} mb={4} component="label" htmlFor="file-upload-button">Upload File Absensi Excel/CSV</Text>
              <FileButton key={uploadKey} onChange={handleFileUpload} accept=".xls,.xlsx">
                {(props) => (
                  <Button 
                    id="file-upload-button"
                    variant="outline" 
                    color="green" 
                    radius="sm" 
                    loading={uploading} 
                    loaderProps={{ type: 'dots' }}
                    {...props}
                    fullWidth  
                   >
                    {uploading ? `Mengunggah... (${pollingSeconds}s)` : 'Pilih File Presensi'}
                  </Button>
                )}
              </FileButton>
              {uploading && (
                <Text size="xs" color="orange" mt="xs">
                  Sedang memproses file Presensi. Mohon tunggu... ({pollingSeconds} detik)
                </Text>
              )}
              {!uploading && currentUploadedFile && !success && !error && ( 
                 <Text size="xs" color="dimmed" mt="xs">File terakhir dipilih: {currentUploadedFile}</Text>
              )}
            </div>
          </Group>
        </Paper>

        <Paper shadow="sm" p="lg" mb="lg" radius="md" withBorder>
          <Title order={3} mb="lg" style={{ color: 'var(--primary-color, #228be6)' }}>Sinkronisasi Data Absensi Fingerspot</Title>
          <Group grow mb="md" align="flex-start">
            <TextInput
              label="Tanggal Mulai (Fingerspot)"
              placeholder="YYYY-MM-DD"
              value={fingerspotStartDate}
              onChange={(e) => setFingerspotStartDate(e.currentTarget.value)}
              error={fingerspotStartDate && !isValidYYYYMMDD(fingerspotStartDate) ? "Format tidak valid (YYYY-MM-DD)" : undefined}
              radius="sm"
            />
            <TextInput
              label="Tanggal Akhir (Fingerspot)"
              placeholder="YYYY-MM-DD"
              value={fingerspotEndDate}
              onChange={(e) => setFingerspotEndDate(e.currentTarget.value)}
              error={fingerspotEndDate && !isValidYYYYMMDD(fingerspotEndDate) ? "Format tidak valid (YYYY-MM-DD)" : undefined}
              radius="sm"
            />
          </Group>
          <Button
            onClick={handleFetchFingerspotData}
            loading={isFetchingFingerspot}
            loaderProps={{ type: 'dots' }}
            variant="filled" 
            color="var(--primary-color, blue)" 
            radius="sm"
            fullWidth
          >
            Tarik & Proses Data Absensi Fingerspot
          </Button>
        </Paper>

        <Center style={{ marginBottom: '1rem' }}>
          <Button
            variant="outline"
            color="gray" 
            radius="sm"
            onClick={() => router.push('/')}
          >
            Kembali
          </Button>
        </Center>
        
        {allUploadedFiles.length > 0 && (
          <Paper shadow="xs" p="lg" mb="md" radius="md" withBorder>
            <Title order={4} mb="sm" style={{ color: 'var(--primary-color, #1971c2)' }}>Daftar Semua File Absensi Terunggah</Title>
             <div style={{ overflowX: 'auto' }}>
              <Table className={styles.salary__table} mt="0" striped highlightOnHover withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>No</Table.Th>
                    <Table.Th>Nama File</Table.Th>
                    <Table.Th>Tanggal Tersimpan</Table.Th>
                    <Table.Th>Unduh</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {allUploadedFiles
                    .sort((a,b) => new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime())
                    .map((item, idx) => (
                    <Table.Tr key={item.file + idx}> 
                      <Table.Td>{idx + 1}</Table.Td>
                      <Table.Td>{item.file}</Table.Td>
                      <Table.Td>
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })
                          : 'Tanggal tidak diketahui'}
                      </Table.Td>
                      <Table.Td>
                        <Button
                            component="a"
                            href={`${Utils.backend_base}uploads/salary/${item.file}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="subtle" 
                            color="blue" 
                            size="xs"
                            radius="sm"
                        >
                            Download
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </Paper>
        )}
      
        {allLogs.length > 0 && (
          <Paper shadow="xs" p="lg" mb="md" radius="md" withBorder>
            <Title order={4} mb="sm" style={{ color: 'var(--primary-color, #1971c2)' }}>Log Aktivitas Pengelolaan Gaji</Title>
            <Group grow mb="md">
              <TextInput
                label="Filter Email Log"
                placeholder="Email pengguna"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.currentTarget.value)}
                radius="sm"
              />
              <TextInput
                label="Filter Tanggal Log (YYYY-MM-DD)"
                placeholder="YYYY-MM-DD"
                value={filterDate}
                onChange={(e) => setFilterDate(e.currentTarget.value)}
                radius="sm"
              />
              <Select
                label="Filter Aksi Log"
                placeholder="Semua aksi"
                data={
                    Array.from(new Set(allLogs.filter(log => log.module === 'Salary Detail').map((logEntry) => logEntry.action)))
                         .map((a) => ({ value: String(a), label: String(a) }))
                } 
                value={selectedAction}
                onChange={setSelectedAction}
                clearable
                searchable
                nothingFoundMessage="Aksi tidak ditemukan"
                radius="sm"
              />
            </Group>
            <div
              style={{
                maxHeight: '400px', 
                overflowY: 'auto',
                border: '1px solid #dee2e6', 
                borderRadius: 'var(--mantine-radius-sm, 4px)', 
              }}
            >
              <Table className={styles.salary__table} mt="0" verticalSpacing="sm" striped highlightOnHover withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 180 }}>Tanggal & Waktu</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>Email Pengguna</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Aksi</Table.Th>
                    <Table.Th>Keterangan Detail</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {allLogs
                    .filter((logEntry) => 
                      logEntry.module === 'Salary Detail' && 
                      logEntry.email?.toLowerCase().includes(filterEmail.toLowerCase()) &&
                      (filterDate ? new Date(logEntry.created_at).toISOString().slice(0, 10).includes(filterDate) : true) &&
                      (selectedAction ? logEntry.action === selectedAction : true)
                    )
                    .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) 
                    .map((logEntry, idx) => ( 
                      <Table.Tr key={logEntry.id || idx}> 
                        <Table.Td>{new Date(logEntry.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'long' })}</Table.Td>
                        <Table.Td>{logEntry.email}</Table.Td>
                        <Table.Td>{logEntry.action}</Table.Td>
                        <Table.Td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {formatLogDescription(logEntry)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </div>
          </Paper>
        )}

        <Title order={2} mb="md" mt="xl" className={styles.centered}>Daftar Guru</Title>
        <Paper shadow="xs" p="lg" radius="md" withBorder>
           <div className={styles.salary__scroll_wrapper} style={{ marginTop: 0, marginBottom: 0 }}>
            <Table className={styles.salary__table} mt="0" striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nama Lengkap</Table.Th>
                  <Table.Th>NIP</Table.Th>
                  <Table.Th>Jabatan</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading && filteredData.length === 0 && data.length === 0 ? ( 
                     <Table.Tr>
                        <Table.Td colSpan={4}>
                          <Center p="xl" style={{flexDirection: 'column'}}>
                            <Loader color="var(--primary-color, orange)" />
                            <Text mt="sm">Memuat daftar guru...</Text>
                          </Center>
                        </Table.Td>
                    </Table.Tr>
                ) : filteredData.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed" p="xl">
                        Tidak ada data guru ditemukan{search || selectedJabatan ? ' sesuai filter' : ''}.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredData.map((item) => ( 
                    <Table.Tr key={item.nip || item.id}> 
                      <Table.Td>{item.nama_lengkap}</Table.Td>
                      <Table.Td>{item.nip}</Table.Td>
                      <Table.Td>{item.jabatan}</Table.Td>
                      <Table.Td>
                        <Center>
                          <Button
                           variant="outline"
                           size="sm"
                           color="var(--primary-color, orange)" 
                           radius="sm"
                           onClick={() => router.push(`/salary_detail/${item.nip}`)}
                           disabled={item.jabatan === 'Admin'}
                          >
                            Lihat Detail Gaji
                          </Button>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
           </div>
        </Paper>
      </Container>
      <Footer />
    </>
  )
}