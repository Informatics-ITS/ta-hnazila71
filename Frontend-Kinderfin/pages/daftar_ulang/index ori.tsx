import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './daftar_ulang.module.css';
import Utils from '../../utils';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export default function DaftarUlangView() {
  const [tagihanOpened, { open: openTagihan, close: closeTagihan }] = useDisclosure(false);
  const [unggahBuktiPembayaranOpened, { open: openUnggahBuktiPembayaran, close: closeUnggahBuktiPembayaran }] = useDisclosure(false);
  const [informasiOpened, { open: openInformasi, close: closeInformasi }] = useDisclosure(false);

  const formTagihan = useForm({
    mode: 'uncontrolled',
    initialValues: { semester: '', biayaPerlengkapan: 0, biayaKegiatan: 0, biayaTotal: 0, tenggatWaktu: '' },

    validate: {
      semester: (value: string) => (value.length < 2 ? 'Mohon pilih semester' : null),
      biayaPerlengkapan: (value: number) => (value < 0 ? 'Biaya perlengkapan tidak boleh kurang dari 0' : null),
      biayaKegiatan: (value: number) => (value < 0 ? 'Biaya kegiatan tidak boleh kurang dari 0' : null),
      biayaTotal: (value: number) => (value < 0 ? 'Biaya total tidak boleh kurang dari 0' : null),
      tenggatWaktu: (value: string) => (value.length < 2 ? 'Mohon pilih tenggat waktu' : null),
    },
  });

  const formUnggahBuktiPembayaran = useForm({
    mode: 'uncontrolled',
    initialValues: { nama_siswa: '', nominal_pembayaran: 0, metode_pembayaran: '', jenis_pembayaran: '', bukti_pembayaran: '' },

    validate: {
      nama_siswa: (value: string) => (value.length < 2 ? 'Mohon pilih nama siswa' : null),
      nominal_pembayaran: (value: number) => (value < 0 ? 'Nominal pembayaran tidak boleh kurang dari 0' : null),
      metode_pembayaran: (value: string) => (value.length < 2 ? 'Mohon pilih metode pembayaran' : null),
      jenis_pembayaran: (value: string) => (value.length < 2 ? 'Mohon pilih jenis pembayaran' : null),
      bukti_pembayaran: (value: string) => (value.length < 2 ? 'Mohon unggah bukti pembayaran' : null),
    }
  });

  const user = {
    name: 'John Doe',
    // role: 'Bendahara',
    // role: 'Sekretaris',
    role: 'Orang Tua',
  };

  const daftarUlangData = [
    {
      tahun : '2021/2022',
      data : [
        {
          semester : 'Ganjil',
          tenggat_waktu : '2021-08-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        },
        {
          semester : 'Genap',
          tenggat_waktu : '2022-01-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        }
      ]
    },
    {
      tahun : '2022/2023',
      data : [
        {
          semester : 'Ganjil',
          tenggat_waktu : '2022-08-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        },
        {
          semester : 'Genap',
          tenggat_waktu : '2023-01-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        }
      ]
    },
    {
      tahun : '2023/2024',
      data : [
        {
          semester : 'Ganjil',
          tenggat_waktu : '2023-08-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        },
        {
          semester : 'Genap',
          tenggat_waktu : '2024-01-01',
          biaya_perlengkapan : 500000,
          biaya_kegiatan : 1000000,
        }
      ]
    }
  ]

  const riwayatDaftarUlangData = [
    {
      semester : 'Ganjil',
      tahun : '2021/2022',
      tanggal_pembayaran : '2021-08-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Genap',
      tahun : '2021/2022',
      tanggal_pembayaran : '2022-01-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Ganjil',
      tahun : '2022/2023',
      tanggal_pembayaran : '2022-08-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Genap',
      tahun : '2022/2023',
      tanggal_pembayaran : '2023-01-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Ganjil',
      tahun : '2023/2024',
      tanggal_pembayaran : '2023-08-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Genap',
      tahun : '2023/2024',
      tanggal_pembayaran : '2024-01-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester : 'Ganjil',
      tahun : '2024/2025',
      tanggal_pembayaran : '2024-08-01',
      nis : '1234567890',
      nama_siswa : 'John Doe',
      nominal_dibayar : 1500000,
      nominal_belum_dibayar : 0,
      metode_pembayaran : 'Transfer Bank',
      bukti_bayar : 'test',
      status_pembayaran : 'Lunas',
    },
    {
      semester: 'Genap',
      tahun: '2024/2025',
      tanggal_pembayaran: '2025-01-01',
      nis: '1234567890',
      nama_siswa: 'John Doe',
      nominal_dibayar: 1500000,
      nominal_belum_dibayar: 0,
      metode_pembayaran: 'Transfer Bank',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      semester: 'Ganjil',
      tahun: '2025/2026',
      tanggal_pembayaran: '2025-08-01',
      nis: '1234567890',
      nama_siswa: 'John Doe',
      nominal_dibayar: 1500000,
      nominal_belum_dibayar: 0,
      metode_pembayaran: 'Transfer Bank',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    },
    {
      semester: 'Genap',
      tahun: '2025/2026',
      tanggal_pembayaran: '2026-01-01',
      nis: '1234567890',
      nama_siswa: 'John Doe',
      nominal_dibayar: 1500000,
      nominal_belum_dibayar: 0,
      metode_pembayaran: 'Transfer Bank',
      bukti_bayar: 'test',
      status_pembayaran: 'Lunas',
    }
  ]

  const catatanDaftarUlang = [
    {
      nama_siswa: 'John Doe',
      nis: '1234567890',
      data: [
        {
          semester: 'Ganjil',
          tahun: '2021/2022',
          tanggal_pembayaran: '2021-08-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        },
        {
          semester: 'Genap',
          tahun: '2021/2022',
          tanggal_pembayaran: '2022-01-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Belum Lunas',
        },
        {
          semester: 'Ganjil',
          tahun: '2021/2022',
          tanggal_pembayaran: '2021-08-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        },
        {
          semester: 'Genap',
          tahun: '2021/2022',
          tanggal_pembayaran: '2022-01-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        }
      ]
    },
    {
      nama_siswa: 'Jane Doe',
      nis: '1234567890',
      data: [
        {
          semester: 'Ganjil',
          tahun: '2021/2022',
          tanggal_pembayaran: '2021-08-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        },
        {
          semester: 'Genap',
          tahun: '2021/2022',
          tanggal_pembayaran: '2022-01-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        },
        {
          semester: 'Ganjil',
          tahun: '2021/2022',
          tanggal_pembayaran: '2021-08-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        },
        {
          semester: 'Genap',
          tahun: '2021/2022',
          tanggal_pembayaran: '2022-01-01',
          biaya_kegiatan_belum_dibayar: 0,
          biaya_kegiatan_dibayar: 1000000,
          biaya_perlengkapan_belum_dibayar: 0,
          biaya_perlengkapan_dibayar: 500000,
          status_pembayaran: 'Lunas',
        }
      ]
    }
  ]

  const riwayatDaftarUlangSiswa = [
    {
      tanggal_pembayaran: '2021-08-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2022-01-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2022-08-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2023-01-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2023-08-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-01-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2024-08-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-01-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
    {
      tanggal_pembayaran: '2025-08-01',
      nama_siswa: 'John Doe',
      nominal_pembayaran: 1500000,
      metode_pembayaran: 'Transfer Bank',
      bukti_pembayaran: 'test',
      status_pembayaran: 'Disetujui',
    },
  ]

  const getPengaturanDaftarUlangTable = (data : any) => {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Semester</Table.Th>
            <Table.Th>Tenggat Waktu</Table.Th>
            <Table.Th>Biaya Perlengkapan</Table.Th>
            <Table.Th>Biaya Kegiatan</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item : any, index : number) => (
            <Table.Tr key={index}>
              <Table.Td>{item.semester}</Table.Td>
              <Table.Td>{item.tenggat_waktu}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_perlengkapan)}</Table.Td>
              <Table.Td>{Utils.formatCurrency(item.biaya_kegiatan)}</Table.Td>
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

  const getPengaturanDaftarUlangAccordion = (data : any) => {
    if (data.length === 0 || data === null) {
      return null;
    }

    return (
      <Accordion className={styles.accordion} variant='contained' defaultValue={data[0].tahun}>
        {data.map((item : any, index : number) => (
          <Accordion.Item key={index} value={item.tahun}>
            <Accordion.Control><span>Tahun {item.tahun}</span></Accordion.Control>
            <Accordion.Panel>
              {getPengaturanDaftarUlangTable(item.data)}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    )
  }

  const getCatatanDaftarUlangAccordion = (data : any) => {
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
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Tahun</Table.Th>
                    <Table.Th>Tanggal Pembayaran</Table.Th>
                    <Table.Th>Biaya Perlengkapan</Table.Th>
                    <Table.Th>Biaya Kegiatan</Table.Th>
                    <Table.Th>Status Pembayaran</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {item.data.map((val : any, idx : number) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{val.semester}</Table.Td>
                      <Table.Td>{val.tahun}</Table.Td>
                      <Table.Td>{val.tanggal_pembayaran}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.biaya_perlengkapan_dibayar)}</Table.Td>
                      <Table.Td>{Utils.formatCurrency(val.biaya_kegiatan_dibayar)}</Table.Td>
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
      <Modal centered opened={tagihanOpened} onClose={closeTagihan} title="Buat Tagihan Baru">
        <form onSubmit={() => {formTagihan.onSubmit(console.log)}}>
          <Select
            label="Semester"
            placeholder="Ganjil / Genap"
            key={formTagihan.key('semester')}
            data={['Genap', 'Ganjil']}
          />
          <TextInput
            label="Biaya Perlengkapan"
            placeholder='Rp 0'
            key={formTagihan.key('biayaPerlengkapan')}
          />
          <TextInput
            label="Biaya Kegiatan"
            placeholder='Rp 0'
            key={formTagihan.key('biayaKegiatan')}
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
      <Modal centered opened={unggahBuktiPembayaranOpened} onClose={closeUnggahBuktiPembayaran} title="Unggah Bukti Pembyaran">
        <form onSubmit={() => {formUnggahBuktiPembayaran.onSubmit(console.log)}}>
          <Select
            label="Nama Siswa"
            placeholder="Nama Siswa"
            key={formUnggahBuktiPembayaran.key('nama_siswa')}
            data={['Jane Doe', 'John Doe']}
          />
          <TextInput
            label="Nominal Pembayaran"
            placeholder='Rp 0'
            key={formUnggahBuktiPembayaran.key('nominal_pembayaran')}
          />
          <Select
            label="Metode Pembayaran"
            placeholder="Metode Pembayaran"
            key={formUnggahBuktiPembayaran.key('metode_pembayaran')}
            data={['Transfer Bank', 'Tunai']}
          />
          <p style={{margin: '0', fontWeight: '500'}}>Jenis Pembayaran</p>
          <Checkbox
            label="Biaya Kegiatan"
          />
          <Checkbox
            label="Biaya Perlengkapan"
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
        centered
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
              1. Pembayaran daftar ulang dapat dilihat dengan menekan tombol “Unggah Bukti Pembayaran”<br/>
              2. Akan muncul tampilan form untuk mengunggah bukti pembayaran.<br/>
              3. Silakan pilih siswa yang akan dibayarkan daftar ulangnya, kemudian masukkan nominal pembayaran dan pilih metode pembayaran.<br/>
              4. Kemudian unggah bukti bayar melalui kolom bukti pembayaran. <br/>
              5. Setelah memasukkan semua informasi pembayaran, klik “Kirim”. <br/>
              6. Mohon tunggu 1x24 jam untuk proses verifikasi dan update “Status” catatan pembayaran SPP siswa.
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

  const getComponentDaftarUlang = (role : string) => {
    switch (role) {
      case 'Bendahara':
      case 'Sekretaris':
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
              {getPengaturanDaftarUlangAccordion(daftarUlangData)}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value='Riwayat Pembayaran'>
            <DataGrid
              className={styles.riwayat__pembayaran}
              columns={[
                { field: 'Semester'},
                { field: 'Tahun'},
                { field: 'Tanggal'},
                { field: 'NIS', hideable: false},
                {
                  field: 'Nama Siswa',
                  width: 150,
                },
                {
                  field: 'Dibayar',
                  width: 130,
                },
                {
                  field: 'Belum Dibayar',
                  width: 130,
                },
                { field: 'Metode Pembayaran'},
                {
                  field: 'Bukti Bayar',
                  renderCell: (params) => (
                    <Button variant='transparent'><IconDownload color='green' size={14} /></Button>
                  ),
                },
                {
                  field: 'Status',
                  width: 70,
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
                riwayatDaftarUlangData.map((val, index) => ({
                  id: index,
                  Semester: val.semester,
                  Tahun: val.tahun,
                  Tanggal: val.tanggal_pembayaran,
                  NIS: val.nis,
                  'Nama Siswa': val.nama_siswa,
                  Dibayar: Utils.formatCurrency(val.nominal_dibayar),
                  'Belum Dibayar': Utils.formatCurrency(val.nominal_belum_dibayar),
                  'Metode Pembayaran': val.metode_pembayaran,
                  'Bukti Bayar': 'Bukti Bayar',
                  'Status': val.status_pembayaran,
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
          {getCatatanDaftarUlangAccordion(catatanDaftarUlang)}
          <h2 style={{margin: '2rem'}}>Riwayat Pembayaran Daftar Ulang</h2>
          <DataGrid
              className={styles.riwayat__daftar__ulang__orang__tua}
              columns={[
                { field: 'Tanggal Pembayaran', width: 150},
                { field: 'Nama Siswa', hideable: false, width: 200},
                { field: 'Nominal Pembayaran', width: 150},
                { field: 'Metode Pembayaran', width: 150},
                { field: 'Bukti Pembayaran', width: 150, renderCell: (params) => (
                  <Button variant='transparent'><IconDownload color='green' size={14} /></Button>
                )},
                { field: 'Status', width: 150, renderCell: (params) => (
                  <Chip label={params.value} color={params.value === 'Disetujui' ? 'success' : 'error'} />
                )
                },
              ]}
              rows={
                riwayatDaftarUlangSiswa.map((val, index) => ({
                  id: index,
                  'Tanggal Pembayaran': val.tanggal_pembayaran,
                  'Nama Siswa': val.nama_siswa,
                  'Nominal Pembayaran': Utils.formatCurrency(val.nominal_pembayaran),
                  'Metode Pembayaran': val.metode_pembayaran,
                  'Bukti Pembayaran': 'Bukti Pembayaran',
                  'Status': val.status_pembayaran,
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
    <div className={styles.daftar__ulang}>
      <Header />
      {getInformasiModal()}
      {getTagihanBaruModal()}
      {getUnggahBuktiPembayaran()}
      <h1 className={styles.title}>Daftar Ulang</h1>

      {user === null ? <></> : getComponentDaftarUlang(user.role)}

      <Footer />
    </div>
  );
}
