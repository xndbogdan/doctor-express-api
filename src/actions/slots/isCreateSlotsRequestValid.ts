import { DateTime } from "luxon";

interface CreateSlotsData {
  start_time: string;
  end_time: string;
  duration: number;
  recurrence: {
    type: string;
    end_date?: string;
    week_days?: number[];
  };
}

interface ValidationResult {
  isValid: boolean;
  response?: {
    status: number;
    message: string;
  };
}

/**
 * Validates create slots request data
 * @param data The data from the request body
 * @param res The response object (used to set status codes if validation fails)
 * @returns An object indicating if the request is valid and error details if not
 */
export const isCreateSlotsRequestValid = (
  data: CreateSlotsData
): ValidationResult => {
  const { start_time, end_time, duration, recurrence } = data;

  // Convert string times to Luxon DateTime objects
  const startTime = DateTime.fromISO(start_time);
  const endTime = DateTime.fromISO(end_time);
  const recurrenceEndDate = recurrence.end_date
    ? DateTime.fromISO(recurrence.end_date)
    : null;

  // Validate DateTime parsing
  if (!startTime.isValid) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: `Invalid start time: ${startTime.invalidExplanation}`,
      },
    };
  }

  if (!endTime.isValid) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: `Invalid end time: ${endTime.invalidExplanation}`,
      },
    };
  }

  if (recurrenceEndDate && !recurrenceEndDate.isValid) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: `Invalid recurrence end date: ${recurrenceEndDate.invalidExplanation}`,
      },
    };
  }

  // Basic validation
  if (startTime >= endTime) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: "Start time must be before end time",
      },
    };
  }

  if (![15, 30].includes(duration)) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: "Duration must be either 15 or 30 minutes",
      },
    };
  }

  // If it's a weekly pattern, ensure week_days are provided
  if (
    recurrence.type === "weekly" &&
    (!recurrence.week_days || recurrence.week_days.length === 0)
  ) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: "Weekly recurrence requires specified week days",
      },
    };
  }

  // Validate recurrence type
  if (!["daily", "weekly", "one-time"].includes(recurrence.type)) {
    return {
      isValid: false,
      response: {
        status: 400,
        message: "Recurrence type must be 'daily', 'weekly', or 'one-time'",
      },
    };
  }

  return { isValid: true };
};

export default isCreateSlotsRequestValid;
