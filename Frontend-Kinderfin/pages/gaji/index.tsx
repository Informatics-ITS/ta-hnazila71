import styles from './gaji.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Utils from '../../utils';
import { User, CatatanGaji, Teacher, PembayaranGajiInput, SelectedForEditing } from '../../src/interfaces/interface';
import Chip from '@mui/material/Chip';
import Cookies from 'js-cookie';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Tabs, Paper, Text, FileInput, Checkbox, Table, Select, Accordion, TextInput, Modal, Button, rem } from '@mantine/core';
import { IconSettings, IconHistory, IconPlus, IconTrash, IconPencil, IconDownload, IconInfoCircle, IconBrandWhatsapp, IconMail } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { timeStamp } from 'console';

export default function GajiView() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [catatanGajiGuru, setCatatanGajiGuru] = useState<Teacher[]>([]);
    const [pembayaranGajiOpened, { open: openPembayaranGaji, close: closePembayaranGaji }] = useDisclosure(false);
    const [pembayaranGajiInput, setPembayaranGajiInput] = useState<PembayaranGajiInput | null>(null);
    const [riwayatPembayaranGajiGuru, setRiwayatPembayaranGajiGuru] = useState<CatatanGaji[]>([]);
    const [selectedForEditing, setSelectedForEditing] = useState<SelectedForEditing | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [thisMonthPayroll, setThisMonthPayroll] = useState<CatatanGaji[]>([]);
    const [editingNominal, setEditingNominal] = useState<number | null>(null);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    setUser(userCookie ? JSON.parse(userCookie) : null);
  }, []);

  useEffect(() => {
    if (user?.role === 'Bendahara' || user?.role === 'Sekeretaris') {
      fetchAllTeachers();
    }
    fetchAllSalaries();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'Bendahara' || user?.role === 'Sekeretaris') {
      riwayatPembayaranGajiGuru?.forEach((val) => {
        val.nip = '';
        const teacher = allTeachers.find((teacher) => teacher.id === val.id_user);
        val.nip = teacher?.nip || '';
      });

      getThisMonthPayroll();
    }
  }, [riwayatPembayaranGajiGuru]);

  useEffect(() => {
    inferThisMonthPayroll();
  }, [thisMonthPayroll]);

  const fetchAllSalaries = async () => {
    var response = null;

    try {
      if (user?.role === 'Guru') {
        const decoded_token = JSON.parse(atob(user.access_token.split('.')[1]));
        response = await fetch(`${Utils.get_salary_by_id}${decoded_token.id_user}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
      } else {
        response = await fetch(Utils.get_all_salary, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token}`,
          },
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setRiwayatPembayaranGajiGuru(data.data);
        console.log(riwayatPembayaranGajiGuru);
      } else if (response.status === 401) {
        // 
      } else {
        console.error('Error verifying applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error verifying applicant:', error);
    }
  }

  const fetchAllTeachers = async () => {
    try {
      const response = await fetch(Utils.get_all_teacher, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAllTeachers(data.data);
      } else {
        console.error('Error verifying applicant:', data);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error verifying applicant:', error);
    }
  }

  const handleSubmitPembayaranGaji = async (values : any) => {
    setLoading(true);

    if (!pembayaranGajiInput) return;
    const payload = {
        nama_lengkap: allTeachers.find((val) => val.id === pembayaranGajiInput.user_id)?.nama_lengkap || '',
        user_id: pembayaranGajiInput.user_id,
        nominal: pembayaranGajiInput.nominal,
        tanggal_pembayaran: Utils.formatDateWithDash(new Date()),
      };

    try {
      const response = await fetch(Utils.input_salary_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setPembayaranGajiInput(null);
        setLoading(false);
        window.location.reload();
      } else {
        console.error('Error submitting salary:', data);
        alert(data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting salary:', error);
    }
  }

  const handleEditPembayaran = async () => {
    if (!selectedForEditing) return;
    setLoading(true);
  
    const payload = {
      nama_lengkap: selectedForEditing.nama_guru,
      nominal: editingNominal,
      tanggal_pembayaran: selectedForEditing.tanggal_pembayaran,
      status_pembayaran: 'Telah Dibayar',
    };

    try {
      const response = await fetch(`${Utils.edit_gaji_url}/${selectedForEditing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setEditingNominal(null);
        setLoading(false);
        window.location.reload();
      } else {
        console.error('Error submitting salary:', data);
        alert(data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error submitting salary:', error);
    }
  }

  const handleDeleteGaji = async (id : number) => {
    setLoading(true);
    console.log(id);

    try {
      const response = await fetch(`${Utils.delete_salary_url}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        window.location.reload();
      } else {
        console.error('Error deleting salary:', data);
        alert(data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting salary:', error);
    }
  }

  const getPembayaranGajiModal = () => {
    return (
      <Modal centered opened={pembayaranGajiOpened} onClose={closePembayaranGaji} title={isEditing ? "Edit Pembayaran" : "Buat Pembayaran Baru"}>
        {isEditing ? 
          <>
            <TextInput
              label="Nama Guru"
              defaultValue={selectedForEditing?.nama_guru || 0}
              disabled
            />
            <TextInput
              label="Nominal Pembayaran"
              placeholder='Rp 0'
              type='number'
              defaultValue={selectedForEditing?.nominal_raw || 0}
              onChange={(e) => setEditingNominal(Number(e.currentTarget.value))}
            />
            <Button disabled={isLoading} onClick={handleEditPembayaran} fullWidth color='#F37F37' type="submit" mt="sm">
              Submit
            </Button>
          </>
          :
          <>
            <Select
              label="Nama Guru"
              allowDeselect={false}
              placeholder="Pilih nama guru"
              data={allTeachers.map((val) => ({ value: val.id.toString(), label: `${val.nip} - ${val.nama_lengkap}` }))}
              onChange={(value) => {
                if (value !== null && pembayaranGajiInput) {
                  setPembayaranGajiInput({
                    ...pembayaranGajiInput,
                    user_id: Number(value),
                    nominal: pembayaranGajiInput.nominal ?? 0, // Pastikan nominal tidak undefined
                  });
                }
              }}
              searchable
              nothingFoundMessage="Guru tidak ditemukan"
              disabled={isEditing}
            />
            <TextInput
              label="Nominal Pembayaran"
              placeholder='Rp 0'
              type='number'
              onChange={(e) => {
                if (pembayaranGajiInput) {
                  setPembayaranGajiInput({
                    ...pembayaranGajiInput,
                    nominal: Number(e.currentTarget.value),
                    user_id: pembayaranGajiInput.user_id ?? 0, // Pastikan user_id tidak undefined
                  });
                }
              }}
            />
            <Button disabled={isLoading} onClick={handleSubmitPembayaranGaji} fullWidth color='#F37F37' type="submit" mt="sm">
              Submit
            </Button>
          </>
        }
      </Modal>
    )
  }

  const getThisMonthPayroll = () => {
    const payrollThisMonth = riwayatPembayaranGajiGuru?.filter((val) => {
      const date = new Date(val.tanggal_pembayaran);
      return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    });

    setThisMonthPayroll(payrollThisMonth);
  }

  const inferThisMonthPayroll = () => {
    const allTeachersForThis = allTeachers;

    for (const teacher of allTeachersForThis) {
      teacher.total_salary = 0;
      const teacherSalaries = thisMonthPayroll?.filter((val) => val.id_user === teacher.id);

      teacherSalaries?.forEach((val) => {
        teacher.total_salary = (teacher.total_salary ?? 0) + val.nominal;
      });
    }

    setCatatanGajiGuru(allTeachersForThis);
  }

  const openPembayaranGajiModal = (isEditing : boolean, selectedData : any) => {
    setSelectedForEditing(selectedData);
    setIsEditing(isEditing);
    openPembayaranGaji();
  }

  const getComponentGaji = (role : String) => {
    switch (role) {
      case 'Bendahara':
        return (
          <div className={styles.gaji__bendahara}>
            <Button
              color='#3FA8E2'
              style={{marginBottom: '1.5rem'}}
              onClick={() => openPembayaranGajiModal(false, null)}
              leftSection={<IconPlus size={14} />
            }>
              Buat Entry Pembayaran Gaji
            </Button>
            <h2>Catatan Pembayaran Gaji Guru</h2>
            <Accordion className={styles.accordion} variant='contained' defaultValue='gaji'>
                <Accordion.Item key='catatan_guru' value='gaji'>
                  <Accordion.Control><span>Daftar Pembayaran Gaji Guru Bulan Ini</span></Accordion.Control>
                  <Accordion.Panel>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Nama Guru</Table.Th>
                        <Table.Th>NIP</Table.Th>
                        <Table.Th>Nominal Pembayaran</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {catatanGajiGuru === null ? <Table.Tr><Table.Td colSpan={4}>Tidak ada data</Table.Td></Table.Tr> :
                      catatanGajiGuru.map((val : any, idx : number) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{val.nama_lengkap}</Table.Td>
                        <Table.Td>{val.nip}</Table.Td>
                        <Table.Td>{Utils.formatCurrency(val.total_salary)}</Table.Td>
                        <Table.Td className={styles.chip__span}>
                          {val.total_salary > 0 ? 
                            <Chip label="Telah Dibayar" color="success" />
                            :
                            <Chip label="Belum Dibayar" color="error" />
                          }
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    </Table.Tbody>
                  </Table>
                  </Accordion.Panel>
                </Accordion.Item>
            </Accordion>

            <h2>Riwayat Pembayaran Gaji Guru</h2>
            <DataGrid
              className={styles.riwayat__pembayaran}
              columns={[
                { field: 'Bulan'},
                { field: 'Tahun'},
                { field: 'Nama Guru', hideable: false, width: 175},
                { field: 'NIP', width: 135, hideable: false},
                {
                  field: 'Nominal',
                  width: 140,
                },
                { field: 'tanggal_pembayaran'},
                { field: 'nominal_raw'},
                { field: 'nama_guru' },
                { field: 'Tanggal Pembayaran', width: 150},
                { field: 'id' },
                {
                  field: 'Action',
                  headerName: 'Action',
                  width: 130,
                  renderCell: (params) => (
                    <div>
                      <Button
                        onClick={() => {
                          confirm('Apakah Anda yakin ingin menghapus data ini?') &&
                          handleDeleteGaji(params.row.id)
                        }}
                        variant='transparent'
                      >
                        <IconTrash color='red' size={14} />
                      </Button>
                      <Button onClick={() => openPembayaranGajiModal(true, params.row)} variant='transparent'><IconPencil color='green' size={14} /></Button>
                    </div>
                  ),
                },
              ]}
              rows={
                riwayatPembayaranGajiGuru.map((val: CatatanGaji, index: number) => ({
                    id: val.id,
                    Bulan: Utils.getBulan(val.tanggal_pembayaran),
                    Tahun: Utils.getTahun(val.tanggal_pembayaran),
                    'Nama Guru': val.nama_lengkap,
                    NIP: val.nip,
                    Nominal: Utils.formatCurrency(val.nominal),
                    'Tanggal Pembayaran': Utils.formatDate(val.tanggal_pembayaran),
                    tanggal_pembayaran: val.tanggal_pembayaran,
                    nominal_raw: val.nominal,
                    nama_guru: val.nama_lengkap,
                    Action: 'Action',
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
                    tanggal_pembayaran: false,
                    nominal_raw: false,
                    nama_guru: false,
                    id: false,
                  }
                }
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
        );
      case 'Guru':
        return (
          <div>
            <h2>{user?.username}</h2>
            <DataGrid
              className={styles.riwayat__pembayaran__guru}
              columns={[
                { field: 'Bulan'},
                { field: 'Tahun'},
                {
                  field: 'Nominal',
                  width: 190,
                },
                { field: 'Tanggal Pembayaran', width: 175 },
              ]}
              rows={
                riwayatPembayaranGajiGuru?.map((val, index) => ({
                  id: val.id,
                  Bulan: Utils.getBulan(val.tanggal_pembayaran),
                  Tahun: Utils.getTahun(val.tanggal_pembayaran),
                  Nominal: Utils.formatCurrency(val.nominal),
                  'Tanggal Pembayaran': Utils.formatDate(val.tanggal_pembayaran),
                }))
              }
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 25,
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
        );
      default:
        return (
          <div className={styles.gaji__default}>
            <h2>Unauthorized</h2>
          </div>
        );
    }
  }

  return (
    <div className={styles.gaji}>
      <Header/>
      <h1 className={styles.title}>Pembayaran Gaji</h1>
        <div className={styles.pengaturan__pembayaran}>
          {getPembayaranGajiModal()}
        </div>
        {getComponentGaji(user?.role || '')}
      <Footer/>
    </div>
  )
}