import { useEffect, useState } from "react";
import {
  Checkbox,
  Button,
  Title,
  Notification,
  Modal,
  Text,
  TextInput,
  Paper,
  Container,
  Group,
} from "@mantine/core";
import Cookies from "js-cookie";
import Utils from "../../utils";
import { useRouter } from "next/router";
import styles from './pengaturan_gaji.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

export default function PengaturanGajiPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [harianAktif, setHarianAktif] = useState(false);
  const [pokokAktif, setPokokAktif] = useState(false);
  const [harianFields, setHarianFields] = useState<string[]>([]);
  const [pokokFields, setPokokFields] = useState<string[]>([]);
  const [labelFields, setLabelFields] = useState<{ [key: string]: string }>({});
  
  const [initialHarianFields, setInitialHarianFields] = useState<string[]>([]);
  const [initialPokokFields, setInitialPokokFields] = useState<string[]>([]);

  const [confirmField, setConfirmField] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [categoryToDisable, setCategoryToDisable] = useState<'harian' | 'pokok' | null>(null);


  const fetchPengaturan = async () => {
    if (!user?.access_token) return;
    try {
      const res = await fetch(Utils.get_pengaturan_gaji_aktif, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "Gagal mengambil data pengaturan");
      }
      const data = resJson.aktif || [];

      const harian = data.filter((item: any) => item.type === "harian");
      const pokok = data.filter((item: any) => item.type === "pokok");

      setHarianAktif(harian.length > 0);
      setPokokAktif(pokok.length > 0);

      const currentHarianFields = harian.map((item: any) => item.field);
      const currentPokokFields = pokok.map((item: any) => item.field);

      setHarianFields(currentHarianFields);
      setPokokFields(currentPokokFields);

      setInitialHarianFields(currentHarianFields);
      setInitialPokokFields(currentPokokFields);

      const labels: { [key: string]: string } = {};
      data.forEach((item: any) => {
        labels[item.field] = item.label || "";
      });
      setLabelFields(labels);
    } catch (error: any) {
      console.error("Gagal mengambil pengaturan:", error);
      setError(error.message || "Gagal mengambil pengaturan gaji dari server.");
      setSuccess(''); 
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setError('');
      setSuccess('');
      setInitialHarianFields([]); 
      setInitialPokokFields([]);
      fetchPengaturan();
    }
  }, [user]);

  const handleAddField = (type: "harian" | "pokok") => {
    setError('');

    // Tentukan variabel berdasarkan tipe
    const isHarian = type === "harian";
    const currentFields = isHarian ? harianFields : pokokFields;
    const setFields = isHarian ? setHarianFields : setPokokFields;
    const prefix = isHarian ? 'gaji' : 'gaji_pokok';

    // Pengecekan awal jika 10 field sudah terisi penuh
    if (currentFields.length >= 10) {
      setError(`Tidak bisa menambah lebih dari 10 field untuk gaji ${type}.`);
      return;
    }

    let nextFieldNumber = 0;

    // Ambil semua nomor field yang sedang digunakan
    const currentNumbers = currentFields.map(f =>
      parseInt(f.replace(prefix, ''))
    ).filter(n => !isNaN(n));
    
    // Cari nomor terbesar yang sedang digunakan. Jika tidak ada, anggap 0.
    const maxNum = currentNumbers.length > 0 ? Math.max(...currentNumbers) : 0;

    // --- FASE 1: Lanjutkan urutan dari nomor terbesar hingga 10 ---
    if (maxNum < 10) {
      for (let i = maxNum + 1; i <= 10; i++) {
        // Karena kita mulai dari maxNum + 1, slot pertama yang diperiksa
        // dijamin kosong, jadi kita bisa langsung pakai.
        nextFieldNumber = i;
        break;
      }
    }
    
    // --- FASE 2: Jika FASE 1 tidak menemukan (karena maxNum sudah 10), cari dari awal ---
    if (nextFieldNumber === 0) {
      for (let i = 1; i < maxNum; i++) {
        const potentialField = `${prefix}${i}`;
        // Cari slot kosong pertama dari awal
        if (!currentFields.includes(potentialField)) {
          nextFieldNumber = i;
          break;
        }
      }
    }

    // Jika nomor berhasil ditemukan (baik dari FASE 1 atau FASE 2)
    if (nextFieldNumber > 0) {
      const nextField = `${prefix}${nextFieldNumber}`;
      setFields(prevFields => [...prevFields, nextField]);
      setLabelFields(prevLabels => ({ ...prevLabels, [nextField]: '' }));
    } else {
      // Fallback jika semua slot sudah penuh (seharusnya sudah ditangani di awal)
      setError(`Gagal menemukan slot field yang tersedia.`);
    }
  };

  const handleLabelChange = (field: string, value: string) => {
    const newLabelTrimmed = value.trim();
    let isDuplicate = false;

    if (newLabelTrimmed !== "") {
      isDuplicate = Object.entries(labelFields).some(
        ([currentFieldKey, currentLabelValue]) =>
          currentFieldKey !== field && 
          currentLabelValue &&        
          currentLabelValue.trim().toLowerCase() === newLabelTrimmed.toLowerCase()
      );
    }

    if (isDuplicate) {
      setError(`Label "${newLabelTrimmed}" sudah digunakan. Harap gunakan nama label yang lain.`);
      setSuccess('');
    } else {
      if (error.includes("sudah digunakan")) {
        setError('');
      }
    }

    setLabelFields((prev) => ({
      ...prev,
      [field]: value, 
    }));
  };

  const confirmDeleteField = (field: string) => {
    setConfirmField(field);
    setConfirmOpen(true);
  };

  const handleDeleteField = async () => {
    setError('');
    setSuccess('');

    if (!confirmField) return;

    const isPersistedField = initialHarianFields.includes(confirmField) || initialPokokFields.includes(confirmField);

    if (!isPersistedField) {
      setHarianFields(prev => prev.filter(f => f !== confirmField));
      setPokokFields(prev => prev.filter(f => f !== confirmField));
      setLabelFields(prev => {
        const newLabels = {...prev};
        delete newLabels[confirmField];
        return newLabels;
      });
      setSuccess("Field baru (belum disimpan) berhasil dihapus dari tampilan.");
      setConfirmField(null);
      setConfirmOpen(false);
      return;
    }

    if (!user?.access_token) {
        setError("Sesi pengguna tidak ditemukan untuk menghapus field dari server.");
        setConfirmField(null);
        setConfirmOpen(false);
        return;
    }

    try {
      const res = await fetch(Utils.delete_pengaturan_gaji_aktif(confirmField), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      if (!res.ok) {
        const resJson = await res.json();
        throw new Error(resJson.error || `Gagal menghapus field '${confirmField}' dari server`);
      }
      setSuccess(`Field '${confirmField}' berhasil dihapus dari server.`); 
      await fetchPengaturan();
    } catch (error: any) {
      console.error("Gagal menghapus field:", error);
      setError(error.message || `Gagal menghapus field '${confirmField}'`);
    } finally {
      setConfirmField(null);
      setConfirmOpen(false);
    }
  };

  const handleCategoryChange = (type: 'harian' | 'pokok', checked: boolean) => {
    if (checked) {
      if (type === 'harian') setHarianAktif(true);
      if (type === 'pokok') setPokokAktif(true);
    } else {
      setCategoryToDisable(type);
      setDisableConfirmOpen(true);
    }
  };

  const handleConfirmDisable = () => {
    if (categoryToDisable === 'harian') {
      setHarianAktif(false);
      setHarianFields([]);
    } else if (categoryToDisable === 'pokok') {
      setPokokAktif(false);
      setPokokFields([]);
    }
    setDisableConfirmOpen(false);
    setCategoryToDisable(null);
  };


  const handleSubmit = async () => {
    setError(''); 
    setSuccess('');

    if (!user?.access_token) {
        setError("Sesi pengguna tidak ditemukan, silakan login kembali.");
        return;
    }

    const fieldsToSaveHarian = harianAktif 
      ? harianFields.map(f => ({ field: f, label: labelFields[f]?.trim() || "", type: "harian" }))
      : [];
    
    const fieldsToSavePokok = pokokAktif
      ? pokokFields.map(f => ({ field: f, label: labelFields[f]?.trim() || "", type: "pokok" }))
      : [];

    const allFieldsToSave = [
      ...fieldsToSaveHarian,
      ...fieldsToSavePokok
    ];

    const labels = allFieldsToSave
      .map(item => item.label.toLowerCase()) 
      .filter(label => label !== ""); 

    const counts: { [key: string]: number } = {};
    labels.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });

    const duplicates = Object.entries(counts)
      .filter(([_, count]) => count > 1)
      .map(([label]) => {
          const originalCaseLabel = allFieldsToSave.find(item => item.label.toLowerCase() === label)?.label;
          return originalCaseLabel || label;
      });

    if (duplicates.length > 0) {
      setError(`Nama label tidak boleh sama. Label duplikat: ${duplicates.join(", ")}`);
      return;
    }

    try {
      const payload = {
        aktif: allFieldsToSave,
      };

      const res = await fetch(Utils.save_pengaturan_gaji_aktif, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const resJson = await res.json();
        throw new Error(resJson.error || "Gagal menyimpan pengaturan");
      }
      
      setSuccess("Pengaturan berhasil disimpan"); 
      await fetchPengaturan();
    } catch (error: any) {
      console.error("Gagal menyimpan:", error);
      setError(error.message || "Gagal menyimpan pengaturan");
    }
  };

  return (
    <>
      <Header />
      <Container my="xl">
        <Button
          variant="outline"
          color="gray"
          radius="sm"
          onClick={() => router.push('/')}
          mb="lg"
        >
          Kembali
        </Button>
        <div className={styles.page_wrapper}>
            <Title ta="center" order={2} className={styles.title}>Pengaturan Gaji Aktif</Title>
            
            {success && (
                <Notification my="md" color="green" onClose={() => setSuccess('')} title="Sukses" withCloseButton>
                {success}
                </Notification>
            )}
            {error && (
                <Notification my="md" color="red" onClose={() => setError('')} title="Error" withCloseButton>
                {error}
                </Notification>
            )}

            <Modal
                opened={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Konfirmasi Hapus Field"
                centered
            >
                <Text>Apakah Anda yakin ingin menghapus field ini beserta labelnya?</Text>
                <Group justify="flex-end" mt="md" className={styles.modalButtonGroup}>
                <Button color="grey" variant="outline" onClick={() => setConfirmOpen(false)}>Batal</Button>
                <Button color="red" onClick={handleDeleteField}>Ya, Hapus</Button>
                </Group>
            </Modal>

            <Modal
                opened={disableConfirmOpen}
                onClose={() => setDisableConfirmOpen(false)}
                title={`Konfirmasi Nonaktifkan Gaji ${categoryToDisable}`}
                centered
            >
                <Text>
                Menonaktifkan kategori ini akan menghapus semua field dan label yang telah Anda buat di dalamnya.
                Apakah Anda yakin?
                </Text>
                <Group justify="flex-end" mt="md" className={styles.modalButtonGroup}>
                <Button variant="outline" onClick={() => setDisableConfirmOpen(false)}>Batal</Button>
                <Button color="red" onClick={handleConfirmDisable}>Ya, Nonaktifkan & Hapus Field</Button>
                </Group>
            </Modal>

            <div className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                <Checkbox
                    label="Gaji Harian Aktif"
                    checked={harianAktif}
                    onChange={(e) => handleCategoryChange('harian', e.currentTarget.checked)}
                />
                {harianAktif && (
                    <Button
                    variant="outline"
                    size="sm"
                    color="green"
                    radius="md"
                    onClick={() => handleAddField("harian")}
                    disabled={harianFields.length >= 10}
                    >
                    Tambah Field Gaji Harian
                    </Button>
                )}
                </div>

                {harianAktif && harianFields.map((field) => (
                <div key={field} className={styles.inputWrapper}>
                    <TextInput
                    className={styles.textInput}
                    label={`Label untuk ${field}`}
                    placeholder="Masukkan nama label (e.g., Tunjangan Transport)"
                    value={labelFields[field] || ""}
                    onChange={(e) => handleLabelChange(field, e.currentTarget.value)}
                    error={error && error.includes(labelFields[field]?.trim()) && labelFields[field]?.trim() !== "" ? error : undefined}
                    />
                    <Button
                    variant="subtle"
                    color="red"
                    className={styles.deleteButton}
                    onClick={() => confirmDeleteField(field)}
                    title={`Hapus field ${field}`}
                    >
                    Hapus
                    </Button>
                </div>
                ))}
            </div>

            <div className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                <Checkbox
                    label="Gaji Pokok Aktif"
                    checked={pokokAktif}
                    onChange={(e) => handleCategoryChange('pokok', e.currentTarget.checked)}
                />
                {pokokAktif && ( 
                    <Button
                    variant="outline"
                    size="sm"
                    color="green"
                    radius="md"
                    onClick={() => handleAddField("pokok")}
                    disabled={pokokFields.length >= 10}
                    >
                    Tambah Field Gaji Pokok
                    </Button>
                )}
                </div>

                {pokokAktif && pokokFields.map((field) => (
                <div key={field} className={styles.inputWrapper}>
                    <TextInput
                    className={styles.textInput}
                    label={`Label untuk ${field}`}
                    placeholder="Masukkan nama label (e.g., Gaji Dasar)"
                    value={labelFields[field] || ""}
                    onChange={(e) => handleLabelChange(field, e.currentTarget.value)}
                    error={error && error.includes(labelFields[field]?.trim()) && labelFields[field]?.trim() !== "" ? error : undefined}
                    />
                    <Button
                    variant="subtle"
                    color="red"
                    className={styles.deleteButton}
                    onClick={() => confirmDeleteField(field)}
                    title={`Hapus field ${field}`}
                    >
                    Hapus
                    </Button>
                </div>
                ))}
            </div>

            <Group justify="center" mt="xl">
                <Button variant="outline" color="green" onClick={handleSubmit} size="sm" radius="md">
                    Simpan Pengaturan
                </Button>
            </Group>
        </div>
      </Container>
      <Footer />
    </>
  );
}