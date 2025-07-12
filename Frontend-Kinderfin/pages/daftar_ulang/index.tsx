
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './daftar_ulang.module.css';
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

export default function DaftarUlangView() {

  const [isLoading, setIsLoading] = useState(true);
  
  const [user, setUser] = useState<{ username: string; role: string; access_token: string } | null>(null);

/*---------------------------------------------------BENDAHARA(TOP)---------------------------------------------------*/
//A. TAMBAHAN TAGIHAN BARU (Bendahara)
const [tagihanOpened, { open: openTagihan, close: closeTagihan }] = useDisclosure(false);
  
//1A. Form Tagihan Baru(Bendahara)
const [tagihanBaru, setTagihanBaru] = useState<{
  nama_tagihan: string,
  biaya_perlengkapan: number,
  biaya_kegiatan: number,
  semester: string,
  tahun_ajaran: string,
  due_date: Date | null,
}>({
  nama_tagihan: '',
  biaya_perlengkapan: 0,
  biaya_kegiatan: 0,
  semester: '',
  tahun_ajaran: '',
  due_date: null,
});

// State untuk notifikasi
const [notification, setNotification] = useState({ message: '', type: '' });
//2A. fetch dari backend (body request raw JSON)
const addTagihanBaru = async () => {
  console.log(addTagihanBaru);

  const formAddBillDaftarUlang = {
    nama: tagihanBaru.nama_tagihan,
    biaya_perlengkapan: tagihanBaru.biaya_perlengkapan,
    biaya_kegiatan: tagihanBaru.biaya_kegiatan,
    semester: tagihanBaru.semester,
    tahun_ajaran: tagihanBaru.tahun_ajaran,
    due_date: Utils.formatDateWithDash(tagihanBaru.due_date as Date)
  };

  try {
    const response = await fetch(Utils.add_bill_daftar_ulang, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formAddBillDaftarUlang),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
      setNotification({ message: 'Tagihan berhasil ditambahkan!', type: 'success' });
      closeTagihan();
      window.location.reload();
    } else {
      const errorData = await response.json();
      console.log('Error:', response.status, errorData);
      setNotification({ message: 'Terjadi kesalahan saat menambahkan tagihan.', type: 'error' });
    }
  } catch (err) {
    console.log('Error addTagihanBaru:', err);
    setNotification({ message: 'Terjadi kesalahan saat menambahkan tagihan.', type: 'error' });
  }
  
};

//3A. Modal Tagihan Baru (Bendahara)
const addTagihanBaruModal = () => {
  return (
    <Modal
    centered
    opened={tagihanOpened}
    onClose={closeTagihan}
    title={<span className="modal-title">Buat Tagihan Baru</span>}
    size="70%" 
    className="custom-modal"
  >
    <div className="modal-content">
    <Box mb="md">
      <TextInput
        required
        label="Nama Tagihan"
        placeholder="Nama Tagihan"
        value={tagihanBaru.nama_tagihan}
        onChange={(e) => setTagihanBaru({ ...tagihanBaru, nama_tagihan: e.currentTarget.value })}
      />
      </Box>
      <Box mb="md">
          <TextInput
            label="Biaya Perlengkapan"
            placeholder="Rp 0"
            type='number'
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, biaya_perlengkapan: parseInt(e.target.value) })}
          />
      </Box>
      <Box mb="md">
          <TextInput
            label="Biaya Kegiatan"
            placeholder="Rp 0"
            type='number'
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, biaya_kegiatan: parseInt(e.target.value) })}
          />
      </Box>
      <Box mb="md">
      <Select
        data={['Ganjil', 'Genap']}
        label="Semester"
        placeholder="Semester"
        value={tagihanBaru.semester}
        onChange={(value) => setTagihanBaru({ ...tagihanBaru, semester: value ?? '' })}
      />
      </Box>
      <Box mb="md">
      <TextInput
        required
        label="Tahun Ajaran"
        placeholder="Tahun Ajaran"
        // type = "number"
        value={tagihanBaru.tahun_ajaran}
        onChange={(e) => setTagihanBaru({ ...tagihanBaru, tahun_ajaran: e.currentTarget.value })}
      />
      </Box>
      <Box mb="md">
          <Text size="sm" fw={500} style={{ marginBottom: 5 }}>Tenggat Waktu</Text>
          <DatePicker
            selected={tagihanBaru.due_date}
            onChange={(date) => setTagihanBaru({ ...tagihanBaru, due_date: date })}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="react-datepicker__input-container custom-datepicker"
          />
      </Box>
      <Box mb="md">
      <Button onClick={addTagihanBaru} fullWidth color="#F37F37">SUBMIT</Button>
      {notification.message && (
          <Text className={`notification ${notification.type}`}>{notification.message}</Text>
      )}
      </Box>
    </div>
  </Modal>
  )
}

//B. PENGATURAN PEMBAYARAN DaftarUlang (Bendahara)
  //1B. State untuk data tagihan bendahara
  const [DaftarUlangBillList, setDaftarUlangBillList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //2B. Fetch data tagihan bendahara
  const fetchDaftarUlangBillList = async () => {
    try {
      const response = await fetch(Utils.get_bill_daftar_ulang, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDaftarUlangBillList(data.data);
        setErrorMessage(null);
      } else {
        console.error('Error fetching Daftar Ulang Bill list:', data.message);
        setErrorMessage(data.message); 
      }
    } catch (error) {
      console.error('Error fetching Daftar Ulang Bill list:', error);
      setErrorMessage('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3B. Fetch data tagihan bendahara useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Bendahara') {
        await fetchDaftarUlangBillList();
      }
    };
    fetchData();
  }, [user]);

  //4B. Table Pengaturan Pembayaran DaftarUlang
  const getPengaturanDaftarUlangTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Semester</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Tenggat Waktu</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Biaya Perlengkapan</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Biaya Kegiatan</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Total</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{item.semester}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{Utils.formatDate(item.due_date)}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{Utils.formatCurrency(item.biaya_perlengkapan)}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{Utils.formatCurrency(item.biaya_kegiatan)}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{Utils.formatCurrency(item.total_amount)}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                <Button
                  variant='transparent'
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus data tagihan ini?')) {
                      deleteDaftarUlangBill(item.id);
                    }
                  }}
                >
                  <IconTrash color='red' size={14} />
                </Button>
                <Button
                  variant='transparent'
                  onClick={() => {
                    setEditTagihan(item);
                  }}
                >
                  <IconPencil color='green' size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  
  
  //5B. Accordion Pengaturan Pembayaran Daftar
  const getPengaturanDaftarUlangAccordion = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    // Mengelompokkan data berdasarkan tahun ajaran
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.tahun_ajaran]) {
        acc[item.tahun_ajaran] = [];
      }
      acc[item.tahun_ajaran].push(item);
      return acc;
    }, {} as { [key: string]: { semester: string, due_date: string, biaya_perlengkapan: number, biaya_kegiatan: number, total_amount: number }[] });
  
    const defaultYear = Object.keys(groupedData); 
    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={defaultYear[0]}>
        {Object.keys(groupedData).map((tahunAjaran, index) => (
          <Accordion.Item key={index} value={tahunAjaran}>
            <Accordion.Control><span>Tahun {tahunAjaran}</span></Accordion.Control>
            <Accordion.Panel>
              {getPengaturanDaftarUlangTable(groupedData[tahunAjaran])}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

  //C. DELETE TAGIHAN (Bendahara)
  //1C. Fetch delete tagihan
  const deleteDaftarUlangBill = async (id: string) => {
    try {
      const response = await fetch(`${Utils.del_bill_daftar_ulang}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Tagihan berhasil dihapus!', type: 'success' });
        await fetchDaftarUlangBillList();
        window.location.reload();
      } else {
        console.error('Error deleting Daftar Ulang Bill:', data.message);
        setNotification({ message: data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Daftar Ulang Bill:', error);
      setNotification({ message: 'Terjadi kesalahan saat menghapus tagihan.', type: 'error' });
    }
  };

  //D. EDIT TAGIHAN (Bendahara)
  //1D. State untuk edit tagihan bendahara
  const [editTagihan, setEditTagihan] = useState<{
    id: string,
    nama: string,
    biaya_perlengkapan: number,
    biaya_kegiatan: number,
    semester: string,
    tahun_ajaran: string,
    due_date: Date | null,
  } | null>(null);

  //2D. Fetch edit tagihan bendahara
  const editDaftarUlangBill = async (id: string) => {
    if (!id) {
      setNotification({ message: 'ID tagihan tidak valid.', type: 'error' });
      return;
    }

    

    const formEditBillDaftarUlang = {
      nama: editTagihan?.nama,
      biaya_perlengkapan: editTagihan?.biaya_perlengkapan,
      biaya_kegiatan: editTagihan?.biaya_kegiatan,
      semester: editTagihan?.semester,
      tahun_ajaran: editTagihan?.tahun_ajaran,
      due_date: editTagihan?.due_date ? Utils.formatDateWithDash(new Date(editTagihan.due_date)) : ''
    };

    console.log(formEditBillDaftarUlang);

    try {
      const response = await fetch(`${Utils.put_bill_daftar_ulang}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formEditBillDaftarUlang),
      });
      

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        setNotification({ message: 'Tagihan berhasil diubah!', type: 'success' });
        await fetchDaftarUlangBillList();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.log('Error:', response.status, errorData);
        setNotification({ message: 'Terjadi kesalahan saat mengubah tagihan.', type: 'error' });
      }
    } catch (err) {
      console.log('Error editDfatarUlangBill:', err);
      setNotification({ message: 'Terjadi kesalahan saat mengubah tagihan.', type: 'error' });
    }
  };


  //3D. Modal Edit Tagihan (Bendahara)
  const [tempBiayaPerlengkapan, setTempBiayaPerlengkapan] = useState('');
  const [tempBiayaKegiatan, setTempBiayaKegiatan] = useState('');

  useEffect(() => {
    if (editTagihan) {
      setTempBiayaPerlengkapan(editTagihan.biaya_perlengkapan.toString());
      setTempBiayaKegiatan(editTagihan.biaya_kegiatan.toString());
    }
  }, [editTagihan]);

  const editTagihanModal = () => {
  
    return (
      <Modal
        centered
        opened={!!editTagihan}
        onClose={() => setEditTagihan(null)}
        title={<span className="modal-title">Edit Tagihan</span>}
        size="70%" 
        className="custom-modal"
      >
        <Box p="lg">
          <Box mb="md">
            <TextInput
              label="Nama Tagihan"
              placeholder="Daftar Ulang Semester ... Tahun Ajaran ..."
              defaultValue={editTagihan?.nama ?? ''}
              onChange={(e) => setEditTagihan(editTagihan ? { ...editTagihan, nama: e.target.value } : null)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Biaya Perlengkapan"
              placeholder="Rp 0"
              type='number'
              defaultValue={tempBiayaPerlengkapan}
              onChange={(e) => setTempBiayaPerlengkapan(e.target.value)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Biaya Kegiatan"
              placeholder="Rp 0"
              type='number'
              defaultValue={tempBiayaKegiatan}
              onChange={(e) => setTempBiayaKegiatan(e.target.value)}
            />
          </Box>
          <Box mb="md">
            <Select
              data={['Ganjil', 'Genap']}
              label="Semester"
              placeholder="Semester"
              defaultValue={editTagihan?.semester ?? ''}
              onChange={(value) => setEditTagihan(editTagihan ? { ...editTagihan, semester: value ?? '' } : null)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Tahun Ajaran"
              placeholder="Tahun Ajaran"
              defaultValue={editTagihan?.tahun_ajaran ?? ''}
              onChange={(e) => setEditTagihan(editTagihan ? { ...editTagihan, tahun_ajaran: e.target.value } : null)}
            />
          </Box>
          <Box mb="md">
            <Text size="sm" fw={500} style={{ marginBottom: 5 }}>Tenggat Waktu</Text>
            <DatePicker
              selected={editTagihan?.due_date ?? null}
              onChange={(date) => setEditTagihan(editTagihan ? { ...editTagihan, due_date: date } : null)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="react-datepicker__input-container custom-datepicker"
            />
          </Box>
          <Button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengedit data tagihan ini?')) {
                editDaftarUlangBill(editTagihan?.id || '');
              }
            }}
            fullWidth
            color="#F37F37"
            >
            SUBMIT
          </Button>
  
          {notification.message && (
            <Text className={`notification ${notification.type}`}>{notification.message}</Text>
          )}
        </Box>
      </Modal>
    );
  };

  //E. Discount Tagihan (Bendahara)
  //1E. State untuk data diskon bendahara
  const [discountList, setDiscountList] = useState<any[]>([]);
  const [errorMessageDiscount, setErrorMessageDiscount] = useState<string | null>(null);
  
  const fetchDiscountList = async () => {
      try {
        const response = await fetch(Utils.discount_daftar_ulang, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
  
  
      const data = await response.json();
  
      if (response.ok) {
        setDiscountList(data.data);
        setErrorMessageDiscount(null);
      } else {
        console.error('Error fetching discount list:', data.message);
        setErrorMessageDiscount(data.message); 
      }
    } catch (error) {
      console.error('Error fetching discount list:', error);
      setErrorMessageDiscount('Terjadi kesalahan saat mengambil data.');
    }
  };
  
    //Fetch data discount useEffect
    useEffect(() => {
      const fetchData = async () => {
        if (user?.role === 'Bendahara') {
          await fetchDiscountList();
        }
      };
      fetchData();
    }, [user]);

  //2E. Table Discount Tagihan
  const getDiscountTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <DataGrid
        className={styles.pengaturan__discount}
        columns={[
          { field: 'Nama', width: 150 },
          { field: 'Persentase', width: 80, renderCell: (params) => Utils.formatPercentage(params.value) },
          {
            field: 'Action',
            width: 100,
            renderCell: (params) => (
              <div>
                <Button
                  variant='transparent'
                  onClick={() => openEditDiscountModal({
                    id: params.row.id,
                    nama: params.row.Nama,  // Pastikan ini sesuai dengan yang diharapkan
                    persentase: params.row.Persentase,  // Sesuaikan dengan tipe yang diharapkan
                  })}                  
                >
                  <IconPencil color='green' size={14} />
                </Button>
                <Button
                  variant='transparent'
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus data discount ini?')) {
                      deleteDiscount(params.row.id);
                    }
                  }}
                >
                  <IconTrash color='red' size={14} />
                </Button>
              </div>
            ),
          },
        ]}
        rows={data.map((item, index) => ({
          id: item.id,
          'Nama': item.nama,
          'Persentase': item.persentase,
        }))}
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

  //3E. Delete Discount
  const deleteDiscount = async (id: string) => {
      try {
        const response = await fetch(`${Utils.discount_daftar_ulang}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Discount berhasil dihapus!', type: 'success' });
        await fetchDiscountList();
      } else {
        console.error('Error deleting discount:', data.message);
        setNotification({ message: data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      setNotification({ message: 'Terjadi kesalahan saat menghapus discount.', type: 'error' });
    }
  };

  //4E. Edit Discount
  const [selectedDiscount, setSelectedDiscount] = useState<{
    id: string;
    nama: string;
    persentase: number;
  } | null>(null);  // Lebih spesifik tipe data
  const [editDiscountOpened, setEditDiscountOpened] = useState(false);
  const [discountName, setDiscountName] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);

  const openEditDiscountModal = (discount: { id: string; nama: string; persentase: number }) => {
    setSelectedDiscount(discount);  
    setEditDiscountOpened(true);    
  };

  // useEffect untuk set nilai default ketika selectedDiscount berubah
  useEffect(() => {
    if (selectedDiscount) {
      setDiscountName(selectedDiscount.nama);
      setDiscountPercentage(selectedDiscount.persentase);
    }
  }, [selectedDiscount]);

  const updateDiscount = async (id: string) => {
    const body = {
      nama: discountName,
      persentase: discountPercentage,
    };
    try {
      const response = await fetch(`${Utils.discount_daftar_ulang}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Discount berhasil diubah!', type: 'success' });
        await fetchDiscountList();
        setEditDiscountOpened(false);  // Tutup modal setelah sukses
      } else {
        console.log('Error:', response.status, data);
        setNotification({ message: 'Terjadi kesalahan saat mengubah discount.', type: 'error' });
      }
    } catch (err) {
      console.log('Error updateDiscount:', err);
      setNotification({ message: 'Terjadi kesalahan saat mengubah discount.', type: 'error' });
    }
  };

  const editDiscountModal = () => {
    return (
      <Modal
        centered
        opened={editDiscountOpened}
        onClose={() => setEditDiscountOpened(false)}
        title={<span className="modal-title">Edit Discount</span>}
        size="30%" 
        className="custom-modal"
      >
        <Box p="lg">
          <Box mb="md">
            <TextInput
              label="Nama Discount"
              placeholder="Nama Discount"
              value={discountName}  // Initial value diisi dari state
              onChange={(e) => setDiscountName(e.target.value)}  // Mengubah state
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Persentase"
              placeholder="0 %"
              value={discountPercentage !== null ? discountPercentage.toString() : ''}  // Tetap kosong jika null
              onChange={(e) => {
                const inputValue = e.target.value;

                // Hanya set state jika input kosong
                if (inputValue === '') {
                  setDiscountPercentage(null); // Biarkan kosong
                } else {
                  const parsedValue = parseInt(inputValue, 10);

                  if (!isNaN(parsedValue)) {
                    setDiscountPercentage(parsedValue);
                  }
                }
              }}
            />
          </Box>
          <Button
            onClick={() => {
              if (selectedDiscount && confirm('Apakah Anda yakin ingin mengubah data discount ini?')) {
                updateDiscount(selectedDiscount.id);  // Panggil fungsi update dengan ID discount
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

      

  //5E. Add Discount 
  // 5E. Add Discount 
  const [addDiscountOpened, setAddDiscountOpened] = useState(false);


  const openAddDiscountModal = () => {
    setDiscountName('');
    setDiscountPercentage(null); // Setel ke null saat membuka modal
    setAddDiscountOpened(true);
  };

  const addDiscount = async () => {
    const body = {
      nama: discountName,
      persentase: discountPercentage !== null ? discountPercentage : 0, // Gunakan 0 jika null
    };

    try {
      const response = await fetch(`${Utils.discount_daftar_ulang}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Discount berhasil ditambahkan!', type: 'success' });
        await fetchDiscountList();
        setAddDiscountOpened(false);
        window.location.reload();
      } else {
        console.log('Error:', response.status, data);
        // Gunakan pesan error dari backend jika ada
        const errorMessage = data.error || 'Terjadi kesalahan saat menambahkan discount.';
        setNotification({ message: errorMessage, type: 'error' });
      }
    } catch (err) {
      console.log('Error addDiscount:', err);
      setNotification({ message: 'Terjadi kesalahan saat menambahkan discount.', type: 'error' });
    }
  };

  const addDiscountModal = () => {
    return (
      <Modal
        centered
        opened={addDiscountOpened}
        onClose={() => setAddDiscountOpened(false)}
        title={<span className="modal-title">Tambah Discount Baru</span>}
        size="30%" 
        className="custom-modal"
      >
        <Box p="lg">
          <Box mb="md">
            <TextInput
              label="Nama Discount"
              placeholder="Nama Discount"
              value={discountName}
              onChange={(e) => setDiscountName(e.target.value)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Persentase"
              placeholder="0 %"
              value={discountPercentage !== null ? discountPercentage.toString() : ''} // Tampilkan string kosong jika null
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setDiscountPercentage(null); // Setel ke null jika input kosong
                } else {
                  const parsedValue = parseInt(value, 10);
                  if (!isNaN(parsedValue)) {
                    setDiscountPercentage(parsedValue); // Set nilai jika input valid
                  } else {
                    setDiscountPercentage(0); // Set ke 0 jika tidak valid
                  }
                }
              }}
            />
          </Box>
          <Button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menambahkan discount baru ini?')) {
                addDiscount();
              }
            }}
            fullWidth
            color="#F37F37"
          >
            SUBMIT
          </Button>
          {notification.message && (
            <Text className={`notification ${notification.type}`}>{notification.message}</Text>
          )}
        </Box>
      </Modal>
    );
  };

  //F. RIWAYAT PEMBAYARAN Daftar Ulanng (Bendahara)
  //1F. State untuk data pembayaran bendahara
  const [DaftarUlangPaymentList, setDaftarUlangPaymentList] = useState<any[]>([]);
  const [errorMessagePayment, setErrorMessagePayment] = useState<string | null>(null);
  const [selectedBerkas, setSelectedBerkas] = useState(null);
  const [detailBerkasOpened, { open: openDetailBerkas, close: closeDetailBerkas }] = useDisclosure(false);
  const openBerkasDetail = (data : any) => {
    setSelectedBerkas(data);
    openDetailBerkas(); 
  };


    //2F. Fetch data pembayaran bendahara
    const fetchAllDaftarUlangPaymentList = async () => {
      try {
        const response = await fetch(Utils.get_all_payments_daftar_ulang, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setDaftarUlangPaymentList(data.data);
          setErrorMessagePayment(null);
        } else {
          console.error('Error fetching All DaftarUlang Payment list:', data.message);
          setErrorMessagePayment(data.message); 
        }
      } catch (error) {
        console.error('Error fetching All DaftarUlang Payment list:', error);
        setErrorMessagePayment('Terjadi kesalahan saat mengambil data.');
      }
    }
  

  // Edit Status Pembayaran
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [editStatusOpened, { open: openEditStatus, close: closeEditStatus }] = useDisclosure(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  
  const openEditStatusModal = (payment: any) => {
    if (!payment.id_user_bill_payment) {
      console.error('id_user_bill_payment tidak ditemukan di objek payment:', payment);
      return;
    }
    setSelectedPayment(payment);
    setStatus(payment.status || ''); 
    setCatatan(payment.catatan || ''); 
    openEditStatus();
  };
  
  

  const updatePaymentStatus = async (id_user_bill_payment: string) => {
    const body = {
      status,
      ...(status === 'REJECTED' && { catatan })
    };
  
    try {
      const response = await fetch(`${Utils.update_payment_status}${id_user_bill_payment}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Status pembayaran berhasil diubah!', type: 'success' });
        setResponseMessage('Status pembayaran berhasil diubah!');
        await fetchAllDaftarUlangPaymentList();
        closeEditStatus();
        window.location.reload();
      } else {
        console.log('Error:', response.status, data);
        setNotification({ message: 'Terjadi kesalahan saat mengubah status pembayaran.', type: 'error' });
        setResponseMessage(`Gagal: ${data.error || data.message}`);
      }
    } catch (err) {
      console.log('Error updatePaymentStatus:', err);
      setNotification({ message: 'Terjadi kesalahan saat mengubah status pembayaran.', type: 'error' });
      setResponseMessage('Gagal: Terjadi kesalahan saat mengubah status pembayaran.');
    }
  };
  

  const editStatusModal = () => {
    return (
      <Modal
        centered
        opened={editStatusOpened}
        onClose={() => {
          closeEditStatus();
          setResponseMessage(null); // Reset pesan respons saat modal ditutup
        }}
        title={<span className="modal-title">Edit Status Pembayaran</span>}
        size="30%" 
        className="custom-modal"
      >
        <Box p="lg">
          <Box mb="md">
            <Select
              label="Status"
              placeholder="Pilih Status"
              value={status}
              onChange={(value: string | null) => setStatus(value || '')} // Pastikan value adalah string
              data={['APPROVED', 'REJECTED']}
            />
          </Box>
          {status === 'REJECTED' && (
            <Box mb="md">
              <TextInput
                label="Catatan"
                placeholder="Masukkan catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </Box>
          )}
          <Button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengubah status pembayaran ini?')) {
                if (selectedPayment && selectedPayment.id_user_bill_payment) {
                  updatePaymentStatus(selectedPayment.id_user_bill_payment); // Pastikan menggunakan id_user_bill_payment
                } else {
                  console.error('id_user_bill_payment tidak ditemukan di selectedPayment:', selectedPayment);
                }
              }
            }}
            fullWidth
            color="#F37F37"
          >
            SUBMIT
          </Button>
          {responseMessage && (
            <Text mt="md" color={responseMessage.includes('berhasil') ? 'green' : 'red'}>
              {responseMessage}
            </Text>
          )}
        </Box>
      </Modal>
    );
  };  
  
  

  //3F. Fetch data pembayaran bendahara useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Bendahara') {
        await fetchAllDaftarUlangPaymentList();
      }
    };
    fetchData();
  }, [user]);

  //4F. Table Riwayat Pembayaran DaftarUlang
  const getRiwayatPembayaranDaftarUlangTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <DataGrid
        className={styles.riwayat__pembayaran}
        columns={[
          { field: 'Tanggal Pembayaran', width: 150 },
          { field: 'Nama Siswa', width: 150 },
          { field: 'Nama Tagihan', width: 220 },
          { field: 'Nominal Pembayaran', width: 150 },
          {
            field: 'Bukti Pembayaran', width: 180,
            renderCell: (params) => (
              <div>
                <Chip
                  icon={<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-photo-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M11.5 21h-5.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l2 2" /></svg>}
                  label="Lihat Gambar"
                  onClick={() => window.open(params.row['Bukti Pembayaran'])}
                />
                <Image
                  radius="md"
                  h={300}
                  style={{marginBottom: '1rem', marginTop: '1rem'}}
                  src={params.row['Bukti Pembayaran']}
                />
              </div>
            ),
          },
          {
            field: 'Status',
            width: 150,
            renderCell: (params) => {
              let color;
              switch (params.value) {
                case 'PENDING':
                  color = 'orange';
                  break;
                case 'APPROVED':
                  color = 'green';
                  break;
                case 'REJECTED':
                  color = 'red';
                  break;
                default:
                  color = 'black';
              }
              return (
                <span style={{ color }}>
                  {params.value}
                </span>
              );
            },
          },
          { field: 'Catatan', width: 150 },
          {
            field: 'Action',
            width: 150,
            renderCell: (params) => (
              <Button
                variant='transparent'
                onClick={() => openEditStatusModal(params.row)}
              >
                Edit Status
              </Button>
            ),
          },
        ]}
        rows={data.map((item, index) => ({
          id: index,
          'Tanggal Pembayaran': Utils.formatDate(item.payment_date),
          'Nama Siswa': item.nama_siswa,
          'Nama Tagihan': item.nama_tagihan,
          'Nominal Pembayaran': Utils.formatCurrency(item.amount_paid),
          'Bukti Pembayaran': item.url_bukti_pembayaran,
          'Status': item.status,
          'Catatan': item.catatan===undefined || item.catatan==="" || item.catatan===null ? '-' : item.catatan,
          'id_user_bill_payment': item.id_user_bill_payment, // Pastikan id_user_bill_payment ada di sini
        }))}
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

  //G. UBAH STATUS TAGIHAN SISWA
  const [AllStudentBillList, setAllStudentBillList] = useState<any[]>([]);
  const [errorMessageBill, setErrorMessageBill] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string | null }>({});


  const fetchAllStudentBillList = async () => {
    try {
      const response = await fetch(Utils.get_all_student_bill_daftar_ulang, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAllStudentBillList(data.data);
        setErrorMessageBill(null);
      } else {
        console.error('Error fetching All Student Bill list:', data.message);
        setErrorMessageBill(data.message); 
      }
    } catch (error) {
      console.error('Error fetching All Student Bill list:', error);
      setErrorMessageBill('Terjadi kesalahan saat mengambil data.');
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Bendahara') {
        await fetchAllStudentBillList();
      }
    };
    fetchData();
  }, [user]);


  const getUbahStatusTagihanTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }

    return (
      <DataGrid
        className={styles.ubah_status_bill}
        columns={[
          { field: 'Nama Siswa', width: 150 },
          { field: 'Nama Tagihan', width: 200 },
          { field: 'Sudah Dibayar', width: 150 },
          { field: 'Belum Dibayar', width: 150 },
          {
            field: 'Status',
            width: 150,
            renderCell: (params: any) => (
              <span style={{ color: params.value === 'LUNAS' ? '#388E3C' : '#D32F2F', fontWeight: 'bold' }}>
                {params.value}
              </span>
            ),
          },
          {
            field: 'Action',
            width: 150,
            renderCell: (params: any) => (
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Select
                  placeholder="Edit Status"
                  value={selectedStatus[params.row.id_bill] || ''}
                  onChange={(value: string | null) => {
                    if (value !== null && confirm('Apakah Anda yakin ingin mengubah status tagihan ini?')) {
                      updateStudentBillStatus(params.row.id_bill, value === 'LUNAS');
                      setSelectedStatus((prev) => ({ ...prev, [params.row.id_bill]: value }));
                    }
                  }}
                  data={[
                    { value: 'LUNAS', label: 'LUNAS' },
                    { value: 'BELUM LUNAS', label: 'BELUM LUNAS' }
                  ]}
                  style={{ width: '100%' }} // Pastikan Select mengambil lebar penuh
                />
              </div>
            ),
          },
        ]}
        rows={data.map((item: any, index: number) => ({
          id: index,
          'Nama Siswa': item.nama_siswa,
          'Nama Tagihan': item.nama_tagihan,
          'Sudah Dibayar': Utils.formatCurrency(item.total_paid),
          'Belum Dibayar': Utils.formatCurrency(item.remaining_amount),
          'Status': item.payment_status,
          'id_bill': item.id_bill,
        }))}
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

  const updateStudentBillStatus = async (id_bill: string, status: boolean) => {
    const body = {
      status: status,
    };

    try {
      const response = await fetch(`${Utils.student_bill_status_daftar_ulang}${id_bill}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        setNotification({ message: 'Status tagihan berhasil diubah!', type: 'success' });
        await fetchAllStudentBillList(); // Refresh data setelah pembaruan berhasil
        setSelectedStatus((prev) => ({ ...prev, [id_bill]: null })); // Kosongkan nilai Select
        window.location.reload();
      } else {
        console.log('Error:', response.status, data);
        setNotification({ message: 'Terjadi kesalahan saat mengubah status tagihan.', type: 'error' });
      }
    } catch (err) {
      console.log('Error updateStudentBillStatus:', err);
      setNotification({ message: 'Terjadi kesalahan saat mengubah status tagihan.', type: 'error' });
    }
  };

/*---------------------------------------------------BENDAHARA(BOTTOM)---------------------------------------------------*/


/*---------------------------------------------------ORANG TUA(TOP)---------------------------------------------------*/

//A. INFORMASI PEMBAYARAN DAFTAR ULANG
  const [informasiOpened, { open: openInformasi, close: closeInformasi }] = useDisclosure(false);
  const getInformasiModal = () => {
    return (
      <Modal
          opened={informasiOpened}
          onClose={closeInformasi}
          title="Informasi Pembayaran Daftar Ulang"
          size='70%'
        >
          <div className={styles.informasi__modal}>
            <Paper shadow="md" p="xl" style={{margin: '1rem'}}>
              <Text>
                <b>Tata Cara Pembayaran Daftar Ulang</b>
              </Text>
              <Text
                style={{fontSize: rem(12), fontWeight: 400, marginTop: rem(10)}}
              >
                1. Pembayaran Daftar Ulang dapat dilihat dengan menekan tombol “Unggah Bukti Pembayaran”<br/>
                2. Akan muncul tampilan form untuk mengunggah bukti pembayaran.<br/>
                3. Silakan pilih siswa yang akan dibayarkan Daftar Ulang nya, kemudian masukkan nominal pembayaran dan pilih metode pembayaran.<br/>
                4. Kemudian unggah bukti bayar melalui kolom bukti pembayaran. <br/>
                5. Setelah memasukkan semua informasi pembayaran, klik “Kirim”. <br/>
                6. Mohon tunggu 1x24 jam untuk proses verifikasi dan update “Status” catatan pembayaran Daftar Ulang siswa.
              </Text>
            </Paper>
            <Paper shadow="md" p="xl" style={{margin: '1rem'}}>
              <Text>
                <b>Metode Pembayaran Daftar Ulang</b>
              </Text>
              <Text
                style={{fontSize: rem(12), fontWeight: 400, marginTop: rem(10)}}
              >
                <b style={{color: '#000000'}}>1. Melalui Transfer Bank</b><br/>
                &emsp;BNI : 567890012 (Siti)<br/>
                &emsp;BCA : 567890013 (Siti)<br/>
                &emsp;Mandiri : 567890014 (Siti)<br/>
                <b style={{color: '#000000'}}>2. Melalui Transfer e-Money</b><br/>
                &emsp;Gopay:  083674927456 (Siti)<br/>
                &emsp;Ovo : 083674927456 (Siti)<br/>
                &emsp;Dana :  083674927456 (Siti)<br/><br/>
                <b style={{color: '#000000'}}>Catatan : Pembayaran di luar periode pembayaran hanya bisa dilakukan secara offline dengan mendatangi sekolah secara langsung.</b>
              </Text>
            </Paper>
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem'}}>
              <b>Butuh Bantuan?</b>
              <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem'}}>
                <Button
                  color='#32A70B'
                  style={{marginBottom: '1.5rem'}}
                  leftSection={<IconBrandWhatsapp size={14} />}
                >
                  Whatsapp
                </Button>
                <Button
                  color='#3FA8E2'
                  style={{marginBottom: '1.5rem'}}
                  leftSection={<IconMail size={14} />}
                >
                  Email
                </Button>
              </div>
            </div>
          </div>
        </Modal>
    )
  }

  // B. Unggah Bukti Pembayaran (Orang Tua)
  const [unggahBuktiOpened, { open: openUnggahBuktiPembayaran, close: closeUnggahBuktiPembayaran }] = useDisclosure(false);
  const [uploadResponseMessage, setUploadResponseMessage] = useState<string | null>(null);

  // 1B. Form Unggah Bukti Pembayaran (Orang Tua)
  const [buktiPembayaran, setBuktiPembayaran] = useState<{
    amount_paid: number,
    component_paid: string,
    bukti_pembayaran: string,
  }>({
    amount_paid: 0,
    component_paid: 'DAFTAR ULANG',
    bukti_pembayaran: 'https://www.google.com',
  });

  const [bukti_pembayaran, set_bukti_pembayaran] = useState<File | null>(null);

  // 2B. Fetch dari backend (body request form-data)
  const addBuktiPembayaran = async (id_student: string, id_bill: string) => {
    console.log('addBuktiPembayaran called with:', id_student, id_bill);

    // Buat FormData
    const formAddBillDaftarUlangOrtu = new FormData();
    formAddBillDaftarUlangOrtu.append('amount_paid', buktiPembayaran.amount_paid.toString());
    formAddBillDaftarUlangOrtu.append('component_paid', buktiPembayaran.component_paid);
    
    // Jika ada file bukti pembayaran, tambahkan ke FormData
    if (bukti_pembayaran) {
      formAddBillDaftarUlangOrtu.append('bukti_pembayaran', bukti_pembayaran, bukti_pembayaran.name);
    }

    // Buat query params
    const queryParams = new URLSearchParams({
      student: id_student,
      daftar_ulang: id_bill
    });

    try {
      // Lakukan fetch ke server
      const response = await fetch(`${Utils.add_bill_daftar_ulang_ortu}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: formAddBillDaftarUlangOrtu, // Masukkan FormData ke body request
      });

      // Cek status respons
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        // Jika respons berhasil dan JSON
        const data = await response.json();
        console.log('Success:', data);
        setNotification({ message: 'Bukti pembayaran berhasil diunggah!', type: 'success' });
        setUploadResponseMessage('Bukti pembayaran berhasil diunggah!');
        closeUnggahBuktiPembayaran();
        window.location.reload();
      } else {
        // Jika respons gagal atau bukan JSON
        const errorText = await response.text();  // Ambil error sebagai teks jika bukan JSON
        console.log('Error response:', response.status, errorText);
        const errorMessage = `Gagal: ${JSON.parse(errorText).error || `Error: ${response.status}`}`;
        setNotification({ message: errorMessage, type: 'error' });
        setUploadResponseMessage(errorMessage);
      }
    } catch (err: any) {
      // Tangkap error lain seperti network error atau parsing error
      console.log('Error addBuktiPembayaran:', err.message || err);
      setNotification({ message: `Terjadi kesalahan: ${err.message || err}`, type: 'error' });
      setUploadResponseMessage(`Terjadi kesalahan: ${err.message || err}`);
    }
  };

  //3B. Modal Unggah Bukti Pembayaran (Orang Tua)
  const [selectedBill, setSelectedBill] = useState<{
    id_student: string,
    id_bill: string
  } | null>(null);

  // State untuk detail tagihan (daftar ulang)
  const [detailTagihan, setDetailTagihan] = useState<{
    biaya_perlengkapan: number,
    biaya_kegiatan: number,
    total_paid: number,
    remaining_amount: number,
    payment_status: string
  }>({
    biaya_perlengkapan: 0,
    biaya_kegiatan: 0,
    total_paid: 0,
    remaining_amount: 0,
    payment_status: ''
  });

  // Update detailTagihan saat tagihan dipilih
  useEffect(() => {
    if (selectedBill) {
      const selected = DaftarUlangBillOrtuList.find((bill: any) => bill.id_bill === selectedBill.id_bill);
      if (selected) {
        setDetailTagihan({
          biaya_perlengkapan: selected.biaya_perlengkapan || 0,
          biaya_kegiatan: selected.biaya_kegiatan || 0,
          total_paid: selected.total_paid || 0,
          remaining_amount: selected.remaining_amount || 0, 
          payment_status: selected.payment_status || ''
        });
      }
    }
  }, [selectedBill]);

  const addBuktiPembayaranModal = () => {
    return (
      <Modal
        centered
        opened={unggahBuktiOpened}
        onClose={() => {
          closeUnggahBuktiPembayaran();
          setUploadResponseMessage(null); // Reset pesan respons saat modal ditutup
        }}
        title={<span className="modal-title">Unggah Bukti Pembayaran</span>}
        size="30%"
        className="custom-modal"
      >
        <Box p="lg">
          <Box mb="md">
            <Select
              label="Pilih Tagihan"
              placeholder="Pilih Tagihan"
              data={DaftarUlangBillOrtuList.map((bill: any) => ({
                value: bill.id_bill,
                label: `${bill.nama_tagihan} - ${bill.nama_siswa}`,
                id_student: bill.id_student,
                id_bill: bill.id_bill
              }))}
              onChange={(value) => {
                const selected = DaftarUlangBillOrtuList.find((bill: any) => bill.id_bill === value);
                if (selected) {
                  setSelectedBill({
                    id_student: selected.id_student,
                    id_bill: selected.id_bill
                  });
                }
              }}
            />
          </Box>
          <Box mb="md">
            <Text size="sm" fw={500}>Detail Tagihan:</Text>
            <ul>
              <li>Biaya Perlengkapan: Rp {detailTagihan.biaya_perlengkapan.toLocaleString()}</li>
              <li>Biaya Kegiatan: Rp {detailTagihan.biaya_kegiatan.toLocaleString()}</li>
            </ul>
            <Text size="sm" fw={500}>Keterangan:</Text>
            <ul>
              <li>Status Pembayaran: {detailTagihan.payment_status}</li>
              <li>Total Sudah Dibayar: Rp {detailTagihan.total_paid.toLocaleString()}</li>
              <li>Total Belum Dibayar: Rp {detailTagihan.remaining_amount.toLocaleString()}</li>
            </ul>
          </Box>
          <Box mb="md">
            <TextInput
              label="Masukan Nominal Pembayaran"
              placeholder="Rp 0"
              type='number'
              onChange={(e) => setBuktiPembayaran({ ...buktiPembayaran, amount_paid: parseInt(e.target.value) })}
            />
          </Box>
          <Box mb="md">
            <FileInput
              label="Bukti Pembayaran"
              placeholder="Image (*jpg, *jpeg, *png)"
              onChange={(file) => {
                console.log('File selected:', file);
                set_bukti_pembayaran(file);
              }}
            />
          </Box>
          <Button 
            onClick={() => {
              if (selectedBill) {
                addBuktiPembayaran(selectedBill.id_student, selectedBill.id_bill);
              } else {
                setNotification({ message: 'Silakan pilih tagihan terlebih dahulu.', type: 'error' });
                setUploadResponseMessage('Silakan pilih tagihan terlebih dahulu.');
              }
            }} 
            fullWidth 
            color="#F37F37"
          >
            SUBMIT
          </Button>
          {uploadResponseMessage && (
            <Text mt="md" color={uploadResponseMessage.includes('berhasil') ? 'green' : 'red'}>
              {uploadResponseMessage}
            </Text>
          )}
        </Box>
      </Modal>
    );
  };

  //C.CATATAN DAFTAR ULANG (Orang Tua)
  //1C. State untuk data tagihan orang tua
  const [DaftarUlangBillOrtuList, setDaftarUlangBillOrtuList] = useState<any[]>([]);
  const [ErrorBillOrtuList, setErrorBillOrtuList] = useState<string | null>(null);

  //2C. Fetch data tagihan orang tua
  const fetchDaftarUlangBillOrtuList = async () => {
    try {
      const response = await fetch(Utils.get_bill_daftar_ulang_ortu, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDaftarUlangBillOrtuList(data.data);
        setErrorBillOrtuList(null);
      } else {
        console.error('Error fetching Daftar Ulang Bill Ortu list:', data.message);
        setErrorBillOrtuList(data.message); 
      }
    } catch (error) {
      console.error('Error fetching Daftar Ulang Bill Ortu list:', error);
      setErrorBillOrtuList('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3C. Fetch data tagihan orang tua useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Orang Tua') {
        await fetchDaftarUlangBillOrtuList();
      }
    };
    fetchData();
  }, [user]);

  //4C. Table Pembayaran DaftarUlang, Komite, dan Ekstrakurikuler (Orang Tua)
  const getDaftarUlangBillOrtuTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Nama Tagihan</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Tenggat Waktu</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Belum Dibayar</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Sudah Dibayar</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Status Pembayaran</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.nama_tagihan}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{Utils.formatDate(item.due_date)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{Utils.formatCurrency(item.remaining_amount)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{Utils.formatCurrency(item.total_paid)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                {item.payment_status === "LUNAS" ? (
                  <span style={{ color: "#388E3C", fontWeight: "bold" }}>
                    {item.payment_status}
                  </span>
                ) : (
                  <span style={{ color: "#D32F2F", fontWeight: "bold" }}>
                    {item.payment_status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  
  
  
  
  //5C. Accordion Catatan Daftar Ulang (Orang Tua)
  const getDaftarUlangBillOrtuAccordion = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    // Mengelompokkan data berdasarkan nama siswa
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.nama_siswa]) {
        acc[item.nama_siswa] = [];
      }
      acc[item.nama_siswa].push(item);
      return acc;
    }, {} as { [key: string]: { nama_siswa: string, nama_tagihan: string, due_date: string, remaining_amount: number, total_paid: number, payment_status: string }[] });
  
    const defaultStudent = Object.keys(groupedData); 
  
    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={defaultStudent[0]}>
        {Object.keys(groupedData).map((namaSiswa, index) => (
          <Accordion.Item key={index} value={namaSiswa}>
            <Accordion.Control><span>{namaSiswa}</span></Accordion.Control>
            <Accordion.Panel>
              {getDaftarUlangBillOrtuTable(groupedData[namaSiswa])}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

  //D. RIWAYAT PEMBAYARAN DaftarUlang (Orang Tua)
  //1D. State untuk data pembayaran bendahara
  const [DaftarUlangPaymentOrtuList, setDaftarUlangPaymentOrtuList] = useState<any[]>([]);
  const [errorMessagePaymentOrtu, setErrorMessagePaymentOrtu] = useState<string | null>(null);

  //2D. Fetch data pembayaran bendahara
  const fetchAllDaftarUlangPaymentOrtuList = async () => {
    try {
      const response = await fetch(Utils.get_all_payments_daftar_ulang_ortu, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDaftarUlangPaymentOrtuList(data.data);
        setErrorMessagePaymentOrtu(null);
      } else {
        console.error('Error fetching All Daftar Ulang Payment Ortu list:', data.message);
        setErrorMessagePaymentOrtu(data.message); 
      }
    } catch (error) {
      console.error('Error fetching All Daftar Ulang Payment Ortu list:', error);
      setErrorMessagePaymentOrtu('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3D. Fetch data pembayaran bendahara useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Orang Tua') {
        await fetchAllDaftarUlangPaymentOrtuList();
      }
    };
    fetchData();
    console.log('DaftarUlangPaymentOrtuList:', DaftarUlangPaymentOrtuList);
  }, [user]);

  //4D. Table Riwayat Pembayaran DaftarUlang
  const getRiwayatPembayaranDaftarUlangOrtuTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <DataGrid
        className={styles.riwayat__pembayaran}
        columns={[
          { field: 'Tanggal Pembayaran', width: 150 },
          { field: 'Nama Siswa', width: 150 },
          { field: 'Nama Tagihan', width: 190 },
          { field: 'Nominal Pembayaran', width: 150 },
          {
            field: 'Bukti Pembayaran',
            width: 150,
            renderCell: (params) => (
              <a href={params.row['Bukti Pembayaran']} target="_blank" rel="noopener noreferrer">
                <Chip
                  icon={<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-photo-search"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M11.5 21h-5.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v5.5" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l2 2" /></svg>}
                  label="Lihat Gambar"
                  onClick={() => window.open(params.row['Bukti Pembayaran'])}
                />
              </a>
            ),
          },          
          {
            field: 'Status',
            width: 150,
            renderCell: (params) => {
              let color;
              switch (params.value) {
                case 'PENDING':
                  color = 'orange';
                  break;
                case 'APPROVED':
                  color = 'green';
                  break;
                case 'REJECTED':
                  color = 'red';
                  break;
                default:
                  color = 'black';
              }
              return (
                <span style={{ color }}>
                  {params.value}
                </span>
              );
            },
          },
          { field: 'Catatan Bendahara', width: 200 },
        ]}
        rows={data.map((item, index) => ({
          id: index,
          'Tanggal Pembayaran': Utils.formatDate(item.payment_date),
          'Nama Siswa': item.nama_siswa,
          'Nama Tagihan': item.nama_tagihan,
          'Nominal Pembayaran': Utils.formatCurrency(item.amount_paid),
          'Bukti Pembayaran': item.url_bukti_pembayaran,
          'Status': item.status,
          'Catatan Bendahara': item.catatan===undefined || item.catatan==="" || item.catatan===null ? '-' : item.catatan,
        }))}
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

/*---------------------------------------------------ORANG TUA(BOTTOM)---------------------------------------------------*/


  const getComponentDaftarUlang = (role: string): JSX.Element => {
    switch (role) {
      case 'Bendahara':
        return (
          <Tabs className={styles.tabs} defaultValue="Pengaturan Pembayaran">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Tabs.List>
                <Tabs.Tab value='Pengaturan Pembayaran' leftSection={<IconSettings size={24} />}>
                  Pengaturan Pembayaran
                </Tabs.Tab>
                <Tabs.Tab value='Pengaturan Discount' leftSection={<IconDiscount size={24} />}>
                  Pengaturan Discount
                </Tabs.Tab>
                <Tabs.Tab value='Riwayat Pembayaran' leftSection={<IconHistory size={24} />}>
                  Riwayat Pembayaran
                </Tabs.Tab>
                <Tabs.Tab value='Pengaturan Status Bill' leftSection={<IconFileInvoice size={24} />}>
                  Pengaturan Status Bill
                </Tabs.Tab>
              </Tabs.List>
            </div>
            
            <Tabs.Panel value='Pengaturan Pembayaran'>
              <div className={styles.pengaturan__pembayaran}>
                <Button
                  color='#F37F37'
                  style={{marginBottom: '1.5rem'}}
                  onClick={openTagihan}
                  leftSection={<IconPlus size={14} />}
                >
                  Buat Tagihan Baru
                </Button>
                {getPengaturanDaftarUlangAccordion(DaftarUlangBillList)}
              </div>
            </Tabs.Panel>
            
            <Tabs.Panel value='Riwayat Pembayaran'>
            <div className={styles.riwayat__pembayaran}>
              {getRiwayatPembayaranDaftarUlangTable(DaftarUlangPaymentList)}
            </div>
            </Tabs.Panel>
            
            <Tabs.Panel value='Pengaturan Discount'>
              <div className={styles.pengaturan__discount}>
                <Button
                  color='#F37F37'
                  style={{marginBottom: '1.5rem'}}
                  onClick={openAddDiscountModal}
                  leftSection={<IconPlus size={14} />}
                >
                  Tambah Discount Baru
                </Button>
                {getDiscountTable(discountList)}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value='Pengaturan Status Bill'>
              <div className={styles.ubah_status_bill}>
                {getUbahStatusTagihanTable(AllStudentBillList)}
              </div>
            </Tabs.Panel>
          </Tabs>
        );
        case 'Orang Tua':
          return (
            <div className={styles.catatan__daftar__ulang}>
              <div className={styles.catatan__daftar__ulang__button}>
                <Button
                  style={{marginRight: '1rem'}}
                  color='#3FA8E2'
                  onClick={openInformasi}
                  leftSection={<IconInfoCircle size={14}
                />}>
                  Informasi Pembayaran Daftar Ulang
                </Button>
                <Button
                  onClick={openUnggahBuktiPembayaran}
                  style={{marginLeft: '1rem'}}
                  color='#F37F37'
                leftSection={<IconPlus size={14} />}>
                  Unggah Bukti Pembayaran
                </Button>
              </div>
              
              <h2>Catatan Daftar Ulang</h2>
              {getDaftarUlangBillOrtuAccordion(DaftarUlangBillOrtuList)}
              
              
              <h2 style={{margin: '2rem'}}>Riwayat Pembayaran Daftar Ulang</h2>
              {getRiwayatPembayaranDaftarUlangOrtuTable(DaftarUlangPaymentOrtuList)}
              
            </div>
          );
      case 'Sekretaris':
          return <div>Sekretaris Component</div>;
      case 'Admin':
        return <div>Admin Component</div>;
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
      setUser(JSON.parse(userCookie));
      setIsLoading(false); 
    }
    setIsLoading(false);
  }, []);

  return (
    <div className={styles.daftar__ulang}>
      <Header />
      {addTagihanBaruModal()}
      {getInformasiModal()}
      {addBuktiPembayaranModal()}
      {editTagihanModal()}
      {editStatusModal()}
      {editDiscountModal()}
      {addDiscountModal()}
      <h1 className={styles.title}>Daftar Ulang</h1>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {user === null ? <></> : getComponentDaftarUlang(user.role)}

      <Footer />
    </div>
  );
}
