import { StatusCodes } from "http-status-codes";
import {
  AggregateId,
  AggregateRoot,
  ApplicationError,
} from "../../../../shared/abstract";

export interface SPPProps {
  id?: AggregateId;
  nama: string;
  biaya_spp: number;
  biaya_komite: number;
  biaya_ekstrakulikuler: number;
  total_amount: number;
  bulan: string;
  tahun_ajaran: string;
  due_date: Date;
}


export class SPPEntity<
  TProps extends SPPProps
  > extends AggregateRoot {

  private nama: string;
  private biaya_spp: number;
  private biaya_komite: number;
  private biaya_ekstrakulikuler: number;
  private total_amount: number;
  private bulan: string;
  private tahun_ajaran: string;
  private due_date: Date;

  constructor(props: TProps) {
    super(props.id);
    ({
      nama: this.nama,
      biaya_spp: this.biaya_spp,
      biaya_komite: this.biaya_komite,
      biaya_ekstrakulikuler: this.biaya_ekstrakulikuler,
      total_amount: this.total_amount,
      bulan: this.bulan,
      tahun_ajaran: this.tahun_ajaran,
      due_date: this.due_date
    } = props)
  }

  getId(): string {
    return this.id;
  }

  getNama(): string { 
    return this.nama; 
  }

  getBiayaSPP(): number { 
    return this.biaya_spp; 
  }

  getBiayaKomite(): number { 
    return this.biaya_komite; 
  }

  getBiayaEkstrakulikuler(): number { 
    return this.biaya_ekstrakulikuler; 
  }

  getTotalAmount(): number {
    return this.total_amount;
  }

  getBulan(): string {
    return this.bulan;
  }

  getTahunAjaran(): string { 
    return this.tahun_ajaran;
  }

  getDueDate(): Date { 
    return this.due_date; 
  }

  setNama(nama: string): void {
    this.nama = nama;
  }

  setBiayaSPP(biayaSPP: number): void {
    this.biaya_spp = biayaSPP;
  }

  setBiayaKomite(biayaKomite: number): void {
    this.biaya_komite = biayaKomite;
  }

  setBiayaEkstrakulikuler(biayaEkstrakulikuler: number): void {
    this.biaya_ekstrakulikuler = biayaEkstrakulikuler;
  }
  
  setTotalAmount(totalAmount: number): void {
    this.total_amount = totalAmount;
  }

  setDueDate(dueDate: Date): void {
    this.due_date = dueDate;
  }
}