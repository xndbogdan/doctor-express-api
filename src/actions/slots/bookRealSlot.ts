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
 * Books a real slot from the database
 * @param slotId The real slot ID from the database
 * @param bookingData The booking data (patientId, reason)
 * @returns A result object with booking data or error information
 */
export const bookRealSlot = async (
  slotId: number,
  bookingData: BookingData
): Promise<BookingResult> => {
  const { patientId, reason } = bookingData;

  try {
    // Check if slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return {
        success: false,
        error: {
          status: 404,
          message: "Slot not found",
        },
      };
    }

    if (slot.status !== "available") {
      return {
        success: false,
        error: {
          status: 400,
          message: "Slot is not available",
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

    // Create booking and update slot in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Update slot status
      const updatedSlot = await tx.slot.update({
        where: { id: slotId },
        data: { status: "booked" },
      });

      // Create booking record with doctorId
      const newBooking = await tx.booking.create({
        data: {
          slot: { connect: { id: slotId } },
          patient: { connect: { id: patientId } },
          doctor: { connect: { id: slot.doctorId } },
          reason: reason || "",
        },
      });

      return newBooking;
    });

    // Invalidate caches for this day
    const dateString = getDateString(slot.start_time);
    await availableSlotsCache.invalidate(slot.doctorId, dateString);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error booking real slot:", error);
    return {
      success: false,
      error: {
        status: 500,
        message: "An error occurred while booking the slot",
      },
    };
  }
};

export default bookRealSlot;
