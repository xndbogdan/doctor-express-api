import { DateTime } from "luxon";

interface SlotGeneration {
  pattern: any; // RecurringPattern
  startOfDay: DateTime;
  bookedSlotMap: Map<string, boolean>;
  dayOfWeek: number;
}

/**
 * Generates available time slots from a recurring pattern
 * @param pattern The recurring pattern to generate slots from
 * @param startOfDay The start of the day as a DateTime object
 * @param bookedSlotMap A map of booked slots by ISO time string
 * @param dayOfWeek The day of week (1-7, where 1 is Monday and 7 is Sunday)
 * @returns Array of available slot objects
 */
export const generateSlotsFromPattern = ({
  pattern,
  startOfDay,
  bookedSlotMap,
  dayOfWeek,
}: SlotGeneration): any[] => {
  // Skip inactive patterns
  if (!pattern.is_active) {
    return [];
  }

  // Skip weekly patterns that don't apply to this day of the week
  if (pattern.type === "weekly" && !pattern.week_days.includes(dayOfWeek)) {
    return [];
  }

  const availableSlots = [];

  // Get pattern time components
  const patternStartTime = DateTime.fromJSDate(pattern.start_time);
  const patternEndTime = DateTime.fromJSDate(pattern.end_time);

  // Create slot at the correct time on this day by combining query date with pattern times
  const slotStartTime = startOfDay.set({
    hour: patternStartTime.hour,
    minute: patternStartTime.minute,
    second: 0,
    millisecond: 0,
  });

  const slotEndTime = startOfDay.set({
    hour: patternEndTime.hour,
    minute: patternEndTime.minute,
    second: 0,
    millisecond: 0,
  });

  // For each time slot in the day
  const slotDuration = pattern.duration * 60 * 1000; // convert to ms
  let currentSlotStart = slotStartTime;

  while (currentSlotStart < slotEndTime) {
    const currentSlotEnd = currentSlotStart.plus({
      milliseconds: slotDuration,
    });

    if (currentSlotEnd > slotEndTime) break;

    // Check if this slot is already booked
    const startTimeIso = currentSlotStart.toISO();
    if (startTimeIso && !bookedSlotMap.has(startTimeIso)) {
      // This slot is available - create a virtual slot object
      availableSlots.push({
        // No ID since this isn't from the database
        virtual_id: `${pattern.id}-${startTimeIso}`,
        doctor_id: pattern.doctorId,
        pattern_id: pattern.id,
        start_time: currentSlotStart.toJSDate(),
        end_time: currentSlotEnd.toJSDate(),
        status: "available",
      });
    }

    currentSlotStart = currentSlotEnd;
  }

  return availableSlots;
};

export default generateSlotsFromPattern;
