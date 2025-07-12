import { StatusCodes } from "http-status-codes";
import {
  AggregateId,
  AggregateRoot,
  ApplicationError,
} from "../../../../shared/abstract";

export interface DaftarUlangProps {
  id?: AggregateId;
  nama: string;
  biaya_perlengkapan: number;
  biaya_kegiatan: number;
  total_amount: number;
  semester: string;
  tahun_ajaran: string;
  due_date: Date;
}

export class DaftarUlangEntity<
  TProps extends DaftarUlangProps
  > extends AggregateRoot {
  
  private nama: string;
  private biaya_perlengkapan: number;
  private biaya_kegiatan: number;
  private total_amount: number;
  private semester: string;
  private tahun_ajaran: string;
  private due_date: Date;

  constructor(props: TProps) {
    super(props.id);
    ({
      nama: this.nama,
      biaya_perlengkapan: this.biaya_perlengkapan,
      biaya_kegiatan: this.biaya_kegiatan,
      total_amount: this.total_amount,
      semester: this.semester,
      tahun_ajaran: this.tahun_ajaran,
      due_date: this.due_date,
    } = props)
  }

  getId(): string {
    return this.id;
  }

  getBiayaPerlengkapan(): number { 
    return this.biaya_perlengkapan; 
  }

  getBiayaKegiatan(): number { 
    return this.biaya_kegiatan; 
  }

  getDueDate(): Date {
    return this.due_date;
  }

  getNama(): string { 
    return this.nama; 
  }

  getTotalAmount(): number {
    return this.total_amount;
  }

  getSemester(): string {
    return this.semester;
  }

  getTahunAjaran(): string {
    return this.tahun_ajaran;
  }
}