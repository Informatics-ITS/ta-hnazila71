import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './pengeluaran_rumah_tangga.module.css';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { Stepper, Image, Group, Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail, IconUser, IconUpload, IconStatusChange, IconCheck, IconEdit, IconDiscount, IconFileInvoice } from '@tabler/icons-react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from "jwt-decode";

export default function PengeluaranRumahTanggaView() {
  const [user_id, setUserId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  const [user, setUser] = useState<{ username: string; role: string; access_token: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //A. TAMBAHAN PENGELUARAN (Bendahara)
  const [tambahPengeluaranModalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    //1A. Form Tambah Pengeluaran (Bendahara)
    const [pengeluaranBaru, setPengeluaranBaru] = useState<{
      user_id: string,
      jenis_pengeluaran: string,
      nama: string,
      nominal: number,
    }>({
      user_id: '',
      jenis_pengeluaran: '',
      nama: '',
      nominal: 0,
    });

  // State untuk notifikasi
  const [notification, setNotification] = useState({ message: '', type: '' });

  //2A. fetch dari backend (body request x-www-form-urlencoded)
  const postPengeluaranBaru = async () => {
    console.log(postPengeluaranBaru);
  
    const formPengeluaranBaru = new URLSearchParams({
      user_id: pengeluaranBaru.user_id, // Menggunakan user_id dari state pengeluaranBaru
      jenis_pengeluaran: pengeluaranBaru.jenis_pengeluaran,
      nama: pengeluaranBaru.nama,
      nominal: pengeluaranBaru.nominal.toString(),
    });
  
    try {
      const response = await fetch(Utils.post_pengeluaran_rt, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formPengeluaranBaru.toString(),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        setNotification({ message: 'Pengeluaran berhasil ditambahkan!', type: 'success' });
        closeModal();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.log('Error:', response.status, errorData);
        setNotification({ message: 'Terjadi kesalahan saat menambahkan pengeluaran.', type: 'error' });
      }
    } catch (err) {
      console.log('Error postTambahPengeluaran:', err);
      setNotification({ message: 'Terjadi kesalahan saat menambahkan pengeluaran.', type: 'error' });
    }
  };  

  //3A. Modal Tambah Pengeluaran (Bendahara)
  const postPengeluaranBaruModal = () => {
    return (
      <Modal
        centered
        opened={tambahPengeluaranModalOpened}
        onClose={closeModal}
        title={<span className="modal-title">Buat Tagihan Baru</span>}
        size="70%" 
        className="custom-modal"
      >
        <Box p="lg">
          {/* <Box mb="md">
            <TextInput
              label="User ID"
              value={pengeluaranBaru.user_id} 
              readOnly
            />
          </Box> */}
          <Box mb="md">
            {/* select Rutin atau Insidental */}
            <Select
              data={[
                { value: 'Rutin', label: 'Rutin' },
                { value: 'Insidental', label: 'Insidental' },
              ]}
              placeholder="Pilih Jenis Pengeluaran"
              label="Jenis Pengeluaran"
              onChange={(value) => setPengeluaranBaru({ ...pengeluaranBaru, jenis_pengeluaran: value || '' })}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Nama Pengeluaran"
              placeholder="nama pengeluaran"
              onChange={(e) => setPengeluaranBaru({ ...pengeluaranBaru, nama: e.target.value })}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Nominal (Rp)"
              placeholder="0"
              type='number'
              onChange={(e) => setPengeluaranBaru({ ...pengeluaranBaru, nominal: parseInt(e.target.value) })}
            />
          </Box>
          <Button onClick={postPengeluaranBaru} fullWidth color="#F37F37">SUBMIT</Button>
          {notification.message && (
            <Text className={`notification ${notification.type}`}>{notification.message}</Text>
          )}
        </Box>
      </Modal>
    );
  };


  //B. Tabel Pengeluaran RT (Bendahara)
    //1B. State untuk pengeluaran RT
    const [pengeluaranList, setPengeluaranList] = useState<any[]>([]);
    const [errorMessagePengeluaran, setErrorMessagePengeluaran] = useState<string | null>(null);


    //2B. Fetch pengeluaran RT
    const fetchPengeluaranList = async () => {
      try {
        const response = await fetch(Utils.get_pengeluaran_rt, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
    
        const data = await response.json();
        console.log('Fetched Data:', data); // Tambahkan log ini untuk memeriksa data
    
        if (response.ok) {
          setPengeluaranList(data.data);
          setErrorMessagePengeluaran(null);
        } else {
          console.error('Error fetching pengeluaran list:', data.message);
          setErrorMessagePengeluaran(data.message); 
        }
      } catch (error) {
        console.error('Error fetching pengeluaran list:', error);
        setErrorMessagePengeluaran('Terjadi kesalahan saat mengambil data pengeluaran.');
      }
    };    
    

    //3B. useEffect untuk fetch pengeluaran RT
    useEffect(() => {
      const fetchData = async () => {
        if (user?.role === 'Bendahara'||user?.role === 'Admin') {
          await fetchPengeluaranList();
          console.log('Pengeluaran List:', pengeluaranList); // Tambahkan log ini untuk memeriksa state pengeluaranList
        }
      };
      fetchData();
    }, [user]);    
    

    //4B. Tabel Pengeluaran RT (Bendahara)
    const getPengeluaranTable = (data: any[]) => {
      if (!data || data.length === 0) {
        return <div>Tidak ada data yang tersedia.</div>;
      }
    
      return (
        <DataGrid
          className={styles.pengaturan__pengeluaran}
          columns={[
            { field: 'tanggal', headerName: 'Tanggal', width: 150 },
            { field: 'jenis_pengeluaran', headerName: 'Jenis Pengeluaran', width: 150 },
            { field: 'nama', headerName: 'Nama Pengeluaran', width: 150 },
            { field: 'nominal', headerName: 'Nominal', width: 150 },
            {
              field: 'Action',
              width: 100,
              renderCell: (params) => (
                <div>
                  <Button
                    variant='transparent'
                    onClick={() => openEditPengeluaranModal({
                      id: params.row.id,
                      user_id: params.row.user_id,
                      jenis_pengeluaran: params.row.jenis_pengeluaran,
                      nama: params.row.nama,
                      nominal: parseInt(params.row.nominal.replace(/[^\d]/g, ''), 10), // Memastikan nominal adalah number
                    })}                  
                  >
                    <IconPencil color='green' size={14} />
                  </Button>
                  <Button
                    variant='transparent'
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus data Pengeluaran ini?')) {
                        deletePengeluaran(params.row.id);
                      }
                    }}
                  >
                    <IconTrash color='red' size={14} />
                  </Button>
                </div>
              ),
            },
          ]}
          rows={data.map((item) => {
            const createdAtDate = new Date(item.created_at); // Mengonversi created_at menjadi objek Date
            const { month, year } = Utils.getBulanTahunNow(); // Mendapatkan bulan dan tahun sekarang
            const formattedDate = `${createdAtDate.getDate()} ${month} ${year}`; // Format tanggal
            
            return {
              id: item.id,
              tanggal: formattedDate, // Menyimpan tanggal yang diformat
              user_id: item.user_id, // Menyimpan user_id
              jenis_pengeluaran: item.jenis_pengeluaran,
              nama: item.nama,
              nominal: Utils.formatCurrency(item.nominal),
            };
          })}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.75rem',
            },
            '& .MuiDataGrid-columnHeader': {
              fontSize: '0.75rem',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              height: 'auto',
              minWidth: '90px',
            },
          }}
        />
      );      
    };

    //5B. Delete Pengeluaran RT (Bendahara)
    const deletePengeluaran = async (id: string) => {
      try {
        const response = await fetch(`${Utils.del_pengeluaran_rt}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });

      const data = await response.json();

      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Pengeluaran berhasil dihapus!', type: 'success' });
        await fetchPengeluaranList();
      } else {
        console.error('Error deleting Pengeluaran:', data.message);
        setNotification({ message: data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Pengeluaran:', error);
      setNotification({ message: 'Terjadi kesalahan saat menghapus Pengeluaran.', type: 'error' });
    }
  };

  //6B Edit Pengeluaran RT (Bendahara)
const [selectedPengeluaran, setSelectedPengeluaran] = useState<{
  id: string;
  user_id: string;
  jenis_pengeluaran: string;
  nama: string;
  nominal: number;
} | null>(null); // Lebih spesifik tipe data

const [editPengeluaranOpened, setEditPengeluaranOpened] = useState(false);
const [pengeluaranJenis, setPengeluaranJenis] = useState<string>('');
const [pengeluaranNama, setPengeluaranNama] = useState<string>('');
const [pengeluaranNominal, setPengeluaranNominal] = useState<number | null>(null);

// Fungsi untuk membuka modal edit pengeluaran
const openEditPengeluaranModal = (pengeluaran: {
  id: string;
  user_id: string;
  jenis_pengeluaran: string;
  nama: string;
  nominal: number;
}) => {
  const userCookie = Cookies.get('user');
  const userData = userCookie ? JSON.parse(userCookie) : null;
  const decodedToken: any = userData ? jwtDecode(userData.access_token) : null;
  
  setSelectedPengeluaran({
    ...pengeluaran,
    user_id: decodedToken ? decodedToken.id_user : pengeluaran.user_id, // Menggunakan user_id dari token atau pengeluaran
  });
  
  setEditPengeluaranOpened(true);
};

// Fungsi untuk mengonversi nominal jika nominalnya bertipe string
const parseNominal = (nominalString: string) => {
  const numericString = nominalString.replace(/Rp\s*|\.|,/g, ''); // Hapus "Rp" dan karakter format
  return parseInt(numericString, 10); // Konversi ke integer
};

// Mengisi form dengan data pengeluaran yang dipilih saat modal dibuka
useEffect(() => {
  if (selectedPengeluaran) {
    setPengeluaranJenis(selectedPengeluaran.jenis_pengeluaran);
    setPengeluaranNama(selectedPengeluaran.nama);
    
    // Jika nominal adalah string dari database, gunakan parseNominal
    // Jika nominal sudah bertipe number, langsung set
    if (typeof selectedPengeluaran.nominal === 'string') {
      setPengeluaranNominal(parseNominal(selectedPengeluaran.nominal)); // Mengonversi ke number
    } else {
      setPengeluaranNominal(selectedPengeluaran.nominal); // Jika sudah number, langsung set
    }
  }
}, [selectedPengeluaran]);

// Fungsi untuk meng-update pengeluaran ke server
const updatePengeluaran = async (id: string) => {
  if (!selectedPengeluaran?.user_id) {
    setNotification({
      message: 'User ID tidak ditemukan, silakan coba lagi.',
      type: 'error',
    });
    return;
  }

  const body = new URLSearchParams();
  body.append('user_id', selectedPengeluaran.user_id); // user_id diambil dari selectedPengeluaran
  body.append('jenis_pengeluaran', pengeluaranJenis);
  body.append('nama', pengeluaranNama);
  body.append('nominal', pengeluaranNominal?.toString() || '');

  try {
    const response = await fetch(`${Utils.put_pengeluaran_rt}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user?.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    if (response.ok) {
      setNotification({
        message: 'Pengeluaran berhasil diubah!',
        type: 'success',
      });
      await fetchPengeluaranList();
      setEditPengeluaranOpened(false); // Tutup modal setelah sukses
      window.location.reload();
    } else {
      setNotification({
        message: `Terjadi kesalahan: ${data.message || 'Gagal mengubah pengeluaran.'}`,
        type: 'error',
      });
    }
  } catch (err) {
    setNotification({
      message: 'Terjadi kesalahan saat mengubah pengeluaran.',
      type: 'error',
    });
  }
};


// Komponen modal edit pengeluaran
const editPengeluaranModal = () => {
  return (
    <Modal
      centered
      opened={editPengeluaranOpened}
      onClose={() => setEditPengeluaranOpened(false)}
      title={<span className="modal-title">Edit Pengeluaran</span>}
      size="30%"
      className="custom-modal"
    >
      <Box p="lg">
        <Box mb="md">
          <TextInput
            label="Jenis Pengeluaran"
            placeholder="Jenis Pengeluaran"
            value={pengeluaranJenis} // Initial value diisi dari state
            onChange={(e) => setPengeluaranJenis(e.target.value)} // Mengubah state
          />
        </Box>
        <Box mb="md">
          <TextInput
            label="Nama Pengeluaran"
            placeholder="Nama Pengeluaran"
            value={pengeluaranNama} // Initial value diisi dari state
            onChange={(e) => setPengeluaranNama(e.target.value)} // Mengubah state
          />
        </Box>
        <Box mb="md">
        <TextInput
          label="Nominal (Rp)"
          placeholder="0"
          value={pengeluaranNominal === null ? '' : pengeluaranNominal.toString()}
          onChange={(e) => {
            const inputValue = e.target.value;

            // Hapus karakter non-numerik dari input, termasuk simbol "Rp" dan titik
            const cleanedValue = inputValue.replace(/[^\d]/g, '');

            // Set state jika input kosong
            if (cleanedValue === '') {
              setPengeluaranNominal(null); // Biarkan kosong
            } else {
              const parsedValue = parseInt(cleanedValue, 10);

              if (!isNaN(parsedValue)) {
                setPengeluaranNominal(parsedValue);
              } else {
                setPengeluaranNominal(null); // Reset jika input tidak valid
              }
            }
          }}
        />

        </Box>
        <Button
          onClick={() => {
            if (
              selectedPengeluaran &&
              confirm('Apakah Anda yakin ingin mengubah data pengeluaran ini?')
            ) {
              updatePengeluaran(selectedPengeluaran.id); // Panggil fungsi update dengan ID pengeluaran
            }
          }}
          fullWidth
          color="#F37F37"
        >
          SUBMIT
        </Button>
      </Box>
    </Modal>
  );
};


  
    const getComponentPengeluaranRT = (role: string): JSX.Element => {
      switch (role) {
        case 'Bendahara':
        case 'Admin' :
          return (
            <Tabs className={styles.tabs} defaultValue="Riwayat Pengeluaran">
              <div className={styles.catatan__pengeluaran__rumah__tangga__button}>
                <Button
                  onClick={openModal}
                  style={{ marginLeft: '1rem' }}
                  color='#F37F37'
                  leftSection={<IconPlus size={14} />}>
                  Tambah Pengeluaran
                </Button>
              </div>
              <Tabs.Panel value='Riwayat Pengeluaran'>
                <div className={styles.riwayat__pengeluaran}>
                  {getPengeluaranTable(pengeluaranList)}
                </div>
              </Tabs.Panel>
            </Tabs>
          );
        // case 'Sekretaris':
        //   return <div>Sekretaris Component</div>;
        // case 'Admin':
        //   return <div>Admin Component</div>;
        default:
          return <div>Default Component</div>;
      }
    };
    
    useEffect(() => {
      setIsLoading(true);
      const userCookie = Cookies.get('user');
      
      if (!userCookie) {
        window.location.href = '/auth/login';
      } else {
        const userData = JSON.parse(userCookie);
        console.log('User Data:', userData); // Tambahkan log ini untuk memeriksa data user
        setUser(userData);
    
        // decode token to get user id
        const decodedToken: any = jwtDecode(userData.access_token);
        console.log('Decoded Token:', decodedToken); // Tambahkan log ini untuk memeriksa token yang didekode
    
        setPengeluaranBaru((prevState) => ({
          ...prevState,
          user_id: decodedToken.id_user, // Menggunakan id_user dari token yang didekode
        }));
        setIsLoading(false); 
      }
      setIsLoading(false);
    }, []);
    
    
    return (
      <div className={styles.pengeluaran__rumah__tangga}>
        <Header />
        {postPengeluaranBaruModal()}
        {editPengeluaranModal()}
        <h1 className={styles.title}>Pengeluaran Rumah Tangga</h1>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        {user === null ? <></> : getComponentPengeluaranRT(user.role)}
        <Footer />
      </div>
    );     
}