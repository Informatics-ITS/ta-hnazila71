import { PotonganRepository } from "../../domain/repository/potongan.repository";

export class PotonganQuery {
  constructor(private potonganRepo: PotonganRepository) {}

  async getAll() {
    return await this.potonganRepo.findAll();
  }

  async getByJabatan(jabatan: string) {
    return await this.potonganRepo.findByJabatan(jabatan);
  }
}
