import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Utils from "../../../utils";
import Cookies from "js-cookie";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import {
  Button,
  Title,
  Container,
  Group,
  Modal,
  NumberInput,
  Grid,
  Avatar,
  Text,
  Flex,
  Loader,
  Center,
  Table as MantineTable,
  Notification,
  Paper,
} from "@mantine/core";

export default function RincianJabatan() {
  const router = useRouter();
  const { jabatan } = router.query;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [modalData, setModalData] = useState<any>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [aktifFields, setAktifFields] = useState<{ field: string; label: string; type: string }[]>([]);

  useEffect(() => {
    const initializeAndFetchData = async () => {
      setLoading(true);
      setError('');
      
      const userCookie = Cookies.get("user");
      if (!userCookie || !jabatan) {
        setLoading(false);
        setError("User tidak ditemukan atau jabatan tidak valid.");
        return;
      }
      
      const parsedUser = JSON.parse(userCookie);
      if (!parsedUser?.access_token) {
        setLoading(false);
        setError("Token akses tidak valid.");
        return;
      }
      
      try {
        const [aktifFieldsRes, detailJabatanRes] = await Promise.all([
          fetch(Utils.get_pengaturan_gaji_aktif, {
            headers: { Authorization: `Bearer ${parsedUser.access_token}` },
          }),
          fetch(`${Utils.get_detail_jabatan}/${jabatan}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${parsedUser.access_token}`,
            },
          }),
        ]);

        if (!aktifFieldsRes.ok) {
          const errorJson = await aktifFieldsRes.json();
          throw new Error(`Pengaturan Gaji Gagal: ${errorJson.message || 'Server Error'}`);
        }
        if (!detailJabatanRes.ok) {
          const errorJson = await detailJabatanRes.json();
          throw new Error(`Detail Jabatan Gagal: ${errorJson.message || errorJson.detail || 'Server Error'}`);
        }

        const aktifFieldsJson = await aktifFieldsRes.json();
        const detailJabatanJson = await detailJabatanRes.json();
        
        const jabatanData = Array.isArray(detailJabatanJson.data)
          ? detailJabatanJson.data[0]
          : detailJabatanJson.data;

        if (jabatanData && typeof jabatanData.jabatan === 'string') {
          jabatanData.jabatan = jabatanData.jabatan.trim();
        }
        
        setAktifFields(aktifFieldsJson.aktif || []);
        setData(jabatanData || {});
        setModalData(jabatanData || {});

      } catch (err: any) {
        console.error("Gagal memuat data halaman rincian:", err);
        setError(err.message);
        setData({});
        setModalData({});
        setAktifFields([]);
      } finally {
        setLoading(false);
      }
    };

    if (jabatan) {
      initializeAndFetchData();
    }
  }, [jabatan]);


  const handleChange = (key: string, value: string | number | undefined) => {
    const numValue = Number(value) || 0;
    
    if (numValue < 0) {
      setError("Nilai gaji tidak boleh kurang dari 0");
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (error && numValue >= 0) {
      setError('');
    }
    
    setModalData((prev: any) => ({ ...prev, [key]: numValue }));
  };

  const handleSave = async () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
        setError("Sesi berakhir, silakan login kembali.");
        return;
    }
    const parsedUser = JSON.parse(userCookie);

    try {
      const res = await fetch(`${Utils.put_jabatan}/${jabatan}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.access_token}`,
        },
        body: JSON.stringify(modalData),
      });

      if (res.ok) {
        setSuccess("Gaji berhasil diperbarui");
        setError('');
        setEditMode(false);
        setData(modalData);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorResponse = await res.json();
        setError(errorResponse.error || errorResponse.message || "Terjadi kesalahan");
        setSuccess('');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error("Gagal menyimpan perubahan", error);
      setError("Terjadi kesalahan saat menyimpan data");
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Center mt="xl">
        <Loader color="orange" />
      </Center>
    );
  }

  return (
    <>
      <Header />
      <Container my="xl">
        <Button
            variant="outline"
            size="sm"
            color="gray"
            radius="md"
            style={{ marginBottom: '1rem' }}
            onClick={() => router.push('/master_jabatan')}
        >
            Kembali
        </Button>
        <Paper withBorder shadow="sm" p="lg" radius="md">
            <Flex align="center" mb="lg" gap="md">
            <Avatar color="orange" radius="xl" size="lg">
                {data?.jabatan?.[0] || "J"}
            </Avatar>
            <div>
                <Title order={2} style={{ fontFamily: "Poppins, sans-serif" }}>Rincian Detail Gaji</Title>
                <Text size="md" c="dimmed" style={{ fontFamily: "Poppins, sans-serif" }}>{data?.jabatan || jabatan}</Text>
            </div>
            </Flex>

            {error && (
            <Notification 
                color="red" 
                mb="md" 
                onClose={() => setError('')}
                title="Terjadi Error"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                {error}
            </Notification>
            )}
            {success && (
            <Notification 
                color="green" 
                mb="md" 
                onClose={() => setSuccess('')}
                title="Berhasil"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                {success}
            </Notification>
            )}

            <Title order={4} mt="xl" style={{ fontFamily: "Poppins, sans-serif" }}>Tabel Gaji Harian</Title>
            <MantineTable striped highlightOnHover mt="sm">
            <MantineTable.Thead>
                <MantineTable.Tr>
                {aktifFields
                    .filter((f) => f.type === "harian" && f.field.startsWith("gaji"))
                    .sort((a, b) => parseInt(a.field.replace("gaji", ""), 10) - parseInt(b.field.replace("gaji", ""), 10))
                    .map((f) => (
                    <MantineTable.Th key={f.field} style={{ backgroundColor: "#f8f9fa", fontWeight: "600", textAlign: "center" }}>
                        {f.label}
                    </MantineTable.Th>
                ))}
                </MantineTable.Tr>
            </MantineTable.Thead>
            <MantineTable.Tbody>
                <MantineTable.Tr>
                {aktifFields
                    .filter((f) => f.type === "harian" && f.field.startsWith("gaji"))
                    .sort((a, b) => parseInt(a.field.replace("gaji", ""), 10) - parseInt(b.field.replace("gaji", ""), 10))
                    .map((f) => (
                    <MantineTable.Td key={f.field} style={{ textAlign: "center" }}>
                        {Intl.NumberFormat('id-ID').format(data?.[f.field] || 0)}
                    </MantineTable.Td>
                ))}
                </MantineTable.Tr>
            </MantineTable.Tbody>
            </MantineTable>

            <Title order={4} mt="xl" style={{ fontFamily: "Poppins, sans-serif" }}>Tabel Gaji Pokok</Title>
            <MantineTable striped highlightOnHover mt="sm">
            <MantineTable.Thead>
                <MantineTable.Tr>
                {aktifFields.filter((f) => f.type === "pokok").map((f) => (
                    <MantineTable.Th key={f.field} style={{ backgroundColor: "#f8f9fa", fontWeight: "600", textAlign: "center" }}>
                    {f.label}
                    </MantineTable.Th>
                ))}
                </MantineTable.Tr>
            </MantineTable.Thead>
            <MantineTable.Tbody>
                <MantineTable.Tr>
                {aktifFields.filter((f) => f.type === "pokok").map((f) => (
                    <MantineTable.Td key={f.field} style={{ textAlign: "center" }}>
                    {Intl.NumberFormat('id-ID').format(data?.[f.field] || 0)}
                    </MantineTable.Td>
                ))}
                </MantineTable.Tr>
            </MantineTable.Tbody>
            </MantineTable>

            <Group mt="xl">
            <Button variant="outline" size="sm" color="green" radius="md" onClick={() => setEditMode(true)}>
                Edit
            </Button>
            </Group>
        </Paper>
      </Container>
      <Footer />

      <Modal opened={editMode} onClose={() => setEditMode(false)} title={`Edit Gaji - ${data?.jabatan || jabatan}`} size="xl" centered>
        <Title order={5} style={{ fontFamily: "Poppins, sans-serif" }}>Gaji Harian</Title>
        <Grid>
            {aktifFields
              .filter((f) => f.type === "harian" && f.field.startsWith("gaji"))
              .sort((a, b) => parseInt(a.field.replace("gaji", ""), 10) - parseInt(b.field.replace("gaji", ""), 10))
              .map((f) => (
                <Grid.Col span={3} key={`edit-${f.field}`}>
                  <NumberInput
                    label={f.label}
                    value={modalData[f.field] || 0}
                    onChange={(val) => handleChange(f.field, val)}
                    hideControls
                    min={0}
                    thousandSeparator=","
                  />
                </Grid.Col>
            ))}
        </Grid>

        <Title order={5} mt="md" style={{ fontFamily: "Poppins, sans-serif" }}>Gaji Pokok</Title>
        <Grid>
            {aktifFields.filter((f) => f.type === "pokok").map((f) => (
              <Grid.Col span={3} key={`edit-pokok-${f.field}`}>
                <NumberInput
                  label={f.label}
                  value={modalData[f.field] || 0}
                  onChange={(val) => handleChange(f.field, val)}
                  hideControls
                  min={0}
                  thousandSeparator=","
                />
              </Grid.Col>
            ))}
        </Grid>

        <Group mt="lg">
            <Button variant="outline" size="sm" color="green" radius="md" onClick={handleSave}>
              Simpan Perubahan
            </Button>
            <Button variant="outline" size="sm" color="gray" radius="md" onClick={() => setEditMode(false)}>
              Batal
            </Button>
        </Group>
      </Modal>
    </>
  );
}