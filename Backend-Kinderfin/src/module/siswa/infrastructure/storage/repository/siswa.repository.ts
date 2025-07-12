import { Sequelize } from "sequelize";
import { AggregateId, ApplicationError } from "../../../../../shared/abstract";
import { SiswaEntity, DokumenEntity, SiswaProps, DokumenProps } from "../../../domain/entity";
import { ISiswaRepository } from "../../../domain/repository/siswa.repository";
import { logger } from "../../../../../shared/util";

export class SiswaRepository implements ISiswaRepository {
  constructor(private readonly dbConn: Sequelize) { }
  
  async addSiswa(dokumenData: DokumenEntity<DokumenProps>, siswaData: SiswaEntity<SiswaProps>): Promise<void> {
    try {
      const response = await this.dbConn.transaction(async (t) => {
        const document = await this.dbConn.models["documents"].create(
          {
            ...dokumenData,
          }
          , { transaction: t });
        await this.dbConn.models["students"].create(
          {
            ...siswaData,
            id_dokumen: document.get("id"),
          }, { transaction: t });
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }

  async getAllStudents(event: any): Promise<SiswaProps[]> {
    try {
      logger.info("Get all students");
  
      // Query only the students table without any includes
      const students = await this.dbConn.models["students"].findAll();
  
      logger.info("Students result from database:",  JSON.stringify(students, null, 2));
  
      const studentsData = students.map((student: any) => {
        const studentData = student.get ? student.get() : student;
        return {
          ...studentData,
        };
      });
  
      logger.info("Mapped students data:",  JSON.stringify(students, null, 2));
      
      return studentsData;
    } catch (error) {
      const appErr = error as ApplicationError;
      logger.error(`Error in getAllStudents: ${appErr.message}`, error);
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
  
  async getAllSiswa(): Promise<SiswaEntity<SiswaProps>[]> {
    try {
      const siswas = await this.dbConn.models["students"].findAll({
        include: [
          {
            model: this.dbConn.models["documents"],
            as: "document",
          },
        ],
      });
      return siswas.map((siswa: any) => {
        return siswa as SiswaEntity<SiswaProps>;
      });
    } catch (error) {
      const appErr = error as ApplicationError;
      throw new ApplicationError(appErr.code, appErr.message);
    }
  }
}