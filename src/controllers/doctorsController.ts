import { Request, RequestHandler, Response } from "express";
import { createDoctorValidator } from "@/validators/doctor";
import { errors } from "@vinejs/vine";
import prisma from "@/lib/prisma";

class DoctorsController {
  public index: RequestHandler = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctors = await prisma.doctor.findMany();
      res.status(200).json({
        data: doctors,
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({
        message: "An error occurred while fetching doctors",
      });
    }
  };

  public store: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = await createDoctorValidator.validate(req.body);
      const doctor = await prisma.doctor.create({ data });

      res.status(201).json({
        message: "Doctor created successfully",
        data: doctor,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        res.status(400).json({ errors: error.messages });
        return;
      }

      console.error("Error creating doctor:", error);
      res.status(500).json({
        message: "An error occurred while creating the doctor",
      });
    }
  };
}

export default new DoctorsController();