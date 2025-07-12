import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './pengeluaran_rumah_tangga.module.css';
import Utils from '../../utils';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export default function PengeluaranRumahTanggaView() {
  const [tambahPengeluaranOpened, { open: openTambahPengeluaran, close: closeTambahPengeluaran }] = useDisclosure(false);

  const formTambahPengeluaran = useForm({
    mode: 'uncontrolled',
    initialValues: { jenis_pengeluaran: '', nama: '', nominal: 0, id_user: '' },
  
    validate: {
      jenis_pengeluaran: (value: string) => (value.length < 2 ? 'Mohon pilih jenis pengeluaran' : null),
      nama: (value: string) => (value.length < 2 ? 'Nama harus lebih dari 1 karakter' : null),
      nominal: (value: number) => (value <= 0 ? 'Nominal tidak boleh kurang dari atau sama dengan 0' : null),
      id_user: (value: string) => (value.length < 2 ? 'Mohon pilih ID User' : null),
    }
  });
  
  const user = {
    name: 'John Doe',
    role: 'Bendahara',
    // role: 'KepalaSekolah',
  };

  const riwayatPengeluaranRumahTanggaSiswa = [
    {
      tanggal_pengeluaran: '2021-08-01',
      jenis_pengeluaran: 'Rutin',
      nama: 'Biaya Kegiatan',
      nominal: 1500000,
      id_user: 'John Doe',
    },
    {
      tanggal_pengeluaran: '2022-01-01',
      jenis_pengeluaran: 'Incidental',
      nama: 'Biaya Perlengkapan',
      nominal: 1500000,
      id_user: 'John Doe',
    },
    {
      tanggal_pengeluaran: '2022-08-01',
      jenis_pengeluaran: 'Incidental',
      nama: 'Pembelian Buku Sekolah',
      nominal: 500000,
      id_user: 'Jane Doe',
    },
    {
      tanggal_pengeluaran: '2023-01-01',
      jenis_pengeluaran: 'Incidental',
      nama: 'Biaya Seragam',
      nominal: 750000,
      id_user: 'John Doe',
    },
    {
      tanggal_pengeluaran: '2023-08-01',
      jenis_pengeluaran: 'Rutin',
      nama: 'Biaya Bulanan Sekolah',
      nominal: 1500000,
      id_user: 'Jane Doe',
    },
    {
      tanggal_pengeluaran: '2024-01-01',
      jenis_pengeluaran: 'Rutin',
      nama: 'Biaya Kegiatan',
      nominal: 2000000,
      id_user: 'John Doe',
    },
    {
      tanggal_pengeluaran: '2024-08-01',
      jenis_pengeluaran: 'Incidental',
      nama: 'Pembelian Alat Tulis',
      nominal: 300000,
      id_user: 'Jane Doe',
    },
    {
      tanggal_pengeluaran: '2025-01-01',
      jenis_pengeluaran: 'Incidental',
      nama: 'Biaya Seragam',
      nominal: 500000,
      id_user: 'John Doe',
    },
    {
      tanggal_pengeluaran: '2025-08-01',
      jenis_pengeluaran: 'Rutin',
      nama: 'Biaya Bulanan Sekolah',
      nominal: 1500000,
      id_user: 'John Doe',
    },
  ];  
  

  const TambahPengeluaran = () => {
    return (
      <Modal centered opened={tambahPengeluaranOpened} onClose={closeTambahPengeluaran} title="Tambah Pengeluaran">
        <form onSubmit={() => {formTambahPengeluaran.onSubmit(console.log)}}>
          <Select
            label="Jenis Pengeluaran"
            placeholder="Pilih Jenis Pengeluaran"
            key={formTambahPengeluaran.key('jenis_pengeluaran')}
            data={['Rutin', 'Incidental']}
          />
          <TextInput
            label="Nama"
            placeholder='Nama'
            key={formTambahPengeluaran.key('nama')}
          />
          <TextInput
            label="Nominal"
            placeholder='Rp 0'
            key={formTambahPengeluaran.key('nominal')}
          />
          <Select
            label="ID User"
            placeholder="Pilih ID User"
            key={formTambahPengeluaran.key('id_user')}
            data={['John Doe', 'Jane Doe']}
          />
          <Button fullWidth color='#F37F37' type="submit" mt="sm">
            Submit
          </Button>
        </form>
      </Modal>
    )
  }
  

  const getComponentPengeluaranRumahTangga = (role : string) => {
    switch (role) {
    case 'Bendahara':
    case 'KepalaSekolah':
      return (
        <div className={styles.catatan__pengeluaran__rumah__tangga}>
          <div className={styles.catatan__pengeluaran__rumah__tangga__button}>
            <Button
              onClick={openTambahPengeluaran}
              style={{marginLeft: '1rem'}}
              color='#F37F37'
            leftSection={<IconPlus size={14} />}>
              Tambah Pengeluaran
            </Button>
          </div>
          <DataGrid
              className={styles.riwayat__pengeluaran__rumah__tangga__orang__tua}
              columns={[
                { field: 'Tanggal Pengeluaran', width: 150 },
                { field: 'Jenis Pengeluaran', width: 150 },
                { field: 'Nama', hideable: false, width: 200 },
                { field: 'Nominal', width: 150 },
                { field: 'ID User', width: 150 },
                {
                  field: 'Action',
                  headerName: 'Action',
                  renderCell: (params) => (
                    <div>
                      <Button variant='transparent'><IconTrash color='red' size={14} /></Button>
                      <Button variant='transparent'><IconPencil color='green' size={14} /></Button>
                    </div>
                  ),
                },
              ]}
              rows={
                riwayatPengeluaranRumahTanggaSiswa.map((val, index) => ({
                  id: index,
                  'Tanggal Pengeluaran': val.tanggal_pengeluaran,  // Menambahkan field Tanggal Pengeluaran
                  'Jenis Pengeluaran': val.jenis_pengeluaran,
                  Nama : val.nama,
                  Nominal: Utils.formatCurrency(val.nominal),
                  'ID User': val.id_user,
                  Action : 'Action',
                }))
              }
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
        </div>
      )
    default:
      return (
        <div>
          <h1>Unauthorized</h1>
        </div>
      )
    }
  }

  return (
    <div className={styles.pengeluaran}>
      <Header />
      {TambahPengeluaran()}
      <h1 className={styles.title}>Pengeluaran Rumah Tangga</h1>

      {user === null ? <></> : getComponentPengeluaranRumahTangga(user.role)}

      <Footer />
    </div>
  );
}
  