import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './ppdb.module.css';
import Utils from '../../utils';
import Cookies from 'js-cookie';
import '@mantine/dates/styles.css'
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { Stepper, Image, Group, Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem, Divider, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail, IconUser, IconUpload, IconStatusChange, IconCheck, IconEdit, IconPhoto, IconPhotoEdit, IconLibraryPhoto, IconPaperclip, IconZoomIn } from '@tabler/icons-react';
import { DataGrid, gridColumnVisibilityModelSelector, GridToolbar } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

export default function PpdbView() {
  const router = useRouter();
  const [isSending, setSending] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [user, setUser] = useState<{ username: string; role: string; access_token: string } | null>(null);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [applicantList, setApplicantList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailBerkasOpened, { open: openDetailBerkas, close: closeDetailBerkas }] = useDisclosure(false);
  const [editPendaftar, { open: openPendaftar, close: closePendaftar }] = useDisclosure(false);
  const [editPendaftarData, setEditPendaftarData] = useState<{
    nama_lengkap: string;
    status: string;
    tanggal_lahir: Date | null;
    jenis_kelamin: string;
    alamat: string;
    kelas: string;
    tahun_ajaran: string;
    is_verified: string;
    catatan: string;
    akta_kelahiran: string;
    kartu_keluarga: string;
    }>({
      nama_lengkap: '',
      status: '',
      tanggal_lahir: null,
      jenis_kelamin: '',
      alamat: '',
      kelas: '',
      tahun_ajaran: '',
      is_verified: '',
      catatan: '',
      akta_kelahiran : '',
      kartu_keluarga: '' }
    );
  const [selectedBerkas, setSelectedBerkas] = useState<{
    id: string;
    akta_kelahiran: string;
    kartu_keluarga: string;
    url_file_akta: string;
    url_file_kk: string;
  } | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActive((current) => {
      if (current <= 0) {
        setIsRegistering(false);
        setKk(null);
        setAkta(null);
        setPendaftaranBaru({
          nama_lengkap: '',
          status: '',
          tanggal_lahir: null,
          jenis_kelamin: '',
          alamat: '',
          kelas: '',
          tahun_ajaran: '',
          is_verified: '',
          catatan: '',
          akta_kelahiran: '',
          kartu_keluarga: ''
        });
        return current;
      } else {
        return current > 0 ? current - 1 : current;
      }
    });
  const [pendaftaranBaru, setPendaftaranBaru] = useState<{
    nama_lengkap: string;
    status: string;
    tanggal_lahir: Date | null;
    jenis_kelamin: string;
    alamat: string;
    kelas: string;
    tahun_ajaran: string;
    is_verified: string,
    catatan: string,
    akta_kelahiran: string;
    kartu_keluarga: string;
    }>({
      nama_lengkap: '',
      status: '',
      tanggal_lahir: null,
      jenis_kelamin: '',
      alamat: '',
      tahun_ajaran: '',
      kelas: '',
      is_verified: '',
      catatan: '',
      akta_kelahiran : '',
      kartu_keluarga: '' }
    );
  const [kartu_keluarga, setKk] = useState<File | null>(null);
  const [akta_kelahiran, setAkta] = useState<File | null>(null);
  const [allDiscounts, setAllDiscounts] = useState<any[]>([]);

  const verifyPPDB = async (id : string) => {
    setSending(true);
    try {
      const response = await fetch(Utils.verify_ppdb_url + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setSending(false);
        window.location.reload();
      } else {
        console.error('Error verifying applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error verifying applicant:', error);
    }
    setSending(false);
  }

  const fetchAllDiscounts = async () => {
    try {
      const response = await fetch(Utils.get_all_discount_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        let discounts = [];
        for (const i in data.data) {
          console.log(data.data[i]['nama']);
          discounts.push(data.data[i]['nama']);
        }
        setAllDiscounts(discounts);
      }
    } catch (error) {
      console.error('Error fetching all discounts:', error);
    }
  }

  const fetchChildrenList = async () => {
    try {
      const response = await fetch(Utils.get_children_ppdb_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChildrenList(data.data);
      } else if (response.status === 401) {
        Cookies.remove('user');
        window.location.href = '/auth/login';
      } else {
        console.error('Error fetching children list:', data.message);
      }
    } catch (error) {
      console.error('Error fetching children list:', error);
    }
  }

  const fetchApplicantList = async () => {
    try {
      const response = await fetch(Utils.ppdb, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApplicantList(data.data);
      } else if (response.status === 401) {
        Cookies.remove('user');
        window.location.href = '/auth/login';
      } else {
        console.error('Error fetching children list:', data.message);
      }
    } catch (error) {
      console.error('Error fetching children list:', error);
    }
  }

  const registerNewApplicant = async () => {
    setSending(true);
    const formDataRegisterPPDB = new FormData();
    formDataRegisterPPDB.append('nama_lengkap', pendaftaranBaru.nama_lengkap);
    formDataRegisterPPDB.append('tanggal_lahir', Utils.formatDateWithDash(pendaftaranBaru.tanggal_lahir as Date));
    formDataRegisterPPDB.append('alamat', pendaftaranBaru.alamat);
    formDataRegisterPPDB.append('jenis_kelamin', pendaftaranBaru.jenis_kelamin);
    formDataRegisterPPDB.append('kelas', pendaftaranBaru.kelas);
    formDataRegisterPPDB.append('tahun_ajaran', Utils.getCurrentYear().toString());
    formDataRegisterPPDB.append('status', pendaftaranBaru.status);
    if (akta_kelahiran) {
      formDataRegisterPPDB.append('akta_kelahiran', akta_kelahiran);
    }
    if (kartu_keluarga) {
      formDataRegisterPPDB.append('kartu_keluarga', kartu_keluarga);
    }

    try {
      const response = await fetch(Utils.register_ppdb_url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: formDataRegisterPPDB,
      });
      
      if (response.ok) {
        setSending(false);
        setPendaftaranBaru({
          nama_lengkap: '',
          status: '',
          tanggal_lahir: null,
          jenis_kelamin: '',
          alamat: '',
          kelas: '',
          tahun_ajaran: '',
          catatan: '',
          is_verified: '',
          akta_kelahiran: '',
          kartu_keluarga: ''
        });
        setAkta(null);
        setKk(null);
        window.location.reload();
      } else {
        const data = await response.json();
        console.error('Error registering new applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error registering new applicant:', error);
    }

    setPendaftaranBaru({
      nama_lengkap: '',
      status: '',
      tanggal_lahir: null,
      jenis_kelamin: '',
      alamat: '',
      kelas: '',
      tahun_ajaran: '',
      is_verified: '',
      catatan: '',
      akta_kelahiran: '',
      kartu_keluarga: ''
    });
    setAkta(null);
    setKk(null);
  }

  const handleEditCalonSiswa = async () => {
    setSending(true);
    
    const formDataEditPPDB = new FormData();
    for (const key in pendaftaranBaru) {
      const typedKey = key as keyof typeof pendaftaranBaru;
      if (pendaftaranBaru[typedKey] !== '' && pendaftaranBaru[typedKey] !== null) {
        formDataEditPPDB.append(typedKey, pendaftaranBaru[typedKey] as string);
      }
    }

    if (akta_kelahiran) {
      formDataEditPPDB.append('akta_kelahiran', akta_kelahiran);
    }

    if (kartu_keluarga) {
      formDataEditPPDB.append('kartu_keluarga', kartu_keluarga);
    }

    try {
      const response = await fetch(Utils.ppdb + isEditingId, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: formDataEditPPDB,
      });

      const data = await response.json();
      setSending(false);
      
      if (response.ok) {
        setPendaftaranBaru({
          nama_lengkap: '',
          status: '',
          tanggal_lahir: null,
          jenis_kelamin: '',
          alamat: '',
          kelas: '',
          tahun_ajaran: '',
          is_verified: '',
          catatan: '',
          akta_kelahiran: '',
          kartu_keluarga: ''
        });
        setIsEditingId(null);
        setAkta(null);
        setKk(null);
        window.location.reload();
      } else {
        console.error('Error registering new applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error registering new applicant:', error);
    }

    setIsEditingId(null);
  }

  const handleDeleteCalonSiswa = async (id : string) => {
    try {
      const response = await fetch(Utils.ppdb + id, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Error deleting applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting applicant:', error);
    }
  }

  const openBerkasDetail = (data : any) => {
    setSelectedBerkas(data);
    setIsEditingId(data.id);
    openDetailBerkas(); 
  };

  const openEditPendaftar = (data : any) => {
    setEditPendaftarData(data);
    console.log(data);
    setIsEditingId(data.id);
    openPendaftar();
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

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role == 'Orang Tua') {
        await fetchChildrenList();
        await fetchAllDiscounts();
      } else if (user?.role == 'Sekretaris' || user?.role == 'Admin') {
        await fetchApplicantList();
        await fetchAllDiscounts();
      }
    };
    fetchData();
  }, [user]);

  const getEditModal = () => {
    return (
      <Modal
        centered
        opened={editPendaftar}
        onClose={() => {
          closePendaftar();
          setSending(false);
          setPendaftaranBaru({
            nama_lengkap: '',
            status: '',
            tanggal_lahir: null,
            jenis_kelamin: '',
            alamat: '',
            kelas: '',
            tahun_ajaran: Utils.getCurrentYear().toString(),
            is_verified: '',
            catatan: '',
            akta_kelahiran: '',
            kartu_keluarga: ''
          });
        }}
        title="Edit Pendaftar"
        size="50%"
      >
        <div className={styles.edit_pendaftar}>
          {editPendaftarData ? (
            <>
              <TextInput
                label="Nama"
                placeholder="Nama"
                defaultValue={editPendaftarData.nama_lengkap}
                onChange={(e) => setPendaftaranBaru({ ...pendaftaranBaru, nama_lengkap: e.target.value })}
              />
              <Select
                label="Kebutuhan Khusus"
                placeholder='Kebutuhan Khusus (Dhuafa, Yatim, Piatu, dkk)'
                data={allDiscounts.length > 0 ? allDiscounts : ['Dhuafa', 'Yatim', 'Piatu']}
                defaultValue={editPendaftarData.status}
                allowDeselect={false}
                onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, status: value ?? '' })}
              />
              <DatePickerInput
                label="Tanggal Lahir"
                dropdownType="modal"
                placeholder={editPendaftarData.tanggal_lahir ? 
                    (typeof editPendaftarData.tanggal_lahir === 'string' ? editPendaftarData.tanggal_lahir : editPendaftarData.tanggal_lahir.toLocaleDateString('id-ID')) 
                    : 'dd/mm/yyyy'}
                onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, tanggal_lahir: value })}
              />
              <Select
                label="Jenis Kelamin"
                placeholder="Laki-laki / Perempuan"
                data={['Laki-laki', 'Perempuan']}
                defaultValue={editPendaftarData.jenis_kelamin}
                allowDeselect={false}
                onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, jenis_kelamin: value ?? '' })}
              />
              <TextInput
                label="Alamat"
                placeholder="Alamat"
                defaultValue={editPendaftarData.alamat}
                onChange={(e) => setPendaftaranBaru({ ...pendaftaranBaru, alamat: e.target.value })}
              />
              <Select
                label="Kelas"
                placeholder="TK A / TK  B"
                data={['TK A', 'TK B']}
                defaultValue={editPendaftarData.kelas}
                allowDeselect={false}
                onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, kelas: value ?? '' })}
              />
              <TextInput
                label="Tahun Ajaran"
                placeholder="Tahun Ajaran"
                value={editPendaftarData.tahun_ajaran}
                disabled
              />
              <Textarea
                label="Catatan Untuk Orang Tua"
                placeholder="Catatan jika ada dokumen atau informasi yang kurang lengkap"
                defaultValue={editPendaftarData.catatan}
                disabled={user?.role == 'Orang Tua'}
                onChange={(e) => setPendaftaranBaru({ ...pendaftaranBaru, catatan: e.target.value })}
              />
              <Button disabled={isSending} onClick={handleEditCalonSiswa} fullWidth color='#F37F37' type="submit" mt="sm">
                Edit Data
              </Button>
            </>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </Modal>
    );
  }

  const getBerkasDetailModal = () => {
    return (
      <Modal
        centered
        opened={detailBerkasOpened}
        onClose={closeDetailBerkas}
        title="Detail Berkas"
        size="70%"
      >
        <div className={styles.detail_berkas}>
          {selectedBerkas ? (
            <div>
              {user?.role === 'Orang Tua' ? (
                <>
                  <FileInput
                    label="Akta Kelahiran"
                    placeholder="Image (*jpg, *jpeg, *png)"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(file) => setAkta(file)}
                  />
                  <FileInput
                    label="Kartu Keluarga"
                    placeholder="Image (*jpg, *jpeg, *png)"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(file) =>setKk(file)}
                  />
                  <p style={{textDecoration: 'underline', fontSize: '0.8rem', color: 'red'}}>Harap lengkapi akta kelahiran dan kartu keluarga</p>
                  <div style={{margin: '1rem'}}></div>
                  <Button
                    color='#F37F37'
                    fullWidth
                    disabled={kartu_keluarga === null || akta_kelahiran === null || isSending}
                    onClick={() => handleEditCalonSiswa()}
                    leftSection={<IconEdit size={14} />}
                  >
                    Edit Data
                  </Button>
                </>
              ) : (
                <>
                  <h3>Akta Kelahiran</h3>
                  <Chip
                    icon={<IconZoomIn size={14} />}
                    label="Buka Akta Kelahiran"
                    onClick={() => window.open(
                      selectedBerkas.akta_kelahiran == null ||
                      selectedBerkas.akta_kelahiran == undefined ||
                      selectedBerkas.akta_kelahiran == '' ?
                      selectedBerkas.url_file_akta :
                    selectedBerkas.akta_kelahiran)}
                  />
                  <Image
                    radius="md"
                    h={300}
                    style={{marginBottom: '1rem', marginTop: '1rem'}}
                    src={selectedBerkas.akta_kelahiran == null ||
                      selectedBerkas.akta_kelahiran == undefined ||
                      selectedBerkas.akta_kelahiran == '' ?
                      selectedBerkas.url_file_akta :
                    selectedBerkas.akta_kelahiran}
                  />
                  <h3>Kartu Keluarga</h3>
                  <Chip
                    icon={<IconZoomIn size={14} />}
                    label="Buka Kartu Keluarga"
                    onClick={() => window.open(
                      selectedBerkas.kartu_keluarga == null ||
                      selectedBerkas.kartu_keluarga == undefined ||
                      selectedBerkas.kartu_keluarga == '' ?
                      selectedBerkas.url_file_kk :
                    selectedBerkas.kartu_keluarga)}
                  />
                  <Image
                    radius="md"
                    h={300}
                    style={{marginBottom: '1rem', marginTop: '1rem'}}
                    src={selectedBerkas.kartu_keluarga == null ||
                      selectedBerkas.kartu_keluarga == undefined ||
                      selectedBerkas.kartu_keluarga == '' ?
                      selectedBerkas.url_file_kk :
                    selectedBerkas.kartu_keluarga}
                  />
                </>
              )}
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </Modal>
    );
  };

  const getVerificationChip = (status : string) => {
    switch (status) {
      case 'Belum Terverifikasi':
        return <Chip color="error" label="Belum Terverifikasi" />;
      case 'Sedang Diverifikasi':
        return <Chip color="info" label="Sedang Diverifikasi" />;
      case 'Terverifikasi':
        return <Chip color="success" label="Terverifikasi" />;
      default:
        return <Chip color="error" label="Belum Terverifikasi" />;
    }
  }

  const getComponentPPDB = (role : string) => {
    switch (role) {
      case 'Orang Tua':
        return (
          <>
            {!isRegistering ? (
              <>
                <Accordion className={styles.accordion} variant='contained' defaultValue={childrenList?.[0]?.nama_lengkap || ''}>
                  {childrenList?.map((item, index) => (
                    <Accordion.Item key={index} value={item.nama_lengkap}>
                      <Accordion.Control><h2>{item.nama_lengkap}</h2></Accordion.Control>
                      <Accordion.Panel>
                        <Divider my="md" label="Informasi Calon Siswa" variant='dashed' labelPosition="center" />
                        <Table className={styles.table}>
                          <Table.Tbody className={styles.table_body}>
                            <Table.Tr>
                              <Table.Td>Nama</Table.Td>
                              <Table.Td>: {item.nama_lengkap}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Tanggal Lahir</Table.Td>
                              <Table.Td>: {Utils.formatDate(item.tanggal_lahir)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Jenis Kelamin</Table.Td>
                              <Table.Td>: {item.jenis_kelamin}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Kelas</Table.Td>
                              <Table.Td>: {item.kelas}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Tahun Ajaran</Table.Td>
                              <Table.Td>: {item.tahun_ajaran}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Alamat</Table.Td>
                              <Table.Td>: {item.alamat}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Catatan</Table.Td>
                              <Table.Td>
                                <Textarea
                                  value={item.catatan == '' ? '-' : item.catatan}
                                  autosize={true}
                                />
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Status Verifikasi</Table.Td>
                              <Table.Td>: {getVerificationChip(item.is_verified)}</Table.Td>
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                        <Button
                          color='#F37F37'
                          fullWidth
                          onClick={() => openEditPendaftar(item)}
                          leftSection={<IconEdit size={14} />}
                        >
                          Edit Data
                        </Button>
                        <Divider my="md" label="Berkas Pendukung" labelPosition="center" />
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '1rem'}}>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            <h2>Akta Kelahiran</h2>
                            <Image
                              radius="md"
                              w={250}
                              fit="cover"
                              style={{marginBottom: '1rem', marginTop: '1rem'}}
                              src={item.url_file_akta}
                            />
                            <Chip
                              icon={<IconZoomIn size={14} />}
                              label="Buka Akta Kelahiran"
                              onClick={() => window.open(item.url_file_akta)}
                            />
                          </div>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            <h2>Kartu Keluarga</h2>
                            <Image
                              radius="md"
                              w={250}
                              fit="cover"
                              style={{marginBottom: '1rem', marginTop: '1rem'}}
                              src={item.url_file_kk}
                            />
                            <Chip
                              icon={<IconZoomIn size={14} />}
                              label="Buka Kartu Keluarga"
                              onClick={() => window.open(item.url_file_kk)}
                            />
                          </div>
                        </div>
                        <Button
                            color='blue'
                            fullWidth
                            onClick={() => openBerkasDetail(item)}
                            leftSection={<IconPaperclip size={14} />}
                          >
                            Edit Berkas
                          </Button>
                        <Divider my="lg" variant="dashed" />
                        <Button
                          color="red"
                          fullWidth
                          disabled={item.is_verified == 'Terverifikasi'}
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus data calon siswa ini?')) {
                              handleDeleteCalonSiswa(item.id);
                            }
                          }}
                          leftSection={<IconTrash size={14} />}
                        >
                          Hapus Calon Siswa
                        </Button>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
                <Button
                  color='#F37F37'
                  style={{marginBottom: '1.5rem'}}
                  onClick={() => setIsRegistering(true)}
                  leftSection={<IconPlus size={14} />}
                >
                  Buat Pendaftaran Baru
                </Button>
              </>
            )
            : (
              <>
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  color='#F37F37'
                >
                  <Stepper.Step
                    icon={<IconUser style={{ width: rem(18), height: rem(18), color: '#F37F37' }} />}
                    label="Step 1"
                    description="Formulir Pendaftaran"
                  >
                    <TextInput
                      label="Nama"
                      placeholder="Nama"
                      onChange={(e) => setPendaftaranBaru({ ...pendaftaranBaru, nama_lengkap: e.target.value })}
                    />
                    <Select
                      label="Kebutuhan Khusus"
                      placeholder='Kebutuhan Khusus (Dhuafa, Yatim, Piatu, dkk)'
                      data={allDiscounts.length > 0 ? allDiscounts : ['Dhuafa', 'Yatim', 'Piatu']}
                      allowDeselect={false}
                      onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, status: value ?? '' })}
                    />
                    <DatePickerInput
                      label="Tanggal Lahir"
                      dropdownType="modal"
                      placeholder="dd/mm/yyyy"
                      onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, tanggal_lahir: value })}
                    />
                    <Select
                      label="Jenis Kelamin"
                      placeholder="Laki-laki / Perempuan"
                      onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, jenis_kelamin: value ?? '' })}
                      data={['Laki-laki', 'Perempuan']}
                      allowDeselect={false}
                    />
                    <TextInput
                      label="Alamat"
                      placeholder="Alamat"
                      onChange={(e) => setPendaftaranBaru({ ...pendaftaranBaru, alamat: e.target.value })}
                    />
                    <Select
                      label="Kelas"
                      placeholder="TK A / TK  B"
                      onChange={(value) => setPendaftaranBaru({ ...pendaftaranBaru, kelas: value ?? '' })}
                      data={['TK A', 'TK B']}
                      allowDeselect={false}
                    />
                    <TextInput
                      label="Tahun Ajaran"
                      placeholder="Tahun Ajaran"
                      value={Utils.getCurrentYear().toString()}
                      disabled
                    />
                  </Stepper.Step>
                  <Stepper.Step
                    icon={<IconUpload style={{ width: rem(18), height: rem(18), color: '#F37F37' }} />}
                    label="Step 2"
                    description="Upload Berkas"
                  >
                    <FileInput
                      label="Akta Kelahiran"
                      placeholder="Image (*jpg, *jpeg, *png)"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(file) => setKk(file)}
                    />
                    <FileInput
                      label="Kartu Keluarga"
                      placeholder="Image (*jpg, *jpeg, *png)"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(file) => setAkta(file)}
                    />
                  </Stepper.Step>
                  <Stepper.Step
                    icon={<IconCheck style={{ width: rem(18), height: rem(18), color: '#F37F37' }} />}
                    label="Step 3"
                    description="Cek Ulang Data"
                  >
                    <Table className={styles.table}>
                      <Table.Tbody>
                        <Table.Tr>
                          <Table.Td>Nama</Table.Td>
                          <Table.Td>: {pendaftaranBaru.nama_lengkap}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Kebutuhan Khusus</Table.Td>
                          <Table.Td>: {pendaftaranBaru.status}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Tanggal Lahir</Table.Td>
                          <Table.Td>: {pendaftaranBaru.tanggal_lahir ? pendaftaranBaru.tanggal_lahir.toLocaleDateString('id-ID') : ''}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Alamat</Table.Td>
                          <Table.Td>: {pendaftaranBaru.alamat}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Jenis Kelamin</Table.Td>
                          <Table.Td>: {pendaftaranBaru.jenis_kelamin}</Table.Td>
                        </Table.Tr>
                      </Table.Tbody>
                    </Table>
                    <Button disabled={isSending} onClick={registerNewApplicant} fullWidth color='#F37F37'>Kirim Pendaftaran</Button>
                  </Stepper.Step>
                </Stepper>

                <Group justify="center" mt="xl">
                  <Button variant="default" onClick={prevStep}>Kembali</Button>
                  <Button onClick={nextStep} color='#F37F37'>Selanjutnya</Button>
                </Group>
              </>
            )}
          </>
        );
      case 'Bendahara':
      case 'Admin':
      case 'Sekretaris':
        return (
          <>
            <DataGrid
              className={styles.riwayat__pembayaran}
              columns={[
                { field: 'nama_lengkap', headerName: 'Nama Lengkap', hideable: false, width: 150 },
                { field: 'tanggal_lahir', headerName: 'Tanggal Lahir', width: 120 },
                { field: 'jenis_kelamin', headerName: 'Jenis Kelamin', width: 120 },
                { field: 'kelas', headerName: 'Kelas' },
                { field: 'tahun_ajaran', headerName: 'Tahun' },
                { field: 'status_verifikasi', headerName: 'Status Verifikasi',
                  renderCell: (params) => (
                    getVerificationChip(params.row.status_verifikasi)
                  ),
                },
                { field: 'alamat', headerName: 'Alamat' },
                { field: 'berkas', headerName: 'Berkas',
                  renderCell: (params) => (
                    <Button
                      onClick={() => openBerkasDetail(params.row)}
                      variant='transparent'
                    >
                      <IconLibraryPhoto color='blue' size={14} />
                      <h5 style={{color: 'black', fontWeight: 'lighter', textDecoration: 'underline'}}>Lihat</h5>
                    </Button>
                  ),
                 },
                { field: 'status', headerName: 'Kebutuhan' },
                { field: 'catatan' },
                {
                  field: 'Action',
                  width: 150,
                  headerName: 'Action',
                  renderCell: (params) => (
                    <div>
                      <Button 
                        onClick={() =>
                          confirm('Apakah Anda yakin ingin menghapus data calon siswa ini?') &&
                          handleDeleteCalonSiswa(params.row.id)
                        }
                        style={{margin: 0}}
                        variant='transparent'>
                        <IconTrash color='red' size={14} />
                      </Button>
                      <Button 
                        style={{margin: 0}}
                        onClick={() => openEditPendaftar(params.row)}
                        variant='transparent'>
                        <IconPencil color='green' size={14} />
                      </Button>
                      <Button
                        style={{margin: 0}}
                        onClick={() => 
                          confirm('Apakah Anda yakin ingin memverifikasi calon siswa ini? Tindakan ini tidak akan bisa dibatalkan') &&
                          verifyPPDB(params.row.id)
                        }
                        variant='transparent'
                      >
                        <IconCheck color='blue' size={14} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={
                applicantList.map((val, index) => ({
                  id: val.id,
                  nama_lengkap: val.nama_lengkap,
                  tanggal_lahir: Utils.formatDate(val.tanggal_lahir),
                  jenis_kelamin: val.jenis_kelamin,
                  kelas: val.kelas,
                  tahun_ajaran: val.tahun_ajaran,
                  status_verifikasi: val.is_verified,
                  alamat: val.alamat,
                  berkas: 'Berkas',
                  status: val.status,
                  akta_kelahiran: val.url_file_akta,
                  kartu_keluarga: val.url_file_kk,
                  catatan: val.catatan,
                  action: 'Action',
                }))
              }
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
                columns: {
                  columnVisibilityModel: {
                    catatan: false
                  }
                }
              }}
              slots={{ toolbar: GridToolbar }}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.75rem',
                },
                '& .MuiDataGrid-columnHeader': {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  height: 'auto',
                },
              }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return(
    <div className={styles.ppdb}>
      <Header/>
      {getEditModal()}
      {getBerkasDetailModal()}
      <h1 className={styles.title}>Penerimaan Peserta Didik Baru</h1>
      {user === null ? <></> : getComponentPPDB(user.role)}
      <Footer/>
    </div>
  )
}
