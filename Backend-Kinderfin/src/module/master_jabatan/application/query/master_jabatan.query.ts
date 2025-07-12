import MasterJabatanService from "../../domain/service/master_jabatan.service";
import { PostgresDatabase } from "../../../../config/database.config";
const db = new PostgresDatabase().dbConn;


export class GetAllMasterJabatanQuery {
  async execute() {
    return await MasterJabatanService.getAllJabatan();
  }
}

export class GetMasterJabatanByJabatanQuery {
  async execute(jabatan: string) {
    return await MasterJabatanService.getJabatanByJabatan(jabatan);
  }
}


export default {
  GetAllMasterJabatanQuery: new GetAllMasterJabatanQuery(),
  GetMasterJabatanByJabatanQuery: new GetMasterJabatanByJabatanQuery(),
};
