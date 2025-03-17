import { Request, RequestHandler, Response } from "express";
import {
  findDoctorById,
} from "@/actions/doctors";
import { DateTime } from "luxon";
import prisma from "@/lib/prisma";
import { errors } from "@vinejs/vine";
import { createSlotValidator } from "@/validators/slot";
import isCreateSlotsRequestValid from "@/actions/slots/isCreateSlotsRequestValid";
import validateDateParam from "@/actions/common";

import {
  availableSlotsCache,
} from "@/services/cacheService";
import generateSlotsFromPattern from "@/actions/slots/generateSlotsFromPattern";
import { createBookingValidator } from "@/validators/booking";
import bookVirtualSlot from "@/actions/slots/bookVirtualSlot";
import bookRealSlot from "@/actions/slots/bookRealSlot";

interface RecurrencePattern {
  type: "daily" | "weekly" | "one-time";
  end_date?: string;
  week_days?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

interface availableSlot {
  start_time: Date;
  end_time: Date;
}

class SlotsController {
  public index: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const doctorResult = await findDoctorById(doctorId);

      if (!doctorResult.success) {
        res.status(doctorResult.error!.status).json({
          message: doctorResult.error!.message,
        });
        return;
      }

      const { date } = req.query;
      const dateResult = validateDateParam(date as string);

      if (!dateResult.isValid) {
        res.status(400).json({
          message: dateResult.message,
        });
        return;
      }

      const queryDate = dateResult.date!;
      const dateString = queryDate.toFormat("yyyy-MM-dd");

      // Try to get slots from cache first
      const cachedSlots = await availableSlotsCache.get(
        doctorId,
        dateString
      );

      if (cachedSlots) {
        // Return cached slots
        res.status(200).json({
          data: cachedSlots,
          source: "cache",
        });
        return;
      }

      // If not in cache, generate slots
      // Create start of day and start of next day
      const startOfDay = queryDate.startOf("day");
      const startOfNextDay = startOfDay.plus({ days: 1 });

      // 1. Get all active recurring patterns for this doctor
      const patterns = await prisma.recurringPattern.findMany({
        where: {
          doctorId: doctorId,
          is_active: true,
          // Only get patterns that apply to this date
          OR: [
            // One-time patterns on this exact date
            {
              type: "one-time",
              start_date: {
                gte: startOfDay.toJSDate(),
                lt: startOfNextDay.toJSDate(),
              },
            },
            // Daily patterns that start before or on this date and end after or on this date (or have no end date)
            {
              type: "daily",
              start_date: { lte: startOfDay.toJSDate() },
              OR: [
                { end_date: { gte: startOfDay.toJSDate() } },
                { end_date: null },
              ],
            },
            // Weekly patterns that start before or on this date, end after or on this date (or have no end date),
            // and include this day of the week
            {
              type: "weekly",
              start_date: { lte: startOfDay.toJSDate() },
              OR: [
                { end_date: { gte: startOfDay.toJSDate() } },
                { end_date: null },
              ],
              // We'll filter for the correct weekday after fetching
            },
          ],
        },
      });

       // Get all booked slots for this date range
      const bookedSlots = await prisma.slot.findMany({
        where: {
          doctorId: doctorId,
          status: "booked",
          start_time: {
            gte: startOfDay.toJSDate(),
            lt: startOfNextDay.toJSDate(),
          },
        },
        select: {
          start_time: true,
          end_time: true,
        },
      });

      // Convert booked slots to a Map for easy lookup
      const bookedSlotMap = new Map();
      bookedSlots.forEach((slot) => {
        const startTimeIso = DateTime.fromJSDate(slot.start_time).toISO();
        if (startTimeIso) {
          bookedSlotMap.set(startTimeIso, true);
        }
      });

      const dayOfWeek = startOfDay.weekday - 1;
      let availableSlots: availableSlot[] = [];

      for (const pattern of patterns) {
        const slots = generateSlotsFromPattern({
          pattern,
          startOfDay,
          bookedSlotMap,
          dayOfWeek,
        });

        availableSlots = [...availableSlots, ...slots];
      }

      // Sort available slots by start time
      availableSlots.sort((a, b) => {
        return a.start_time.getTime() - b.start_time.getTime();
      });

      // Cache the available slots
      await availableSlotsCache.set(doctorId, dateString, availableSlots);

      res.status(200).json({
        data: availableSlots,
        source: "generated",
      });
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({
        message: "An error occurred while fetching available slots",
      });
    }
  };

  public store: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const doctorId = parseInt(req.params.doctorId);
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
          doctorId: doctorId,
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

      // Invalidate all caches for this doctor
      await availableSlotsCache.invalidateAll(doctorId);

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

  public bookSlot: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { slotId } = req.params;
      const data = await createBookingValidator.validate(req.body);

      let result;
      // Check if this is a virtual slot ID (pattern-based)
      if (slotId.includes("-")) {
        result = await bookVirtualSlot(slotId, data);
      } else {
        result = await bookRealSlot(parseInt(slotId), data);
      }

      if (!result.success && result.error) {
        res.status(result.error.status).json({
          message: result.error.message,
        });
        return;
      }

      res.status(200).json({
        message: "Slot booked successfully",
        data: result.data,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        res.status(400).json({ errors: error.messages });
        return;
      }

      console.error("Error booking slot:", error);
      res.status(500).json({
        message: "An error occurred while booking the slot",
      });
    }
  };
}

export default new SlotsController();
