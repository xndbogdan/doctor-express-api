import { DateTime } from "luxon";

interface DateValidationResult {
  isValid: boolean;
  date?: DateTime;
  message?: string;
}

/**
 * Validates a date string parameter
 * @param dateString The date string to validate
 * @param format Optional format description for error messages (e.g., "YYYY-MM-DD")
 * @returns An object with validation result, parsed date, and error message if invalid
 */
export const validateDateParam = (
  dateString: string | undefined,
  format: string = "YYYY-MM-DD"
): DateValidationResult => {
  if (!dateString) {
    return {
      isValid: false,
      message: "Date parameter is required",
    };
  }

  const date = DateTime.fromISO(dateString);
  if (!date.isValid) {
    return {
      isValid: false,
      message: `Invalid date: ${date.invalidExplanation}. Use ISO format (${format})`,
    };
  }

  return {
    isValid: true,
    date,
  };
};

export default validateDateParam;