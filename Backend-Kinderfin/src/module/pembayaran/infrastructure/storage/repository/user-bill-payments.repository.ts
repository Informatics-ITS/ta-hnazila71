import { QueryTypes, Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { UserBillPaymentsEntity, UserBillPaymentsProps } from "../../../domain/entity";
import { IUserBillPaymentsRepository } from "../../../domain/repository";



type DetailUserBillPaymentProps = {
  id_user_bill_payment: string;
  id_orang_tua: string;
  id_student_bill: string;
  id_payment_proof: string;
  status: string;
  amount_paid: number;
  component_paid: string;
  url_bukti_pembayaran: string;
  payment_date: string;
  nama_tagihan: string;
  nama_siswa: string;
  orang_tua: string;
  catatan: string;
};

export class UserBillPaymentsRepository implements IUserBillPaymentsRepository {
  constructor(private readonly dbConn: Sequelize) { }

  async addUserBillPayments(userBillPaymentsData: UserBillPaymentsEntity<UserBillPaymentsProps>): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["user_bill_payments"].create(
          {
            ...(userBillPaymentsData as any),
          },
          { transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getHistoryPayment(parentId: AggregateId): Promise<DetailUserBillPaymentProps[]> {
    try {
      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        spp.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill::UUID = sb.id
        LEFT JOIN spp spp ON sb.id_tagihan::UUID = spp.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        WHERE s.id_orang_tua = '${parentId}'
        AND ubp.component_paid = 'SPP'
        ORDER BY ubp.payment_date DESC`,
        { type: QueryTypes.SELECT },
      );
      return userBillPayments.map((userBillPayment: any) => {
        return userBillPayment as DetailUserBillPaymentProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDaftarUlangHistoryPaymentByParents(parentId: AggregateId): Promise<DetailUserBillPaymentProps[]> {
    try {
      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        daftar_ulang.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill::UUID = sb.id
        LEFT JOIN daftar_ulang daftar_ulang ON sb.id_tagihan::UUID = daftar_ulang.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        WHERE s.id_orang_tua = '${parentId}'
        AND ubp.component_paid = 'DAFTAR ULANG'
        ORDER BY ubp.payment_date DESC`,
        { type: QueryTypes.SELECT },
      );
      return userBillPayments.map((userBillPayment: any) => {
        return userBillPayment as DetailUserBillPaymentProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDaftarUlangHistoryPayment(): Promise<DetailUserBillPaymentProps[]> {
    try {
      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        daftar_ulang.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill::UUID = sb.id
        LEFT JOIN daftar_ulang daftar_ulang ON sb.id_tagihan::UUID = daftar_ulang.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        WHERE ubp.component_paid = 'DAFTAR ULANG'
        ORDER BY ubp.payment_date DESC`,
        { type: QueryTypes.SELECT },
      );
      return userBillPayments.map((userBillPayment: any) => {
        return userBillPayment as DetailUserBillPaymentProps;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }  

  async getAllHistoryPayments(): Promise<DetailUserBillPaymentProps[]> {
    try {
      // const userBillPayments = await this.dbConn.models["user_bill_payments"].findAll();
      // return userBillPayments.map((userBillPayments: any) => userBillPayments as UserBillPaymentsProps);

      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        spp.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill = sb.id
        LEFT JOIN spp spp ON sb.id_tagihan::UUID = spp.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        ORDER BY ubp.payment_date DESC`,
        { type: QueryTypes.SELECT },
      );

      console.log("userBillPayments", userBillPayments);

      return userBillPayments.map((userBillPayment: any) => {
        return userBillPayment as DetailUserBillPaymentProps;
      });

    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getPaymentById(id: AggregateId): Promise<DetailUserBillPaymentProps> {
    try {
      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        spp.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill = sb.id
        LEFT JOIN spp spp ON sb.id_tagihan::UUID = spp.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        WHERE ubp.id = '${id}'
        ORDER BY ubp.payment_date DESC
        `,
        { type: QueryTypes.SELECT },
      );

      return userBillPayments[0] as DetailUserBillPaymentProps;

    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getDaftarUlangPaymentById(id: AggregateId): Promise<DetailUserBillPaymentProps> {
    try {
      const userBillPayments = await this.dbConn.query(
        `SELECT ubp.id as id_user_bill_payment, ubp.status, ubp.amount_paid, ubp.component_paid, ubp.url_bukti_pembayaran, ubp.payment_date, ubp.id_student_bill, ubp.id_payment_proof, 
        daftar_ulang.nama as nama_tagihan, s.nama_lengkap as nama_siswa, u.id as id_orang_tua, p.ayah as orang_tua, ubp.catatan as catatan
        FROM user_bill_payments ubp
        LEFT JOIN student_bills sb ON ubp.id_student_bill = sb.id
        LEFT JOIN daftar_ulang daftar_ulang ON sb.id_tagihan::UUID = daftar_ulang.id
        JOIN students s ON sb.id_student::UUID = s.id
        JOIN users u ON s.id_orang_tua::UUID = u.id
        JOIN parents p ON u.id_informasi_tambahan::UUID = p.id
        WHERE ubp.id = '${id}'
        ORDER BY ubp.payment_date DESC
        `,
        { type: QueryTypes.SELECT },
      );

      return userBillPayments[0] as DetailUserBillPaymentProps;

    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStatusPayment(id: AggregateId, status: string, catatan:string): Promise<void> {
    try {
      // update student bill payment
      const userBillPayment = await this.getPaymentById(id);
      if (!userBillPayment) {
        throw new ApplicationError(404, "Pembayaran tidak ditemukan");
      }

      if (userBillPayment.status === "APPROVED") {
        throw new ApplicationError(400, "Pembayaran sudah disetujui");
      }

      if (userBillPayment.status === "REJECTED") {
        throw new ApplicationError(400, "Pembayaran sudah ditolak");
      }

      if (status == userBillPayment.status) {
        throw new ApplicationError(400, "Status tidak boleh sama");
      }

      const studentBill = await this.dbConn.models["student_bills"].findOne({
        where: { id: userBillPayment.id_student_bill },
      }) as any;

      console.log("[STUDENT BILL]", studentBill.total_amount);

      if (!studentBill) {
        throw new ApplicationError(404, "Tagihan tidak ditemukan");
      }

      if (studentBill.payment_status === "LUNAS") {
        throw new ApplicationError(400, "Tagihan sudah lunas");
      }

      if (studentBill.due_date < new Date()) {
        throw new ApplicationError(400, "Tagihan sudah lewat tanggal jatuh tempo");
      }

      if (studentBill.remaining_amount < userBillPayment.amount_paid) {
        throw new ApplicationError(400, "Jumlah pembayaran tidak boleh melebihi sisa tagihan");
      }

      if (status === "APPROVED" ) {
        const totalPaid = studentBill.total_paid + userBillPayment.amount_paid;
        const remainingAmount = studentBill.remaining_amount - userBillPayment.amount_paid;
  
        const paymentStatus = remainingAmount === 0 ? "LUNAS" : "BELUM LUNAS";
  
        await this.dbConn.transaction(async (t) => {
          await this.dbConn.models["student_bills"].update(
            {
              total_paid: totalPaid,
              remaining_amount: remainingAmount,
              payment_status: paymentStatus,
            },
            { where: { id: userBillPayment.id_student_bill }, transaction: t },
          );
        });
      }
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["user_bill_payments"].update(
          { status, catatan },
          { where: { id: id }, transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async updateStatusDaftarUlangPayment(id: AggregateId, status: string, catatan:string): Promise<void> {
    try {
      const userBillPayment = await this.getDaftarUlangPaymentById(id);
      if (!userBillPayment) {
        throw new ApplicationError(404, "Pembayaran tidak ditemukan");
      }

      if (userBillPayment.status === "APPROVED") {
        throw new ApplicationError(400, "Pembayaran sudah disetujui");
      }

      if (userBillPayment.status === "REJECTED") {
        throw new ApplicationError(400, "Pembayaran sudah ditolak");
      }

      if (status == userBillPayment.status) {
        throw new ApplicationError(400, "Status tidak boleh sama");
      }

      const studentBill = await this.dbConn.models["student_bills"].findOne({
        where: { id: userBillPayment.id_student_bill },
      }) as any;

      console.log("[STUDENT BILL]", studentBill.total_amount);

      if (!studentBill) {
        throw new ApplicationError(404, "Tagihan tidak ditemukan");
      }

      if (studentBill.payment_status === "LUNAS") {
        throw new ApplicationError(400, "Tagihan sudah lunas");
      }

      if (studentBill.due_date < new Date()) {
        throw new ApplicationError(400, "Tagihan sudah lewat tanggal jatuh tempo");
      }

      if (studentBill.remaining_amount < userBillPayment.amount_paid) {
        throw new ApplicationError(400, "Jumlah pembayaran tidak boleh melebihi sisa tagihan");
      }

      if (status === "APPROVED" ) {
        const totalPaid = studentBill.total_paid + userBillPayment.amount_paid;
        const remainingAmount = studentBill.remaining_amount - userBillPayment.amount_paid;
  
        const paymentStatus = remainingAmount === 0 ? "LUNAS" : "BELUM LUNAS";
  
        await this.dbConn.transaction(async (t) => {
          await this.dbConn.models["student_bills"].update(
            {
              total_paid: totalPaid,
              remaining_amount: remainingAmount,
              payment_status: paymentStatus,
            },
            { where: { id: userBillPayment.id_student_bill }, transaction: t },
          );
        });
      }
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["user_bill_payments"].update(
          { status, catatan },
          { where: { id: id }, transaction: t },
        );
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteAllHistoryPayments(): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["user_bill_payments"].destroy({ where: {}, transaction: t });
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async deleteHistoryPaymentById(id: AggregateId): Promise<void> {
    try {
      await this.dbConn.transaction(async (t) => {
        await this.dbConn.models["user_bill_payments"].destroy({ where: { id }, transaction: t });
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}