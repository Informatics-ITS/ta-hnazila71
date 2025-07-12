import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './spp_komite_ekstrakurikuler.module.css';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { Stepper, Image, Group, Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail, IconUser, IconUpload, IconStatusChange, IconCheck, IconEdit } from '@tabler/icons-react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export default function SppView() {
  const [tagihanOpened, { open: openTagihan, close: closeTagihan }] = useDisclosure(false);
  const [unggahBuktiPembayaranOpened, { open: openUnggahBuktiPembayaran, close: closeUnggahBuktiPembayaran }] = useDisclosure(false);
  const [informasiOpened, { open: openInformasi, close: closeInformasi }] = useDisclosure(false);

  const formTagihan = useForm({
    mode: 'uncontrolled',
    initialValues: {
      nama_tagihan: '',
      biaya_spp: 0,
      biaya_komite: 0,
      biaya_ekstrakulikuler: 0,
      bulan: '',
      tahun_ajaran: '',
      due_date: '',
    },
  
    validate: {
      nama_tagihan: (value: string) => (value.length < 0 ? 'Mohon masukkan nama tagihan' : null),
      biaya_spp: (value: number) => (value < 0 ? 'Biaya SPP tidak boleh kurang dari 0' : null),
      biaya_komite: (value: number) => (value < 0 ? 'Biaya Komite tidak boleh kurang dari 0' : null),
      biaya_ekstrakulikuler: (value: number) => (value < 0 ? 'Biaya Ekstrakurikuler tidak boleh kurang dari 0' : null),
      bulan: (value: string) => (value.length < 2 ? 'Mohon pilih bulan' : null),
      tahun_ajaran: (value: string) => (value.length < 0 ? 'Tahun Ajaran tidak boleh kurang dari 0' : null),
      due_date: (value: string) => (value.length < 2 ? 'Mohon pilih tenggat waktu' : null),
    },
  });
  

  const formUnggahBuktiPembayaran = useForm({
    mode: 'uncontrolled',
    initialValues: {
      nama_siswa: '',
      bulan: '',
      metode_pembayaran: '',
      nominal_pembayaran: 0,
      bukti_pembayaran: ''
    },
  
    validate: {
      nama_siswa: (value: string) => (value.length < 2 ? 'Mohon pilih nama siswa' : null),
      bulan: (value: string) => (value.length < 2 ? 'Mohon pilih bulan' : null),
      nominal_pembayaran: (value: number) => (value <= 0 ? 'Nominal pembayaran harus lebih besar dari 0' : null),
      bukti_pembayaran: (value: string) => (value.length < 2 ? 'Mohon unggah bukti pembayaran' : null),
    }
  });
  
  const user = {
    name: 'John Doe',
    role: 'Bendahara',
    // role: 'Sekretaris',
    // role: 'Orang Tua',
  };


  //Tagihan Bendahara
  const sppData = [ 
    {
      tahun_ajaran: '2021/2022',
      data: [
        {
          bulan: 'Agustus',
          due_date: '2021-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        },
        {
          bulan: 'Januari',
          due_date: '2022-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        }
      ]
    },
    {
      tahun_ajaran: '2022/2023',
      data: [
        {
          bulan: 'Agustus',
          due_date: '2022-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        },
        {
          bulan: 'Januari',
          due_date: '2023-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        }
      ]
    },
    {
      tahun_ajaran: '2023/2024',
      data: [
        {
          bulan: 'Agustus',
          due_date: '2023-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        },
        {
          bulan: 'Januari',
          due_date: '2024-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          total_amount: 190000,
        }
      ]
    }
  ]

  //Riwayat Bendahara
  const riwayatSppData = [
    {
      tanggal_pembayaran: '2024-08-15',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Ayu Pratiwi',
      nis: '1234567890',
      bulan: 'Agustus',
      nominal_pembayaran: 600000,
      metode_pembayaran: 'Bank BNI',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2024-09-10',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Budi Santoso',
      nis: '2345678901',
      bulan: 'September',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2024-10-12',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Citra Lestari',
      nis: '3456789012',
      bulan: 'Oktober',
      nominal_pembayaran: 200000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2024-11-05',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Dewi Wulandari',
      nis: '4567890123',
      bulan: 'November',
      nominal_pembayaran: 600000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2024-12-20',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Eka Prabowo',
      nis: '5678901234',
      bulan: 'Desember',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-01-10',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Farah Hanifah',
      nis: '5566778899',
      bulan: 'Januari',
      nominal_pembayaran: 500000,
      metode_pembayaran: 'E-Money OVO',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-02-05',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Gilang Kurniawan',
      nis: '6677889900',
      bulan: 'Februari',
      nominal_pembayaran: 250000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2025-03-12',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Hana Saputri',
      nis: '7788990011',
      bulan: 'Maret',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-04-15',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Irfan Ramadhan',
      nis: '8899001122',
      bulan: 'April',
      nominal_pembayaran: 500000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-05-08',
      nama_tagihan: 'SPP Bulan ... Tahun ...',
      nama_siswa: 'Joko Susanto',
      nis: '9900112233',
      bulan: 'Mei',
      nominal_pembayaran: 200000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
  ];
  

  //Catatan Orang Tua
  const catatanSpp = [
    {
      nama_siswa: 'John Doe',
      nis: '1234567890',
      data: [
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'Agustus',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-08-31',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'September',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-09-30',
          total_paid: 100000,
          remaining_amount: 90000,
          status_pembayaran: 'Belum Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'Oktober',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-10-31',
          total_paid: 100000,
          remaining_amount: 90000,
          status_pembayaran: 'Belum Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'November',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-11-30',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
      ],
    },
    {
      nama_siswa: 'Jane Doe',
      nis: '9876543210',
      data: [
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'Agustus',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-08-31',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'September',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-09-30',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'Oktober',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-10-31',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
        {
          nama_tagihan: 'SPP Bulan ... Tahun ...',
          bulan: 'November',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstrakulikuler: 40000,
          due_date: '2024-11-30',
          total_paid: 190000,
          remaining_amount: 0,
          status_pembayaran: 'Lunas',
        },
      ],
    },
  ];
  

  // Riwayat Orang Tua
  const riwayatSppSiswa = [
    {
      tanggal_pembayaran: '2024-08-15',
      nama_siswa: 'John Doe',
      bulan: 'Agustus',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank BNI',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-09-10',
      nama_siswa: 'John Doe',
      bulan: 'September',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2024-10-12',
      nama_siswa: 'John Doe',
      bulan: 'Oktober',  
      nominal_pembayaran: 40000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-11-05',
      nama_siswa: 'John Doe',
      bulan: 'November',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2024-12-20',
      nama_siswa: 'John Doe',
      bulan: 'Desember',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-01-10',
      nama_siswa: 'John Doe',
      bulan: 'Januari',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'E-Money OVO',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-02-05',
      nama_siswa: 'John Doe',
      bulan: 'Februari',  
      nominal_pembayaran: 40000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2025-03-12',
      nama_siswa: 'John Doe',
      bulan: 'Maret',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-04-15',
      nama_siswa: 'John Doe',
      bulan: 'April',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-05-08',
      nama_siswa: 'John Doe',
      bulan: 'Mei',  
      nominal_pembayaran: 40000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
  ];
  

  const getPengaturanSppTable = (data : any) => {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bulan</Table.Th>
            <Table.Th>Tenggat Waktu</Table.Th>
            <Table.Th>Biaya SPP</Table.Th>
            <Table.Th>Biaya Komite</Table.Th>
            <Table.Th>Biaya Ekstrakurikuler</Table.Th>
            <Table.Th>Total Biaya</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item : any, index : number) => (
            <Table.Tr key={index}>
              <Table.Td>{item.bulan}</Table.Td>
              <Table.Td>{item.due_date}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_spp)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_komite)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_ekstrakulikuler)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.total_amount)}</Table.Td>
              <Table.Td>
                <Button variant='transparent'><IconTrash color='red' size={14} /></Button>
                <Button variant='transparent'><IconPencil color='green' size={14} /></Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    )
  }

  const getPengaturanSppAccordion = (data : any) => {
    if (data.length === 0 || data === null) {
      return null;
    }

    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={data[0].tahun_ajaran}>
        {data.map((item : any, index : number) => (
          <Accordion.Item key={index} value={item.tahun_ajaran}>
            <Accordion.Control><span>Tahun {item.tahun_ajaran}</span></Accordion.Control>
            <Accordion.Panel>
              {getPengaturanSppTable(item.data)}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  }

  const getCatatanSppAccordion = (data : any) => {
    if (data.length === 0 || data === null) {
      return null;
    }

    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={data[0].nama_siswa}>
        {data.map((item : any, index : number) => (
          <Accordion.Item key={index} value={item.nama_siswa}>
            <Accordion.Control><span>{item.nama_siswa} - {item.nis}</span></Accordion.Control>
            <Accordion.Panel>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Bulan</Table.Th>
                    <Table.Th>Tenggat Waktu Pembayaran</Table.Th>
                    <Table.Th>SPP Belum Dibayar</Table.Th>
                    <Table.Th>SPP Sudah Dibayar</Table.Th>
                    <Table.Th>Status Pembayaran</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {item.data.map((val : any, idx : number) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{val.bulan}</Table.Td>
                      <Table.Td>{val.due_date}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.remaining_amount)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.total_paid)}</Table.Td>
                      <Table.Td className={styles.chip__span}>
                        {val.status_pembayaran === 'Lunas' ? 
                          <Chip label="Lunas" color="success" />
                          :
                          <Chip label="Belum Lunas" color="error" />
                        }
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    )    
  }

  const getTagihanBaruModal = () => {
    return (
      <Modal opened={tagihanOpened} onClose={closeTagihan} title="Buat Tagihan Baru">
        <form onSubmit={() => {formTagihan.onSubmit(console.log)}}>
          <TextInput
            label="Nama Tagihan"
            placeholder='Nama Tagihan'
            key={formTagihan.key('nama_tagihan')}
          />
          <TextInput
            label="Biaya SPP"
            placeholder='Rp 0'
            key={formTagihan.key('biaya_spp')}
          />
          <TextInput
            label="Biaya Komite"
            placeholder='Rp 0'
            key={formTagihan.key('biaya_komite')}
          />
          <TextInput
            label="Biaya Ekstrakurikuler"
            placeholder='Rp 0'
            key={formTagihan.key('biaya_ekstrakulikuler')}
          />
          <Select
            label="Bulan"
            placeholder="Bulan"
            key={formTagihan.key('bulan')}
            data={['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
          />
          <TextInput
            label="Tahun Ajaran"
            placeholder='Tahun Ajaran'
            key={formTagihan.key('tahun_ajaran')}
          />
          <DatePickerInput
            label="Tenggat Waktu"
            placeholder="dd/mm/yyy"
            key={formTagihan.key('due_date')}
          />
          <Button fullWidth color='#F37F37' type="submit" mt="sm">
            Submit
          </Button>
        </form>
      </Modal>
    )
  }

  const getUnggahBuktiPembayaran = () => {
    return (
      <Modal opened={unggahBuktiPembayaranOpened} onClose={closeUnggahBuktiPembayaran} title="Unggah Bukti Pembyaran">
        <form onSubmit={() => {formUnggahBuktiPembayaran.onSubmit(console.log)}}>
          <Select
            label="Pilih Tagihan"
            placeholder="Tagihan - Siswa"
            key={`${formUnggahBuktiPembayaran.key('nama_tagihan')}-${formUnggahBuktiPembayaran.key('nama_siswa')}`}
            data={riwayatSppData.map(item => `${item.nama_tagihan} - ${item.nama_siswa}`)}
          />
          <Select
            label="Bulan"
            placeholder="Bulan"
            key={formUnggahBuktiPembayaran.key('bulan')}
            data={['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
          />
          <TextInput
            label="Nominal Pembayaran"
            placeholder='Rp 0'
            key={formUnggahBuktiPembayaran.key('nominal_pembayaran')}
          />
          <TextInput
            label="Jenis Pembayaran"
            value="SPP"
            readOnly
            key={formUnggahBuktiPembayaran.key('jenis_pembayaran')}
            styles={{
              input: {
                backgroundColor: '#f0f0f0', 
                cursor: 'not-allowed', 
              },
            }}
          />
          <FileInput
            label="Bukti Pembayaran"
            placeholder="Image (*jpg, *jpeg, *png)"
          />
          <Button fullWidth color='#F37F37' type="submit" mt="sm">
            Submit
          </Button>
        </form>
      </Modal>
    )
  }

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

  const getComponentSpp = (role : string) => {
    switch (role) {
      case 'Bendahara':
      return (
        <Tabs className={styles.tabs} defaultValue="Pengaturan Pembayaran">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Tabs.List>
              <Tabs.Tab value='Pengaturan Pembayaran' leftSection={<IconSettings size={24} />}>
                Pengaturan Pembayaran
              </Tabs.Tab>
              <Tabs.Tab value='Riwayat Pembayaran' leftSection={<IconHistory size={24} />}>
                Riwayat Pembayaran
              </Tabs.Tab>
            </Tabs.List>
          </div>

          <Tabs.Panel value='Pengaturan Pembayaran'>
            <div className={styles.pengaturan__pembayaran}>
              <Button
                color='#F37F37'
                style={{marginBottom: '1.5rem'}}
                onClick={openTagihan}
                leftSection={<IconPlus size={14} />
              }>
                Buat Tagihan Baru
              </Button>
              {getPengaturanSppAccordion(sppData)}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value='Riwayat Pembayaran'>
            <DataGrid
              className={styles.riwayat__pembayaran}
              columns={[
                { field: 'Tanggal Pembayaran',
                  width: 150,
                },
                {
                  field: 'Nama Siswa',
                  width: 150,
                },
                // { field: 'NIS', hideable: false},
                { field: 'Bulan',
                  width: 150,
                },
                {
                  field: 'Nominal Pembayaran',
                  width: 150,
                },
                {
                  field: 'Bukti Bayar',
                  renderCell: (params) => (
                    <Button variant='transparent'><IconDownload color='green' size={14} /></Button>
                  ),
                },
                {
                  field: 'Status',
                  width: 150,
                },
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
                riwayatSppData.map((val, index) => ({
                id: index,
                'Tanggal Pembayaran': val.tanggal_pembayaran,
                'Nama Siswa': val.nama_siswa,
                NIS: val.nis,
                Bulan: val.bulan,
                'Nominal Pembayaran': Utils.formatCurrency(val.nominal_pembayaran),
                'Bukti Bayar': 'Bukti Bayar',
                Status: val.status_pembayaran,
                Action: 'Action',
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
          </Tabs.Panel>
        </Tabs>
      );
    case 'Admin':
      return (
        <div>
          <h1>Ini Admin</h1>
        </div>
      )
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
          {getCatatanSppAccordion(catatanSpp)}
          <h2 style={{margin: '2rem'}}>Riwayat Pembayaran SPP, Komite, dan Ekstrakurikuler</h2>
          <DataGrid
              className={styles.riwayat__spp__orang__tua}
              columns={[
                { field: 'Tanggal Pembayaran', width: 150 },
                { field: 'Nama Siswa', hideable: false, width: 200 },
                { field: 'Bulan', width: 150 },
                { field: 'Nominal Pembayaran', width: 150 },
                { field: 'Bukti Pembayaran', width: 150, renderCell: (params) => (
                  <Button variant='transparent'><IconDownload color='green' size={14} /></Button>
                )},
                { field: 'Status Pembayaran', width: 150, renderCell: (params) => (
                  <Chip label={params.value} color={params.value === 'Disetujui' ? 'success' : 'error'} />
                )}
              ]}
              rows={
                riwayatSppSiswa.map((val, index) => ({
                  id: index,
                  'Tanggal Pembayaran': val.tanggal_pembayaran,
                  'Nama Siswa': val.nama_siswa,
                  'Bulan': val.bulan,
                  'Nominal Pembayaran': Utils.formatCurrency(val.nominal_pembayaran),
                  'Bukti Pembayaran': 'Bukti Pembayaran',
                  'Status Pembayaran': val.status_pembayaran,
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
    <div className={styles.spp}>
      <Header />
      {getInformasiModal()}
      {getTagihanBaruModal()}
      {getUnggahBuktiPembayaran()}
      <h1 className={styles.title}>SPP, Komite, dan Ekstrakurikuler</h1>

      {user === null ? <></> : getComponentSpp(user.role)}

      <Footer />
    </div>
  );
}
  