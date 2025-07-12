import { Sequelize, QueryTypes } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { StudentBillsProps, StudentBillsEntity, SPPProps, SPPEntity, DaftarUlangProps, DaftarUlangEntity } from "../../../domain/entity";
import { IStudentBillsRepository } from "../../../domain/repository";

type BillCombinedProps = {
  studentBill: StudentBillsEntity<StudentBillsProps>;
  sppBill: SPPEntity<SPPProps>;
};

type DaftarUlangCombinedProps = {
  studentBill: StudentBillsEntity<StudentBillsProps>;
  daftarUlangBill: DaftarUlangEntity<DaftarUlangProps>;
};

type BillDetailProps = {
  id_bill: string;
  id_tagihan: string;
  total_paid: number;
  remaining_amount: number;
  payment_status: string;
  id_discount: string;
  id_student: string;
  nama_siswa: string;
  nama_tagihan: string;
  biaya_spp: number;
  biaya_komite: number;
  biaya_ekstrakulikuler: number;
  due_date: Date;
}


export class StudentBillsRepository implements IStudentBillsRepository {
  constructor(private readonly dbConn: Sequelize) {
  }

  async addStudentBills(studentBillsData: StudentBillsEntity<StudentBillsProps>): Promise<void> {
    try {

      // check if id_student with id_tagihan already exists
      if (studentBillsData.getIdDiscount() == "") {
        studentBillsData.setIdDiscount(null);
      }
      const studentBills = await this.dbConn.models["student_bills"].findOne({
        where: {
          id_student: studentBillsData.getIdStudent(),
          id_tagihan: studentBillsData.getIdTagihan(),
        },
      });

      if (studentBills) {
        throw new ApplicationError(400, "Student Bills already exists");
      }

      await this.dbConn.transaction(async (t) => {
        const studentBillsModel = this.dbConn.models["student_bills"];
        await studentBillsModel.create(
          {
            ...(studentBillsData as any),
          },
          { transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message || "An unknown error occurred");
    }
  }

  async getBillsByParentId(parentId: AggregateId): Promise<BillDetailProps[]> {
    try {

      const studentBills = await this.dbConn.query(
        `SELECT sb.id as id_bill, sb.id_student, sb.id_tagihan, sb.id_discount, sb.total_paid, sb.remaining_amount, sb.payment_status, 
        s.nama_lengkap as nama_siswa, spp.nama as nama_tagihan, spp.biaya_spp, spp.biaya_komite, spp.biaya_ekstrakulikuler, spp.due_date
        FROM student_bills sb
        INNER JOIN students s ON sb.id_student = s.id
        INNER JOIN spp spp ON sb.id_tagihan = spp.id
        WHERE s.id_orang_tua = :parentId AND sb.id_tagihan IS NOT NULL
        ORDER BY sb.created_at DESC`, 
        {
          type: QueryTypes.SELECT,
          replacements: { parentId }, 
        }
      );
      return studentBills.map((studentBill: any) => {
        return studentBill as BillDetailProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getAllStudentBills(): Promise<BillDetailProps[]> {
    try {
      const studentBills = await this.dbConn.query(
        `SELECT sb.id as id_bill, sb.id_student, sb.id_tagihan, sb.id_discount, sb.total_paid, sb.remaining_amount, sb.payment_status, 
        s.nama_lengkap as nama_siswa, spp.nama as nama_tagihan, spp.biaya_spp, spp.biaya_komite, spp.biaya_ekstrakulikuler, spp.due_date
        FROM student_bills sb
        INNER JOIN students s ON sb.id_student = s.id
        INNER JOIN spp spp ON sb.id_tagihan = spp.id
        WHERE sb.id_tagihan IS NOT NULL
        ORDER BY sb.created_at DESC`, 
        {
          type: QueryTypes.SELECT,
        }
      );

      return studentBills.map((studentBill: any) => {
        return studentBill as BillDetailProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getAllDaftarUlangStudentBills(): Promise<BillDetailProps[]> {
    try {
      const studentBills = await this.dbConn.query(
        `SELECT sb.id as id_bill, sb.id_student, sb.id_tagihan, sb.id_discount, sb.total_paid, sb.remaining_amount, sb.payment_status, 
        s.nama_lengkap as nama_siswa, daftar_ulang.nama as nama_tagihan, daftar_ulang.biaya_perlengkapan, daftar_ulang.biaya_kegiatan, daftar_ulang.due_date
        FROM student_bills sb
        INNER JOIN students s ON sb.id_student = s.id
        INNER JOIN daftar_ulang daftar_ulang ON sb.id_tagihan = daftar_ulang.id
        WHERE sb.id_tagihan IS NOT NULL
        ORDER BY sb.created_at DESC`, 
        {
          type: QueryTypes.SELECT,
        }
      );
      return studentBills.map((studentBill: any) => {
        return studentBill as BillDetailProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDaftarUlangBillsByParentId(parentId: AggregateId): Promise<BillDetailProps[]> {
    try {
      const studentBills = await this.dbConn.query(
        `SELECT sb.id as id_bill, sb.id_student, sb.id_tagihan, sb.id_discount, sb.total_paid, sb.remaining_amount, sb.payment_status, 
        s.nama_lengkap as nama_siswa, daftar_ulang.nama as nama_tagihan, daftar_ulang.biaya_perlengkapan, daftar_ulang.biaya_kegiatan, daftar_ulang.total_amount, daftar_ulang.semester, daftar_ulang.tahun_ajaran, daftar_ulang.due_date
        FROM student_bills sb
        INNER JOIN students s ON sb.id_student = s.id
        INNER JOIN daftar_ulang daftar_ulang ON sb.id_tagihan = daftar_ulang.id
        WHERE s.id_orang_tua = :parentId AND sb.id_tagihan IS NOT NULL
        ORDER BY sb.created_at DESC`, 
        {
          type: QueryTypes.SELECT,
          replacements: { parentId }
        }
      );
      return studentBills.map((studentBill: any) => {
        return studentBill as BillDetailProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getBillsByStudentId(studentId: AggregateId): Promise<StudentBillsProps[]> {
    try {
      const studentBills = await this.dbConn.models["student_bills"].findAll(
        {
          where: { id_student: studentId },
        },
      );
      return studentBills.map((studentBill: any) => {
        return studentBill as StudentBillsProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getStudentBillsById(id: AggregateId): Promise<BillCombinedProps> {
    try {
      const studentBillsData = await this.dbConn.models["student_bills"].findOne({
        where: { id },
      });
  
      if (!studentBillsData) {
        throw new ApplicationError(404, "Student Bills not found");
      }
  
      const studentBillsProps: StudentBillsProps = {
        id: (studentBillsData as any).id,
        id_student: (studentBillsData as any).id_student,
        id_tagihan: (studentBillsData as any).id_tagihan,
        id_discount: (studentBillsData as any).id_discount,
        total_paid: (studentBillsData as any).total_paid,
        remaining_amount: (studentBillsData as any).remaining_amount,
        payment_status: (studentBillsData as any).payment_status,
      };
  
      const sppBillData = await this.dbConn.models["spp"].findOne({
        where: { id: studentBillsProps.id_tagihan },
      });

      const daftarUlangBillData = await this.dbConn.models["daftar_ulang"].findOne({
        where: { id: studentBillsProps.id_tagihan },
      });
  
      if (!sppBillData) {
        throw new ApplicationError(404, "SPP Bill not found");
      }
  
      const sppBillProps: SPPProps = {
        id: (sppBillData as any).id,
        nama: (sppBillData as any).nama,
        biaya_spp: (sppBillData as any).biaya_spp,
        biaya_komite: (sppBillData as any).biaya_komite,
        biaya_ekstrakulikuler: (sppBillData as any).biaya_ekstrakulikuler,
        total_amount: (sppBillData as any).total_amount,
        bulan: (sppBillData as any).bulan,
        tahun_ajaran: (sppBillData as any).tahun_ajaran,
        due_date: (sppBillData as any).due_date,
      };

      // const daftarUlangBillProps: DaftarUlangProps = {
      //   id: (daftarUlangBillData as any).id,
      //   nama: (daftarUlangBillData as any).nama,
      //   biaya_perlengkapan: (daftarUlangBillData as any).biaya_perlengkapan,
      //   biaya_kegiatan: (daftarUlangBillData as any).biaya_kegiatan,
      //   total_amount: (daftarUlangBillData as any).total_amount,
      //   semester: (daftarUlangBillData as any).semester,
      //   tahun_ajaran: (daftarUlangBillData as any).tahun_ajaran,
      //   due_date: (daftarUlangBillData as any).due_date,
      // };
  
      const studentBillsEntity = new StudentBillsEntity(studentBillsProps);
      const sppEntity = new SPPEntity(sppBillProps);
      // const daftarUlangEntity = new DaftarUlangEntity(daftarUlangBillProps);
  
      // Gabungkan entitas menjadi objek yang valid untuk BillCombinedProps
      const combinedProps: BillCombinedProps = {
        studentBill: studentBillsEntity,
        sppBill: sppEntity,
        // daftarUlangBill: daftarUlangEntity,
      };
  
      return combinedProps;
  
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDaftarUlangBillsById(id: AggregateId): Promise<DaftarUlangCombinedProps> {
    try {
      const studentBillsData = await this.dbConn.models["student_bills"].findOne({
        where: { id },
      });
  
      if (!studentBillsData) {
        throw new ApplicationError(404, "Student Bills not found");
      }
  
      const studentBillsProps: StudentBillsProps = {
        id: (studentBillsData as any).id,
        id_student: (studentBillsData as any).id_student,
        id_tagihan: (studentBillsData as any).id_tagihan,
        id_discount: (studentBillsData as any).id_discount,
        total_paid: (studentBillsData as any).total_paid,
        remaining_amount: (studentBillsData as any).remaining_amount,
        payment_status: (studentBillsData as any).payment_status,
      };

      const daftarUlangBillData = await this.dbConn.models["daftar_ulang"].findOne({
        where: { id: studentBillsProps.id_tagihan },
      });

      if (!daftarUlangBillData) {
        throw new ApplicationError(404, "Daftar Ulang Bill not found");
      }

      const daftarUlangBillProps: DaftarUlangProps = {
        id: (daftarUlangBillData as any).id,
        nama: (daftarUlangBillData as any).nama,
        biaya_perlengkapan: (daftarUlangBillData as any).biaya_perlengkapan,
        biaya_kegiatan: (daftarUlangBillData as any).biaya_kegiatan,
        total_amount: (daftarUlangBillData as any).total_amount,
        semester: (daftarUlangBillData as any).semester,
        tahun_ajaran: (daftarUlangBillData as any).tahun_ajaran,
        due_date: (daftarUlangBillData as any).due_date,
      };
  
      const studentBillsEntity = new StudentBillsEntity(studentBillsProps);
      const daftarUlangEntity = new DaftarUlangEntity(daftarUlangBillProps);
  
      // Gabungkan entitas menjadi objek yang valid untuk BillCombinedProps
      const daftarUlangCombinedProps: DaftarUlangCombinedProps = {
        studentBill: studentBillsEntity,
        daftarUlangBill: daftarUlangEntity,
      };
      return daftarUlangCombinedProps;
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
  
  async updateStudentBillsWALAWE(studentBillsData: StudentBillsEntity<StudentBillsProps>, id: string): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["student_bills"].update(
          {
            ...(studentBillsData as any),
          },
          { where: { id }, transaction: t },
        );
      }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
  async getBillsByTagihanId(tagihanId: AggregateId): Promise<StudentBillsProps[]> {
    try {
      const studentBills = await this.dbConn.models["student_bills"].findAll(
        {
          where: { id_tagihan: tagihanId },
        },
      );
      return studentBills.map((studentBill: any) => {
        return studentBill as StudentBillsProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteStudentBillsByDaftarUlangId(daftarUlangId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].destroy({ 
        where: { id_tagihan: daftarUlangId },
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStudentBills(id: AggregateId, updatedData: Partial<StudentBillsProps>): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].update(
        { ...updatedData },
        { where: { id } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStudentBillsById(id: AggregateId, updatedData: Partial<StudentBillsProps>): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].update(
        { ...updatedData },
        { where: { id } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async setStudentsBillDiscountToNull(discountId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].update(
        { id_discount: null },
        { where: { id_discount: discountId } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async setStudentBillIDTagihansToNull(sppId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].update(
        { id_tagihan: null, payment_status: "LUNAS", remaining_amount: 0 },
        { where: { id_tagihan: sppId } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async setDaftarUlangBillIDTagihanToNull(daftarUlangId: AggregateId): Promise<void> {
    try {
      await this.dbConn.models["student_bills"].update(
        { id_tagihan: null, payment_status: "LUNAS", remaining_amount: 0 },
        { where: { id_tagihan: daftarUlangId } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStudentBillTotalAmount(id: AggregateId, totalAmount: number): Promise<void> {
    try {
      // get discount implemented in every student bills
      const studentBills = await this.dbConn.models["student_bills"].findAll({
        where: { id_tagihan: id },
      });

      // update the total remaining amount in every student bills with discount
      studentBills.forEach(async (studentBill: any) => {
        const discountImpl = await this.dbConn.models["discount"].findOne({
          where: { id: studentBill.id_discount },
        });

        if (discountImpl) {
          const discount = discountImpl as any;
          const discountAmount = discount.persentase;
          const newRemainingAmount = (totalAmount - (totalAmount * discountAmount / 100)) - studentBill.total_paid;
          const payment_status = newRemainingAmount === 0 ? "LUNAS" : "BELUM LUNAS";
          await this.dbConn.models["student_bills"].update(
            {
              remaining_amount: newRemainingAmount,
              payment_status: payment_status,
            },
            { where: { id: studentBill.id } }
          );
        } else {
          const newRemainingAmount = totalAmount - studentBill.total_paid;
          const payment_status = newRemainingAmount === 0 ? "LUNAS" : "BELUM LUNAS";
          await this.dbConn.models["student_bills"].update(
            {
              remaining_amount: newRemainingAmount,
              payment_status: payment_status,
            },
            { where: { id: studentBill.id } }
          );
        }
      });
      
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStatusStudentBill(id: AggregateId, status: boolean): Promise<void> {
    try {

      const payment_status = status === true ? "LUNAS" : "BELUM LUNAS";

      await this.dbConn.models["student_bills"].update(
        { payment_status: payment_status },
        { where: { id } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStatusDaftarUlangStudentBill(id: AggregateId, status: boolean): Promise<void> {
    try {

      const payment_status = status === true ? "LUNAS" : "BELUM LUNAS";

      await this.dbConn.models["student_bills"].update(
        { payment_status: payment_status },
        { where: { id } }
      );
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}

  

