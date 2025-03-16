import vine from "@vinejs/vine";

export const createSlotValidator = vine.compile(
  vine.object({
    start_time: vine.string(),
    end_time: vine.string(),
    duration: vine.number(),
    recurrence: vine.object({
      type: vine.string(),
      end_date: vine.string().optional(),
      week_days: vine.array(vine.number()).optional(),
    }),
  })
);
