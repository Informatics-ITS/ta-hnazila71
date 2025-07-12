import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './spp_komite_ekstrakurikuler.module.css';
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

export default function SPPView() {

  const [isLoading, setIsLoading] = useState(true);
  
  const [user, setUser] = useState<{ username: string; role: string; access_token: string } | null>(null);


/*---------------------------------------------------BENDAHARA(TOP)---------------------------------------------------*/
//A. TAMBAHAN TAGIHAN BARU (Bendahara)
  const [tagihanOpened, { open: openTagihan, close: closeTagihan }] = useDisclosure(false);
  
  //1A. Form Tagihan Baru(Bendahara)
  const [tagihanBaru, setTagihanBaru] = useState<{
    nama_tagihan: string,
    biaya_spp: number,
    biaya_komite: number,
    biaya_ekstrakulikuler: number,
    bulan: string,
    tahun_ajaran: string,
    due_date: Date | null,
  }>({
    nama_tagihan: '',
    biaya_spp: 0,
    biaya_komite: 0,
    biaya_ekstrakulikuler: 0,
    bulan: '',
    tahun_ajaran: '',
    due_date: null,
  });

  // State untuk notifikasi
  const [notification, setNotification] = useState({ message: '', type: '' });
  //2A. fetch dari backend (body request raw JSON)
  const addTagihanBaru = async () => {
    console.log(addTagihanBaru);

    const formAddBillSPP = {
        nama: tagihanBaru.nama_tagihan,
        biaya_spp: tagihanBaru.biaya_spp,
        biaya_komite: tagihanBaru.biaya_komite,
        biaya_ekstrakulikuler: tagihanBaru.biaya_ekstrakulikuler,
        bulan: tagihanBaru.bulan,
        tahun_ajaran: tagihanBaru.tahun_ajaran,
        due_date: Utils.formatDateWithDash(tagihanBaru.due_date as Date)
    };

    try {
      const response = await fetch(Utils.add_bill_spp, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formAddBillSPP),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        setNotification({ message: 'Tagihan berhasil ditambahkan!', type: 'success' });
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
      <Box p="lg">
        <Box mb="md">
          <TextInput
            label="Nama Tagihan"
            placeholder="SPP Bulan ... Tahun ..."
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, nama_tagihan: e.target.value })}
          />
        </Box>
        <Box mb="md">
          <TextInput
            label="Biaya SPP"
            placeholder="Rp 0"
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, biaya_spp: parseInt(e.target.value) })}
          />
        </Box>
        <Box mb="md">
          <TextInput
            label="Biaya Komite"
            placeholder="Rp 0"
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, biaya_komite: parseInt(e.target.value) })}
          />
        </Box>
        <Box mb="md">
          <TextInput
            label="Biaya Ekstrakurikuler"
            placeholder="Rp 0"
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, biaya_ekstrakulikuler: parseInt(e.target.value) })}
          />
        </Box>
        <Box mb="md">
          <Select
            label="Bulan"
            placeholder="Bulan"
            onChange={(value) => {
              if (value !== null) {
                setTagihanBaru({ ...tagihanBaru, bulan: value });
              }
            }}
            data={['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
          />
        </Box>
        <Box mb="md">
          <TextInput
            label="Tahun Ajaran"
            placeholder="Tahun Ajaran"
            onChange={(e) => setTagihanBaru({ ...tagihanBaru, tahun_ajaran: e.target.value })}
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
        <Button onClick={addTagihanBaru} fullWidth color="#F37F37">SUBMIT</Button>
        {notification.message && (
          <Text className={`notification ${notification.type}`}>{notification.message}</Text>
        )}
      </Box>
    </Modal>
    )
  }

  
//B. PENGATURAN PEMBAYARAN SPP (Bendahara)
  //1B. State untuk data tagihan bendahara
  const [SPPBillList, setSPPBillList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //2B. Fetch data tagihan bendahara
  const fetchSPPBillList = async () => {
    try {
      const response = await fetch(Utils.get_bill_spp, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSPPBillList(data.data);
        setErrorMessage(null);
      } else {
        console.error('Error fetching SPP Bill list:', data.message);
        setErrorMessage(data.message); 
      }
    } catch (error) {
      console.error('Error fetching SPP Bill list:', error);
      setErrorMessage('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3B. Fetch data tagihan bendahara useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Bendahara') {
        await fetchSPPBillList();
      }
    };
    fetchData();
  }, [user]);

  //4B. Table Pengaturan Pembayaran SPP
  const getPengaturanSppTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <Table className={styles.table}>
        <thead>
          <tr>
            <th className="center-text">Bulan</th>
            <th className="center-text">Tenggat Waktu</th>
            <th className="center-text">Biaya SPP</th>
            <th className="center-text">Biaya Komite</th>
            <th className="center-text">Biaya Ekstrakurikuler</th>
            <th className="center-text">Total Biaya</th>
            <th className="center-text">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="center-text">{item.bulan}</td>
              <td className="center-text">{Utils.formatDate(item.due_date)}</td>
              <td className="center-text">{Utils.formatCurrency(item.biaya_spp)}</td>
              <td className="center-text">{Utils.formatCurrency(item.biaya_komite)}</td>
              <td className="center-text">{Utils.formatCurrency(item.biaya_ekstrakulikuler)}</td>
              <td className="center-text">{Utils.formatCurrency(item.total_amount)}</td>
              <td className="center-text">
                <Button
                  variant='transparent'
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus data tagihan ini?')) {
                      deleteSPPBill(item.id); 
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
  
  
  //5B. Accordion Pengaturan Pembayaran SPP
  const getPengaturanSppAccordion = (data: any[]) => {
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
    }, {} as { [key: string]: { bulan: string, due_date: string, biaya_spp: number, biaya_komite: number, biaya_ekstrakulikuler: number, total_amount: number }[] });
  
    const defaultYear = Object.keys(groupedData); 
    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={defaultYear[0]}>
        {Object.keys(groupedData).map((tahunAjaran, index) => (
          <Accordion.Item key={index} value={tahunAjaran}>
            <Accordion.Control><span>Tahun {tahunAjaran}</span></Accordion.Control>
            <Accordion.Panel>
              {getPengaturanSppTable(groupedData[tahunAjaran])}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };

//C. DELETE TAGIHAN (Bendahara)
  //1C. Fetch delete tagihan
  const deleteSPPBill = async (id: string) => {
    try {
      const response = await fetch(`${Utils.del_bill_spp}/${id}`, {
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
        await fetchSPPBillList();
      } else {
        console.error('Error deleting SPP Bill:', data.message);
        setNotification({ message: data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting SPP Bill:', error);
      setNotification({ message: 'Terjadi kesalahan saat menghapus tagihan.', type: 'error' });
    }
  };

//D. EDIT TAGIHAN (Bendahara)
  //1D. State untuk edit tagihan bendahara
  const [editTagihan, setEditTagihan] = useState<{
    id: string,
    nama: string,
    biaya_spp: number,
    biaya_komite: number,
    biaya_ekstrakulikuler: number,
    bulan: string,
    tahun_ajaran: string,
    due_date: Date | null,
  } | null>(null);

  //2D. Fetch edit tagihan bendahara
  const editSPPBill = async (id: string) => {
    if (!id) {
      setNotification({ message: 'ID tagihan tidak valid.', type: 'error' });
      return;
    }

    console.log(editTagihan);

    const formEditBillSPP = {
      nama: editTagihan?.nama ?? '',
      biaya_spp: editTagihan?.biaya_spp ?? 0,
      biaya_komite: editTagihan?.biaya_komite ?? 0,
      biaya_ekstrakulikuler: editTagihan?.biaya_ekstrakulikuler ?? 0,
      bulan: editTagihan?.bulan ?? '',
      tahun_ajaran: editTagihan?.tahun_ajaran ?? '',
      due_date: editTagihan?.due_date ? Utils.formatDateWithDash(new Date(editTagihan.due_date)) : ''
    };

    try {
      const response = await fetch(`${Utils.put_bill_spp}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formEditBillSPP),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        setNotification({ message: 'Tagihan berhasil diubah!', type: 'success' });
        await fetchSPPBillList();
      } else {
        const errorData = await response.json();
        console.log('Error:', response.status, errorData);
        setNotification({ message: 'Terjadi kesalahan saat mengubah tagihan.', type: 'error' });
      }
    } catch (err) {
      console.log('Error editSPPBill:', err);
      setNotification({ message: 'Terjadi kesalahan saat mengubah tagihan.', type: 'error' });
    }
  };


  //3D. Modal Edit Tagihan (Bendahara)
  const [tempBiayaSPP, setTempBiayaSPP] = useState<string>('');
  const [tempBiayaKomite, setTempBiayaKomite] = useState<string>('');
  const [tempBiayaEkstrakurikuler, setTempBiayaEkstrakurikuler] = useState<string>('');

  useEffect(() => {
    if (editTagihan) {
      setTempBiayaSPP(editTagihan.biaya_spp.toString());
      setTempBiayaKomite(editTagihan.biaya_komite.toString());
      setTempBiayaEkstrakurikuler(editTagihan.biaya_ekstrakulikuler.toString());
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
              placeholder="SPP Bulan ... Tahun ..."
              value={editTagihan?.nama ?? ''}
              onChange={(e) => setEditTagihan(editTagihan ? { ...editTagihan, nama: e.target.value } : null)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Biaya SPP"
              placeholder="Rp 0"
              value={tempBiayaSPP}
              onChange={(e) => setTempBiayaSPP(e.target.value)}
              onBlur={() => setEditTagihan(editTagihan ? { ...editTagihan, biaya_spp: parseInt(tempBiayaSPP, 10) || 0 } : null)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Biaya Komite"
              placeholder="Rp 0"
              value={tempBiayaKomite}
              onChange={(e) => setTempBiayaKomite(e.target.value)}
              onBlur={() => setEditTagihan(editTagihan ? { ...editTagihan, biaya_komite: parseInt(tempBiayaKomite, 10) || 0 } : null)}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Biaya Ekstrakurikuler"
              placeholder="Rp 0"
              value={tempBiayaEkstrakurikuler}
              onChange={(e) => setTempBiayaEkstrakurikuler(e.target.value)}
              onBlur={() => setEditTagihan(editTagihan ? { ...editTagihan, biaya_ekstrakulikuler: parseInt(tempBiayaEkstrakurikuler, 10) || 0 } : null)}
            />
          </Box>
          <Box mb="md">
            <Select
              label="Bulan"
              placeholder="Bulan"
              value={editTagihan?.bulan ?? ''}
              onChange={(value) => {
                if (value !== null) {
                  setEditTagihan(editTagihan ? { ...editTagihan, bulan: value } : null);
                }
              }}
              data={['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
            />
          </Box>
          <Box mb="md">
            <TextInput
              label="Tahun Ajaran"
              placeholder="Tahun Ajaran"
              value={editTagihan?.tahun_ajaran ?? ''}
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
                editSPPBill(editTagihan?.id || '');
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
        const response = await fetch(Utils.discount_spp, {
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
  
    //3B. Fetch data tagihan bendahara useEffect
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
        const response = await fetch(`${Utils.discount_spp}/${id}`, {
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
    const response = await fetch(`${Utils.discount_spp}/${id}`, {
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
            placeholder="Angka"
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
    const response = await fetch(`${Utils.discount_spp}`, {
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
    } else {
      console.log('Error:', response.status, data);
      setNotification({ message: 'Terjadi kesalahan saat menambahkan discount.', type: 'error' });
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
            placeholder="Persentase"
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
      </Box>
    </Modal>
  );
};


  
//F. RIWAYAT PEMBAYARAN SPP (Bendahara)
  //1F. State untuk data pembayaran bendahara
  const [SPPPaymentList, setSPPPaymentList] = useState<any[]>([]);
  const [errorMessagePayment, setErrorMessagePayment] = useState<string | null>(null);
  const [selectedBerkas, setSelectedBerkas] = useState(null);
  const [detailBerkasOpened, { open: openDetailBerkas, close: closeDetailBerkas }] = useDisclosure(false);
  const openBerkasDetail = (data : any) => {
    setSelectedBerkas(data);
    openDetailBerkas(); 
  };


    //2F. Fetch data pembayaran bendahara
    const fetchAllSPPPaymentList = async () => {
      try {
        const response = await fetch(Utils.get_all_payments_spp, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setSPPPaymentList(data.data);
          setErrorMessagePayment(null);
        } else {
          console.error('Error fetching All SPP Payment list:', data.message);
          setErrorMessagePayment(data.message); 
        }
      } catch (error) {
        console.error('Error fetching All SPP Payment list:', error);
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
      const response = await fetch(`${Utils.update_payment_status_daftar_ulang}${id_user_bill_payment}`, {
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
        await fetchAllSPPPaymentList();
        closeEditStatus();
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
        await fetchAllSPPPaymentList();
      }
    };
    fetchData();
  }, [user]);

  //4F. Table Riwayat Pembayaran SPP
  const getRiwayatPembayaranSppTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <DataGrid
        className={styles.riwayat__pembayaran}
        columns={[
          { field: 'Tanggal Pembayaran', width: 150 },
          { field: 'Nama Siswa', width: 150 },
          { field: 'Nama Tagihan', width: 200 },
          { field: 'Nominal Pembayaran', width: 150 },
          {
            field: 'Bukti Pembayaran', width: 180,
            renderCell: (params) => (
              <div>
                <Chip
                  icon={<IconDownload size={20} />}
                  label="Download Gambar"
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
    const response = await fetch(`${Utils.student_bill_status}${id_bill}`, {
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

//A. INFORMASI PEMBAYARAN SPP, KOMITE, DAN EKSTRAKURIKULER
const [informasiOpened, { open: openInformasi, close: closeInformasi }] = useDisclosure(false);
const getInformasiModal = () => {
  return (
    <Modal
      opened={informasiOpened}
      onClose={closeInformasi}
      title="Informasi Pembayaran SPP, Komite, dan Ekstrakurikuler"
      size='70%'
    >
      <div className={styles.informasi__modal}>
        <Paper shadow="md" p="xl" style={{margin: '1rem'}}>
          <Text>
            <b>Tata Cara Pembayaran SPP, Komite, dan Ekstrakurikuler</b>
          </Text>
          <Text
            style={{fontSize: rem(12), fontWeight: 400, marginTop: rem(10)}}
          >
            1. Pembayaran SPP, Komite, dan Ekstrakurikuler dapat dilihat dengan menekan tombol “Unggah Bukti Pembayaran”<br/>
            2. Akan muncul tampilan form untuk mengunggah bukti pembayaran.<br/>
            3. Silakan pilih siswa yang akan dibayarkan SPP, Komite, dan Ekstrakurikuler nya, kemudian masukkan nominal pembayaran dan pilih metode pembayaran.<br/>
            4. Kemudian unggah bukti bayar melalui kolom bukti pembayaran. <br/>
            5. Setelah memasukkan semua informasi pembayaran, klik “Kirim”. <br/>
            6. Mohon tunggu 1x24 jam untuk proses verifikasi dan update “Status” catatan pembayaran SPP, Komite, dan Ekstrakurikuler siswa.
          </Text>
        </Paper>
        <Paper shadow="md" p="xl" style={{margin: '1rem'}}>
          <Text>
            <b>Metode Pembayaran SPP</b>
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
  component_paid: 'SPP',
  bukti_pembayaran: 'https://www.google.com',
});

const [bukti_pembayaran, set_bukti_pembayaran] = useState<File | null>(null);

// 2B. Fetch dari backend (body request form-data)
const addBuktiPembayaran = async (id_student: string, id_bill: string) => {
  console.log('addBuktiPembayaran called with:', id_student, id_bill);

  // Buat FormData
  const formAddBillSPPOrtu = new FormData();
  formAddBillSPPOrtu.append('amount_paid', buktiPembayaran.amount_paid.toString());
  formAddBillSPPOrtu.append('component_paid', buktiPembayaran.component_paid);
  
  // Jika ada file bukti pembayaran, tambahkan ke FormData
  if (bukti_pembayaran) {
    formAddBillSPPOrtu.append('bukti_pembayaran', bukti_pembayaran, bukti_pembayaran.name);
  }

  // Buat query params
  const queryParams = new URLSearchParams({
    student: id_student,
    spp: id_bill
  });

  try {
    // Lakukan fetch ke server
    const response = await fetch(`${Utils.add_bill_spp_ortu}?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user?.access_token}`,
      },
      body: formAddBillSPPOrtu, // Masukkan FormData ke body request
    });

    // Cek status respons
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('application/json')) {
      // Jika respons berhasil dan JSON
      const data = await response.json();
      console.log('Success:', data);
      setNotification({ message: 'Bukti pembayaran berhasil diunggah!', type: 'success' });
      setUploadResponseMessage('Bukti pembayaran berhasil diunggah!');
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

// State untuk detail tagihan
const [detailTagihan, setDetailTagihan] = useState<{
  biaya_spp: number;
  biaya_komite: number;
  biaya_ekstrakulikuler: number;
  total_paid: number;
  remaining_amount: number;
  payment_status: string;
}>({
  biaya_spp: 0,
  biaya_komite: 0,
  biaya_ekstrakulikuler: 0,
  total_paid: 0,
  remaining_amount: 0,
  payment_status: ''
});

// Update detailTagihan saat tagihan dipilih
useEffect(() => {
  if (selectedBill) {
    const selected = SPPBillOrtuList.find((bill: any) => bill.id_bill === selectedBill.id_bill);
    if (selected) {
      setDetailTagihan({
        biaya_spp: selected.biaya_spp || 0,
        biaya_komite: selected.biaya_komite || 0,
        biaya_ekstrakulikuler: selected.biaya_ekstrakulikuler || 0,
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
            data={SPPBillOrtuList.map((bill: any) => ({
              value: bill.id_bill,
              label: `${bill.nama_tagihan} - ${bill.nama_siswa}`,
              id_student: bill.id_student,
              id_bill: bill.id_bill
            }))}
            onChange={(value) => {
              const selected = SPPBillOrtuList.find((bill: any) => bill.id_bill === value);
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
            <li>Biaya SPP: Rp {detailTagihan.biaya_spp.toLocaleString()}</li>
            <li>Biaya Komite: Rp {detailTagihan.biaya_komite.toLocaleString()}</li>
            <li>Biaya Ekstrakulikuler: Rp {detailTagihan.biaya_ekstrakulikuler.toLocaleString()}</li>
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


//C.CATATAN SPP, KOMITE, DAN EKSTRAKURIKULER (Orang Tua)
  //1C. State untuk data tagihan orang tua
  const [SPPBillOrtuList, setSPPBillOrtuList] = useState<any[]>([]);
  const [ErrorBillOrtuList, setErrorBillOrtuList] = useState<string | null>(null);

  //2C. Fetch data tagihan orang tua
  const fetchSPPBillOrtuList = async () => {
    try {
      const response = await fetch(Utils.get_bill_spp_ortu, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSPPBillOrtuList(data.data);
        setErrorBillOrtuList(null);
      } else {
        console.error('Error fetching SPP Bill Ortu list:', data.message);
        setErrorBillOrtuList(data.message); 
      }
    } catch (error) {
      console.error('Error fetching SPP Bill Ortu list:', error);
      setErrorBillOrtuList('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3C. Fetch data tagihan orang tua useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Orang Tua') {
        await fetchSPPBillOrtuList();
      }
    };
    fetchData();
  }, [user]);

  //4C. Table Pembayaran SPP, Komite, dan Ekstrakurikuler (Orang Tua)
  const getSPPBillOrtuTable = (data: any[]) => {
    if (!data || data.length === 0) {
      return <div>Tidak ada data yang tersedia.</div>;
    }
  
    return (
      <Table>
        <thead>
          <tr>
            <th className="center-text">Nama Tagihan</th>
            <th className="center-text">Tenggat Waktu</th>
            <th className="center-text">Belum Dibayar</th>
            <th className="center-text">Sudah Dibayar</th>
            <th className="center-text">Status Pembayaran</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="center-text">{item.nama_tagihan}</td>
              <td className="center-text">{Utils.formatDate(item.due_date)}</td>
              <td className="center-text">{Utils.formatCurrency(item.remaining_amount)}</td>
              <td className="center-text">{Utils.formatCurrency(item.total_paid)}</td>
              <td className="center-text">
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
  
  //5C. Accordion Catatan SPP, Komite, dan Ekstrakurikuler (Orang Tua)
  const getSPPBillOrtuAccordion = (data: any[]) => {
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
              {getSPPBillOrtuTable(groupedData[namaSiswa])}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  };
  

//D. RIWAYAT PEMBAYARAN SPP (Orang Tua)
  //1D. State untuk data pembayaran bendahara
  const [SPPPaymentOrtuList, setSPPPaymentOrtuList] = useState<any[]>([]);
  const [errorMessagePaymentOrtu, setErrorMessagePaymentOrtu] = useState<string | null>(null);

  //2D. Fetch data pembayaran bendahara
  const fetchAllSPPPaymentOrtuList = async () => {
    try {
      const response = await fetch(Utils.get_all_payments_spp_ortu, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSPPPaymentOrtuList(data.data);
        setErrorMessagePaymentOrtu(null);
      } else {
        console.error('Error fetching All SPP Payment Ortu list:', data.message);
        setErrorMessagePaymentOrtu(data.message); 
      }
    } catch (error) {
      console.error('Error fetching All SPP Payment Ortu list:', error);
      setErrorMessagePaymentOrtu('Terjadi kesalahan saat mengambil data.');
    }
  }

  //3D. Fetch data pembayaran bendahara useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'Orang Tua') {
        await fetchAllSPPPaymentOrtuList();
      }
    };
    fetchData();
    console.log('SPPPaymentOrtuList:', SPPPaymentOrtuList);
  }, [user]);

  //4D. Table Riwayat Pembayaran SPP
  const getRiwayatPembayaranSppOrtuTable = (data: any[]) => {
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
                <Button variant='transparent'><IconDownload color='blue' size={14} /></Button>
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



  const getComponentSPP = (role: string): JSX.Element => {
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
                {getPengaturanSppAccordion(SPPBillList)}
              </div>
            </Tabs.Panel>
            
            <Tabs.Panel value='Riwayat Pembayaran'>
            <div className={styles.riwayat__pembayaran}>
              {getRiwayatPembayaranSppTable(SPPPaymentList)}
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
          <div className={styles.catatan__spp}>
            <div className={styles.catatan__spp__button}>
              <Button
                style={{marginRight: '1rem'}}
                color='#3FA8E2'
                onClick={openInformasi}
                leftSection={<IconInfoCircle size={14}
              />}>
                Informasi Pembayaran SPP, Komite, dan Ekstrakurikuler
              </Button>
              <Button
                onClick={openUnggahBuktiPembayaran}
                style={{marginLeft: '1rem'}}
                color='#F37F37'
              leftSection={<IconPlus size={14} />}>
                Unggah Bukti Pembayaran
              </Button>
            </div>
            
            <h2>Catatan SPP, Komite, dan Ekstrakurikuler</h2>
            {getSPPBillOrtuAccordion(SPPBillOrtuList)}
            
            
            <h2 style={{margin: '2rem'}}>Riwayat Pembayaran SPP, Komite, dan Ekstrakurikuler</h2>
            {getRiwayatPembayaranSppOrtuTable(SPPPaymentOrtuList)}
            
          </div>
        );
      case 'Admin':
        return <div>Admin Component</div>;
      case 'Sekretaris':
        return <div>Sekretaris Component</div>;
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
    <div className={styles.spp}>
      <Header />
      {addTagihanBaruModal()}
      {getInformasiModal()}
      {addBuktiPembayaranModal()}
      {editTagihanModal()}
      {editStatusModal()}
      {editDiscountModal()}
      {addDiscountModal()}
      <h1 className={styles.title}>SPP, Komite, dan Ekstrakurikuler</h1>
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {user === null ? <></> : getComponentSPP(user.role)}

      <Footer />
    </div>
  );
}
