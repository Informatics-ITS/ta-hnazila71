import RekapBonusService from "../../domain/service/rekap_bonus.service";

export class GetRekapBonusByNipQuery {
  async execute(nip: string) { // Menerima nip
    return await RekapBonusService.getRekapByNip(nip);
  }
}

export default {
  GetRekapBonusByNipQuery: new GetRekapBonusByNipQuery()
};