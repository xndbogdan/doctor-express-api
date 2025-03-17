import { DateTime } from "luxon";
import prisma from "@/lib/prisma";
import {
  availableSlotsCache,
  getDateString,
} from "@/services/cacheService";

interface BookingData {
  patientId: number;
  reason?: string;
}

interface BookingResult {
  success: boolean;
  data?: any;
  error?: {
    status: number;
    message: string;
  };
}

/**
 * Books a virtual slot based on a pattern
 * @param slotId The virtual slot ID (pattern-id-timestamp)
 * @param bookingData The booking data (patientId, reason)
 * @returns A result object with booking data or error information
 */
export const bookVirtualSlot = async (
  slotId: string,
  bookingData: BookingData
): Promise<BookingResult> => {
  const { patientId, reason } = bookingData;

  try {
    // Parse the pattern ID and start time
    const [patternIdStr, startTimeIso] = slotId.split(/-(.*)/s)
    const patternId = parseInt(patternIdStr);

    // Validate the pattern ID
    const pattern = await prisma.recurringPattern.findUnique({
      where: { id: patternId },
    });

    if (!pattern) {
      return {
        success: false,
        error: {
          status: 404,
          message: "Pattern not found",
        },
      };
    }

    // Parse the start time
    const startTime = DateTime.fromISO(startTimeIso);
    if (!startTime.isValid) {
      return {
        success: false,
        error: {
          status: 400,
          message: "Invalid slot time format",
        },
      };
    }

    // Calculate end time based on pattern duration
    const endTime = startTime.plus({ minutes: pattern.duration });

    // Check if a slot with this start time already exists
    const existingSlot = await prisma.slot.findFirst({
      where: {
        doctorId: pattern.doctorId,
        start_time: startTime.toJSDate(),
        end_time: endTime.toJSDate(),
      },
    });

    if (existingSlot && existingSlot.status === "booked") {
      return {
        success: false,
        error: {
          status: 400,
          message: "Slot is already booked",
        },
      };
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return {
        success: false,
        error: {
          status: 404,
          message: "Patient not found",
        },
      };
    }

    // Create or update slot and booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create or get the slot
      let slot;
      if (existingSlot) {
        // Update existing slot
        slot = await tx.slot.update({
          where: { id: existingSlot.id },
          data: { status: "booked" },
        });
      } else {
        // Create new slot from pattern
        slot = await tx.slot.create({
          data: {
            doctorId: pattern.doctorId,
            patternId: pattern.id,
            start_time: startTime.toJSDate(),
            end_time: endTime.toJSDate(),
            status: "booked",
          },
        });
      }

      // Create booking record with doctorId
      const newBooking = await tx.booking.create({
        data: {
          slot: { connect: { id: slot.id } },
          patient: { connect: { id: patientId } },
          doctor: { connect: { id: pattern.doctorId } },
          reason: reason || "",
        },
      });

      return newBooking;
    });

    // Invalidate caches for this date
    const dateString = getDateString(startTime);
    await availableSlotsCache.invalidate(pattern.doctorId, dateString);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error booking virtual slot:", error);
    return {
      success: false,
      error: {
        status: 500,
        message: "An error occurred while booking the virtual slot",
      },
    };
  }
};

export default bookVirtualSlot;
