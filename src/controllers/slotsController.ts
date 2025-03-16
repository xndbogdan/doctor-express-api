import { Request, RequestHandler, Response } from "express";
import {
  findDoctorById,
} from "@/actions/doctors";
import { DateTime } from "luxon";
import prisma from "@/lib/prisma";
import { errors } from "@vinejs/vine";
import { createSlotValidator } from "@/validators/slot";
import isCreateSlotsRequestValid from "@/actions/slots/isCreateSlotsRequestValid";

interface RecurrencePattern {
  type: "daily" | "weekly" | "one-time";
  end_date?: string;
  week_days?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

class SlotsController {
  public createSlots: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { doctorId } = req.params;

      // Use findDoctorById action
      const doctorResult = await findDoctorById(doctorId);
      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      const data = await createSlotValidator.validate(req.body);

      // Validate the request data
      const validationResult = isCreateSlotsRequestValid(data);
      if (!validationResult.isValid && validationResult.response) {
        res.status(validationResult.response.status).json({
          message: validationResult.response.message,
        });
        return;
      }

      const { start_time, end_time, duration, recurrence } = data;
      // Convert string times to Luxon DateTime objects for use in the rest of the function
      const startTime = DateTime.fromISO(start_time);
      const endTime = DateTime.fromISO(end_time);
      const recurrenceEndDate = recurrence.end_date
        ? DateTime.fromISO(recurrence.end_date)
        : null;

      // Create the recurring pattern
      const pattern = await prisma.recurringPattern.create({
        data: {
          doctorId: parseInt(doctorId),
          start_time: startTime.toJSDate(),
          end_time: endTime.toJSDate(),
          duration,
          type: recurrence.type,
          week_days: recurrence.week_days || [],
          start_date: startTime.toJSDate(),
          end_date: recurrenceEndDate ? recurrenceEndDate.toJSDate() : null,
          // TODO: Let doctors disable slot patterns
          is_active: true,
        },
      });

      // Return information about the created pattern in snake_case format for API response
      res.status(201).json({
        message: "Recurring pattern created successfully",
        data: {
          id: pattern.id,
          doctor_id: pattern.doctorId,
          start_time: pattern.start_time,
          end_time: pattern.end_time,
          duration: pattern.duration,
          type: pattern.type,
          week_days: pattern.week_days,
          start_date: pattern.start_date,
          end_date: pattern.end_date,
          is_active: pattern.is_active,
        },
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        res.status(400).json({ errors: error.messages });
        return;
      }

      console.error("Error creating slots:", error);
      res.status(500).json({
        message: "An error occurred while creating slots",
      });
    }
  };
}

export default new SlotsController();
