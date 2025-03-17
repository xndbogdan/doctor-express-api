import { Request, RequestHandler, Response } from "express";
import { createDoctorValidator } from "@/validators/doctor";
import { errors } from "@vinejs/vine";
import prisma from "@/lib/prisma";
import { findDoctorById } from "@/actions/doctors";
import validateDateParam from "@/actions/common";

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

  public getBookings: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { doctorId } = req.params;
      const { start_date, end_date } = req.query;
      const doctorResult = await findDoctorById(doctorId);

      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      if (!start_date || !end_date) {
        res.status(400).json({
          message: "start_date and end_date are required query parameters",
        });
        return;
      }

      const startDateResult = validateDateParam(
        start_date as string,
        "YYYY-MM-DDTHH:MM:SSZ"
      );

      if (!startDateResult.isValid) {
        res.status(400).json({
          message: startDateResult.message,
        });
        return;
      }

      const endDateResult = validateDateParam(
        end_date as string,
        "YYYY-MM-DDTHH:MM:SSZ"
      );

      if (!endDateResult.isValid) {
        res.status(400).json({
          message: endDateResult.message,
        });
        return;
      }

      const startDate = startDateResult.date!;
      const endDate = endDateResult.date!;

      if (startDate > endDate) {
        res.status(400).json({
          message: "start_date must be before end_date",
        });
        return;
      }

      // Get bookings directly using the doctor relation
      const bookings = await prisma.booking.findMany({
        where: {
          doctor: { id: parseInt(doctorId) },
          slot: {
            start_time: {
              gte: startDate.toJSDate(),
              lte: endDate.toJSDate(),
            },
          },
        },
        include: {
          patient: true,
          slot: true,
        },
        orderBy: {
          slot: {
            start_time: "asc",
          },
        },
      });

      res.status(200).json({
        data: bookings,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({
        message: "An error occurred while fetching bookings",
      });
    }
  };
}

export default new DoctorsController();