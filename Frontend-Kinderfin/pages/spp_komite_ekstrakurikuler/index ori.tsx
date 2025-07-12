import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './spp_komite_ekstrakurikuler.module.css';
import Utils from '../../utils';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export default function SppView() {
  const [tagihanOpened, { open: openTagihan, close: closeTagihan }] = useDisclosure(false);
  const [unggahBuktiPembayaranOpened, { open: openUnggahBuktiPembayaran, close: closeUnggahBuktiPembayaran }] = useDisclosure(false);
  const [informasiOpened, { open: openInformasi, close: closeInformasi }] = useDisclosure(false);

  const formTagihan = useForm({
    mode: 'uncontrolled',
    initialValues: {
      tahun_ajaran: '',
      bulan: '',
      biaya_spp: 0,
      biaya_komite: 0,
      biaya_ekstra: 0,
      biaya_total: 0,
      tenggat_waktu: ''
    },
  
    validate: {
      tahun_ajaran: (value: string) => (value.length < 0 ? 'Tahun Ajaran tidak boleh kurang dari 0' : null),
      bulan: (value: string) => (value.length < 2 ? 'Mohon pilih bulan' : null),
      biaya_spp: (value: number) => (value < 0 ? 'Biaya SPP tidak boleh kurang dari 0' : null),
      biaya_komite: (value: number) => (value < 0 ? 'Biaya Komite tidak boleh kurang dari 0' : null),
      biaya_ekstra: (value: number) => (value < 0 ? 'Biaya Ekstrakurikuler tidak boleh kurang dari 0' : null),
      biaya_total: (value: number) => (value < 0 ? 'Biaya total tidak boleh kurang dari 0' : null),
      tenggat_waktu: (value: string) => (value.length < 2 ? 'Mohon pilih tenggat waktu' : null),
    },
  });
  

  const formUnggahBuktiPembayaran = useForm({
    mode: 'uncontrolled',
    initialValues: {
      nama_siswa: '',
      jenis_pembayaran: '',
      bulan: '',
      metode_pembayaran: '',
      nominal_pembayaran: 0,
      bukti_pembayaran: ''
    },
  
    validate: {
      nama_siswa: (value: string) => (value.length < 2 ? 'Mohon pilih nama siswa' : null),
      jenis_pembayaran: (value: string) => (value.length < 2 ? 'Mohon pilih jenis pembayaran' : null),
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
      tahun: '2021/2022',
      data: [
        {
          bulan: 'Agustus',
          tenggat_waktu: '2021-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        },
        {
          bulan: 'Januari',
          tenggat_waktu: '2022-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        }
      ]
    },
    {
      tahun: '2022/2023',
      data: [
        {
          bulan: 'Agustus',
          tenggat_waktu: '2022-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        },
        {
          bulan: 'Januari',
          tenggat_waktu: '2023-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        }
      ]
    },
    {
      tahun: '2023/2024',
      data: [
        {
          bulan: 'Agustus',
          tenggat_waktu: '2023-08-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        },
        {
          bulan: 'Januari',
          tenggat_waktu: '2024-01-01',
          biaya_spp: 100000,
          biaya_komite: 50000,
          biaya_ekstra: 40000,
        }
      ]
    }
  ]

  //Riwayat Bendahara
  const riwayatSppData = [
    {
      tanggal_pembayaran: '2024-08-15',
      nama_siswa: 'Ayu Pratiwi',
      nis: '1234567890',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'Agustus',
      nominal_pembayaran: 600000,
      metode_pembayaran: 'Bank BNI',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2024-09-10',
      nama_siswa: 'Budi Santoso',
      nis: '2345678901',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'September',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2024-10-12',
      nama_siswa: 'Citra Lestari',
      nis: '3456789012',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
      bulan: 'Oktober',
      nominal_pembayaran: 200000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2024-11-05',
      nama_siswa: 'Dewi Wulandari',
      nis: '4567890123',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'November',
      nominal_pembayaran: 600000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2024-12-20',
      nama_siswa: 'Eka Prabowo',
      nis: '5678901234',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'Desember',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-01-10',
      nama_siswa: 'Farah Hanifah',
      nis: '5566778899',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'Januari',
      nominal_pembayaran: 500000,
      metode_pembayaran: 'E-Money OVO',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-02-05',
      nama_siswa: 'Gilang Kurniawan',
      nis: '6677889900',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
      bulan: 'Februari',
      nominal_pembayaran: 250000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Belum Lunas',
    },
    {
      tanggal_pembayaran: '2025-03-12',
      nama_siswa: 'Hana Saputri',
      nis: '7788990011',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'Maret',
      nominal_pembayaran: 300000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-04-15',
      nama_siswa: 'Irfan Ramadhan',
      nis: '8899001122',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'April',
      nominal_pembayaran: 500000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      tanggal_pembayaran: '2025-05-08',
      nama_siswa: 'Joko Susanto',
      nis: '9900112233',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
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
          bulan: 'Agustus',
          tenggat_waktu: '2024-08-31',
          spp_belum_dibayar: 100000,
          komite_belum_dibayar: 50000,
          ekskul_belum_dibayar: 40000,
          spp_sudah_dibayar: 0,
          komite_sudah_dibayar: 0,
          ekskul_sudah_dibayar: 0,
          status_pembayaran: 'Lunas',
        },
        {
          bulan: 'September',
          tenggat_waktu: '2024-09-30',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 50000,
          ekskul_belum_dibayar: 40000,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 0,
          ekskul_sudah_dibayar: 0,
          status_pembayaran: 'Belum Lunas',
        },
        {
          bulan: 'Oktober',
          tenggat_waktu: '2024-10-31',
          spp_belum_dibayar: 100000,
          komite_belum_dibayar: 0,
          ekskul_belum_dibayar: 40000,
          spp_sudah_dibayar: 0,
          komite_sudah_dibayar: 50000,
          ekskul_sudah_dibayar: 0,
          status_pembayaran: 'Belum Lunas',
        },
        {
          bulan: 'November',
          tenggat_waktu: '2024-11-30',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 0,
          ekskul_belum_dibayar: 0,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 50000,
          ekskul_sudah_dibayar: 40000,
          status_pembayaran: 'Lunas',
        },
      ],
    },
    {
      nama_siswa: 'Jane Doe',
      nis: '9876543210',
      data: [
        {
          bulan: 'Agustus',
          tenggat_waktu: '2024-08-31',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 50000,
          ekskul_belum_dibayar: 40000,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 0,
          ekskul_sudah_dibayar: 0,
          status_pembayaran: 'Lunas',
        },
        {
          bulan: 'September',
          tenggat_waktu: '2024-09-30',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 0,
          ekskul_belum_dibayar: 0,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 50000,
          ekskul_sudah_dibayar: 40000,
          status_pembayaran: 'Lunas',
        },
        {
          bulan: 'Oktober',
          tenggat_waktu: '2024-10-31',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 0,
          ekskul_belum_dibayar: 0,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 50000,
          ekskul_sudah_dibayar: 40000,
          status_pembayaran: 'Lunas',
        },
        {
          bulan: 'November',
          tenggat_waktu: '2024-11-30',
          spp_belum_dibayar: 0,
          komite_belum_dibayar: 0,
          ekskul_belum_dibayar: 0,
          spp_sudah_dibayar: 100000,
          komite_sudah_dibayar: 50000,
          ekskul_sudah_dibayar: 40000,
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
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'Agustus',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank BNI',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-09-10',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'September',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2024-10-12',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
      bulan: 'Oktober',  
      nominal_pembayaran: 40000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-11-05',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'November',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2024-12-20',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'Desember',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'E-Money Dana',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-01-10',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'Januari',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'E-Money OVO',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-02-05',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
      bulan: 'Februari',  
      nominal_pembayaran: 40000,
      metode_pembayaran: 'E-Money Gopay',
      bukti_bayar: 'test',
      status_pembayaran: 'Ditolak',
    },
    {
      tanggal_pembayaran: '2025-03-12',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Komite',
      bulan: 'Maret',  
      nominal_pembayaran: 50000,
      metode_pembayaran: 'Bank BCA',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-04-15',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran SPP',
      bulan: 'April',  
      nominal_pembayaran: 100000,
      metode_pembayaran: 'Bank Mandiri',
      bukti_bayar: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-05-08',
      nama_siswa: 'John Doe',
      jenis_pembayaran: 'Pembayaran Ekstrakurikuler',
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
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item : any, index : number) => (
            <Table.Tr key={index}>
              <Table.Td>{item.bulan}</Table.Td>
              <Table.Td>{item.tenggat_waktu}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_spp)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_komite)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_ekstra)}</Table.Td>
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
      <Accordion className={styles.accordion} variant='contained' defaultValue={data[0].tahun}>
        {data.map((item : any, index : number) => (
          <Accordion.Item key={index} value={item.tahun}>
            <Accordion.Control><span>Tahun {item.tahun}</span></Accordion.Control>
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
                    <Table.Th>Komite Belum Dibayar</Table.Th>
                    <Table.Th>Ekskul Belum Dibayar</Table.Th>
                    <Table.Th>SPP Sudah Dibayar</Table.Th>
                    <Table.Th>Komite Sudah Dibayar</Table.Th>
                    <Table.Th>Ekskul Sudah Dibayar</Table.Th>
                    <Table.Th>Status Pembayaran</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {item.data.map((val : any, idx : number) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{val.bulan}</Table.Td>
                      <Table.Td>{val.tenggat_waktu}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.spp_belum_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.komite_belum_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.ekskul_belum_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.spp_sudah_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.komite_sudah_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.ekskul_sudah_dibayar)}</Table.Td>
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
            label="Tahun Ajaran"
            placeholder='Tahun Ajaran'
            key={formTagihan.key('tahun_ajaran')}
          />
          <Select
            label="Bulan"
            placeholder="Bulan"
            key={formTagihan.key('tahun_ajaran')}
            data={['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']}
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
            key={formTagihan.key('biaya_ekstra')}
          />
          <TextInput
            label="Biaya Total"
            placeholder='Rp 0'
            key={formTagihan.key('biayaTotal')}
          />
          <DatePickerInput
            label="Tenggat Waktu"
            placeholder="dd/mm/yyy"
            key={formTagihan.key('tenggatWaktu')}
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
            label="Nama Siswa"
            placeholder="Nama Siswa"
            key={formUnggahBuktiPembayaran.key('nama_siswa')}
            data={['Jane Doe', 'John Doe']}
          />
          <p style={{margin: '0', fontWeight: '500'}}>Jenis Pembayaran</p>
          <Checkbox
            label="SPP"
          />
          <Checkbox
            label="Komite"
          />
          <Checkbox
            label="Ekstrakurikuler"
          />
          <Checkbox
            label="SPP, Komite, dan Ekstrakurikuler"
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
                { field: 'NIS', hideable: false},
                { field: 'Jenis Pembayaran',
                  width: 180,
                },
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
                'Jenis Pembayaran': val.jenis_pembayaran,
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
                { field: 'Jenis Pembayaran', width: 150 },
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
                  'Jenis Pembayaran': val.jenis_pembayaran,
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
  