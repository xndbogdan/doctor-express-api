interface RecurrencePattern {
  type: "daily" | "weekly" | "one-time";
  end_date?: string;
  week_days?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

class SlotsController {

}