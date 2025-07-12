import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { DokumenEntity, DokumenProps } from "../../../domain/entity";
import { IDokumenRepository } from "../../../domain/repository";
import { logger } from "../../../../../shared/util";

export class DokumenRepository implements IDokumenRepository {
  constructor(private readonly dbConn: Sequelize) { }

  async addDokumen(dokumenData: DokumenEntity<DokumenProps>): Promise<string> {
    try {
      // Log sebelum memulai transaksi
      // console.log("Memulai transaksi untuk menyimpan dokumen:", dokumenData);
    
      await this.dbConn.transaction(async (t) => {
        // console.log("Menyimpan dokumen dengan data:", dokumenData);
        await this.dbConn.models["dokumen"].create(
          {
            ...(dokumenData as any),
          },
          { transaction: t },
        );
        // console.log("Dokumen berhasil disimpan dengan ID:", dokumenData);
      });
      // console.log("Dokumen berhasil disimpan dengan ID:", dokumenData.getId());
      return dokumenData.getId();
    } catch (error) {
      // Log jika terjadi kesalahan
      console.error("Terjadi kesalahan saat menyimpan dokumen:", error);
      throw error; // Lempar ulang error jika perlu
    }
  }
  
    async saveDokumen(ppdbId: string, urlAkta: string, urlKK: string): Promise<void> {
      try {
          // console.log("Saving documents with the following data:");
          // console.log("PPDB ID di save dokumen:", ppdbId);
          // console.log("URL Akta di save dokumen:", urlAkta);
          // console.log("URL KK di save dokumen:", urlKK);
          
          await this.dbConn.models["documents"].create({
              ppdb_id: ppdbId,
              url_akta_kelahiran: urlAkta,
              url_kartu_keluarga: urlKK, 
          });
      } catch (error) {
          const appErr = error as ApplicationError;
          console.error("Error while saving documents:", appErr);
          throw new ApplicationError(appErr.code, appErr.message);
      }
    }

  async getAllDokumen(event: any): Promise<DokumenProps[]> {
    try {
      const dokumen = await this.dbConn.models["dokumen"].findAll({
        where: event,
      });

      return dokumen.map((dokumen) => dokumen.get({ plain
        : true
      }));
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async findDokumenByPPDBId(ppdbId: string): Promise<any | null> {
    try {
        const dokumen = await this.dbConn.models["documents"].findOne({
            where: { ppdb_id: ppdbId }
        });
        return dokumen; // Jika dokumen ditemukan, dikembalikan, jika tidak null
    } catch (error) {
        const appErr = error as ApplicationError;
        console.error("Error while finding document:", appErr);
        throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async destroyDokumenByPPDBId(ppdbId: string): Promise<void> {
    try {
        const deletedCount = await this.dbConn.models["documents"].destroy({
            where: { ppdb_id: ppdbId }
        });
        if (deletedCount === 0) {
            console.warn(`No document found with ppdb_id: ${ppdbId}`);
        } else {
            // console.log(`Document with ppdb_id: ${ppdbId} deleted successfully.`);
        }
    } catch (error) {
        const appErr = error as ApplicationError;
        console.error("Error while deleting document:", appErr);
        throw new ApplicationError(appErr.code, appErr.message);
    }
}

}