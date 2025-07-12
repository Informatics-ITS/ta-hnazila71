import { env } from "process";

export default abstract class Utils {
    private static base_url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/') + (process.env.NEXT_PUBLIC_API_VERSION || 'v1');    ;
    public static login_url = this.base_url + '/users/login/';
    public static register_url = this.base_url + '/users/orang-tua/';

    public static ppdb = this.base_url + '/ppdb/';
    public static get_children_ppdb_url = this.base_url + '/ppdb/orang-tua/';
    public static register_ppdb_url = this.base_url + '/ppdb/add/';
    public static get_all_discount_url = this.base_url + '/payments/discount/';
    public static verify_ppdb_url = this.base_url + '/ppdb/verifikasi/';

    public static add_bill_spp = this.base_url + '/payments/add-spp';
    public static get_bill_spp = this.base_url + '/payments/spp';
    public static del_bill_spp = this.base_url + '/payments/spp';
    public static put_bill_spp = this.base_url + '/payments/spp';
    public static get_all_payments_spp = this.base_url + '/payments/spp/history';
    public static get_all_payments_spp_ortu = this.base_url + '/payments/orang_tua/history';
    public static get_bill_spp_ortu = this.base_url + '/payments/orang_tua/bill';
    public static add_bill_spp_ortu = this.base_url + '/payments/spp';
    public static update_payment_status = this.base_url + '/payments/spp/user-bill/status/';
    public static discount_spp = this.base_url + '/payments/discount';
    public static student_bill_status = this.base_url + '/payments/spp/student-bill/status/';
    public static get_all_student_bill = this.base_url + '/payments/spp/student-bills';

    public static post_pengeluaran_rt = this.base_url + '/pengeluaran-rumah-tangga/add';
    public static get_pengeluaran_rt = this.base_url + '/pengeluaran-rumah-tangga';
    public static del_pengeluaran_rt = this.base_url + '/pengeluaran-rumah-tangga';
    public static put_pengeluaran_rt = this.base_url + '/pengeluaran-rumah-tangga';

    public static add_bill_daftar_ulang = this.base_url + '/payments/add-daftar-ulang';
    public static get_bill_daftar_ulang = this.base_url + '/payments/daftar-ulang';
    public static del_bill_daftar_ulang = this.base_url + '/payments/daftar-ulang';
    public static put_bill_daftar_ulang = this.base_url + '/payments/daftar-ulang';
    public static get_all_payments_daftar_ulang = this.base_url + '/payments/daftar-ulang/history';
    public static get_all_payments_daftar_ulang_ortu = this.base_url + '/payments/orang_tua/history-daftar-ulang';
    public static get_bill_daftar_ulang_ortu = this.base_url + '/payments/orang_tua/daftar-ulang-bill';
    public static add_bill_daftar_ulang_ortu = this.base_url + '/payments/daftar-ulang'; 
    public static update_payment_status_daftar_ulang = this.base_url + '/payments/daftar-ulang/user-bill/status/';
    public static discount_daftar_ulang = this.base_url + '/payments/discount';
    public static student_bill_status_daftar_ulang = this.base_url + '/payments/daftar-ulang/student-bill/status/';
    public static get_all_student_bill_daftar_ulang = this.base_url + '/payments/daftar-ulang/student-bills';

    public static get_all_salary = this.base_url + '/gaji';
    public static get_salary_by_id = this.base_url + '/gaji?user_id=';
    public static input_salary_url = this.base_url + '/gaji';
    public static delete_salary_url = this.base_url + '/gaji';
    public static edit_gaji_url = this.base_url + '/gaji';
    public static get_all_teacher = this.base_url + '/users/guru';

    public static get_bonus_by_nip = this.base_url + '/rekap-bonus';
    
    public static tambah_user = this.base_url + '/users';
    public static get_all_user = this.base_url + '/users';
    public static update_user = (id: string) => `${this.base_url}/users/${id}`;
    public static delete_user = (id: string) => `${this.base_url}/users/${id}`;
    public static reset_password = this.base_url + '/users/reset-password';

    public static get_all_jabatan = this.base_url + '/master-jabatan';
    public static get_detail_jabatan = this.base_url + '/master-jabatan';
    public static put_jabatan = this.base_url + '/master-jabatan';
    public static delete_jabatan = this.base_url + '/master-jabatan';
    public static tambah_jabatan = this.base_url + '/master-jabatan'; 

    public static get_all_potongan_keterlambatan = this.base_url + '/potongan-keterlambatan';
    public static tambah_potongan_keterlambatan = this.base_url + '/potongan-keterlambatan';
    public static delete_potongan_keterlambatan = this.base_url + '/potongan-keterlambatan';
    public static put_potongan_keterlambatan = this.base_url + '/potongan-keterlambatan';
    public static get_detail_potongan_keterlambatan = this.base_url + '/potongan-keterlambatan';

    public static get_salary_by_nip = this.base_url + '/salary-detail';
    public static detele_salary = this.base_url + '/salary-detail';
    public static upload_salary_csv = this.base_url + '/salary-detail/upload';
    public static download_pdf_url = this.base_url + '/salary-detail/salary/final/pdf';
    public static manual_input_salary = this.base_url + '/salary-detail/manual';
    public static get_my_salary_detail = this.base_url + '/salary-detail/my-salary-detail';

    public static get_pengaturan_gaji_aktif = this.base_url + '/pengaturan-gaji-aktif';
    public static save_pengaturan_gaji_aktif = this.base_url + '/pengaturan-gaji-aktif';
    public static delete_pengaturan_gaji_aktif = (field: string) => `${this.base_url}/pengaturan-gaji-aktif/${field}`;
    
    public static get_pengajuan_perubahan_gaji = this.base_url + '/pengajuan-perubahan-gaji';
    public static post_pengajuan_perubahan_gaji = this.base_url + '/pengajuan-perubahan-gaji';
    public static update_pengajuan_perubahan_gaji_status = (id: string) => `${this.base_url}/pengajuan-perubahan-gaji/${id}/status`;

    public static backend_base = 'https://backend-kinderfin.onrender.com/';
    // public static backend_base = 'http://localhost:3000/';

    public static get_all_activity_log = this.base_url + '/activity-log';

    public static readonly fetch_fingerspot_attendance = `${Utils.base_url}/salary-detail/fingerspot/fetch`;

    public static getInitials = (name?: string) => {
        if (!name) return '';
        return name.split(' ').map((n) => n[0]).join('');
      };
      

    public static formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    public static getBulanTahunNow = () => {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        return { month, year };
    };

    public static formatDate = (date: string) => {
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate();
        const year = dateObj.getFullYear();

        return `${day} ${month} ${year}`;
    }

    public static getBulan = (date: string) => {
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('default', { month: 'long' });
        return month;
    }

    public static getTahun = (date: string) => {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        return year;
    }

    public static formatDateWithDash(date: any) {
        if (!date || !(date instanceof Date)) return '';
      
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
      
        return `${year}-${month}-${day}`;
      }

    public static getCurrentYear = () => {
        return new Date().getFullYear();
      }      

      public static formatPercentage = (value: number) => {
        return `${value}%`;
    }
}