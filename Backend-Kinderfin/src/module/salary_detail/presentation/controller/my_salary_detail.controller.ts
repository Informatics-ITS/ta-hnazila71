import { Request, Response } from "express";
import SalaryDetailRepository from "../../infrastructure/repository/salary_detail.repository";

class MySalaryDetailController {
  static async getMySalaryDetail(req: Request, res: Response) {
    try {
      const teacherId = res.locals.id_informasi_tambahan; 
      console.log('Teacher ID:', teacherId);  
      if (!teacherId) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized: Teacher ID is missing in the request"
        });
      }

      const salaryDetails = await SalaryDetailRepository.getAllSalaryByTeacherIdentifier(teacherId, false);

      if (!salaryDetails || salaryDetails.length === 0) {
        return res.status(404).json({
          status: "failed",
          message: "No salary details found for the teacher."
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Salary details retrieved successfully",
        data: salaryDetails
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error: Something went wrong"
      });
    }
  }
}

export default MySalaryDetailController;
