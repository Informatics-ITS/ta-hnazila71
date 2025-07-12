export interface User {
  id_user: number;
  username: string;
  role: 'Bendahara' | 'Sekeretaris' | 'Guru';
  access_token: string;
}

export interface CatatanGaji {
  id: number;
  id_user: number;
  nama_lengkap: string;
  nip: string;
  nominal: number;
  tanggal_pembayaran: string;
}

export interface Teacher {
  id: number;
  nip: string;
  nama_lengkap: string;
  total_salary?: number;
}

export interface PembayaranGajiInput {
  user_id: number;
  nominal: number;
}

export interface SelectedForEditing {
  nama_guru: string;
  nominal_raw: number;
  tanggal_pembayaran: string;
  id: number;
}