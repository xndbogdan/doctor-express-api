import { Request, RequestHandler, Response } from "express";
import { createPatientValidator } from "@/validators/patient";
import { errors } from "@vinejs/vine";
import prisma from "@/lib/prisma";
import findPatientById from "@/actions/patients/findPatientById";

class PatientsController {
  public index: RequestHandler = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const patients = await prisma.patient.findMany();

      res.status(200).json({
        data: patients,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({
        message: "An error occurred while fetching patients",
      });
    }
  };

  public show: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { patientId } = req.params;
      const patientResult = await findPatientById(patientId, {
        bookings: {
          include: {
            slot: true,
          },
        },
      });

      if (!patientResult.success) {
        res.status(patientResult.error!.status).json({
          message: patientResult.error!.message,
        });
        return;
      }

      res.status(200).json({
        data: patientResult.data,
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({
        message: "An error occurred while fetching the patient",
      });
    }
  };

  public store: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const data = await createPatientValidator.validate(req.body);
      const patient = await prisma.patient.create({ data });

      res.status(201).json({
        message: "Patient created successfully",
        data: patient,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        res.status(400).json({ errors: error.messages });
        return;
      }

      console.error("Error creating patient:", error);
      res.status(500).json({
        message: "An error occurred while creating the patient",
      });
    }
  };

  public update: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { patientId } = req.params;
      const patientResult = await findPatientById(patientId);

      if (!patientResult.success) {
        res.status(patientResult.error!.status).json({
          message: patientResult.error!.message,
        });
        return;
      }

      const data = await createPatientValidator.validate(req.body);

      const patient = await prisma.patient.update({
        where: { id: parseInt(patientId) },
        data,
      });

      res.status(200).json({
        message: "Patient updated successfully",
        data: patient,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        res.status(400).json({ errors: error.messages });
        return;
      }

      console.error("Error updating patient:", error);
      res.status(500).json({
        message: "An error occurred while updating the patient",
      });
    }
  };

  public destroy: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { patientId } = req.params;

      const patientResult = await findPatientById(patientId, {
        bookings: true,
      });

      if (!patientResult.success) {
        res.status(patientResult.error!.status).json({
          message: patientResult.error!.message,
        });
        return;
      }

      const patient = patientResult.data;

      // Check if patient has bookings
      if (patient.bookings.length > 0) {
        res.status(400).json({
          message: "Cannot delete patient with existing bookings",
        });
        return;
      }

      // Delete patient
      await prisma.patient.delete({
        where: { id: parseInt(patientId) },
      });

      res.status(200).json({
        message: "Patient deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({
        message: "An error occurred while deleting the patient",
      });
    }
  };
}

export default new PatientsController();