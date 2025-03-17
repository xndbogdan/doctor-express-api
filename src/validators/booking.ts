import vine from "@vinejs/vine";

export const createBookingValidator = vine.compile(
  vine.object({
    patientId: vine.number(),
    reason: vine.string().optional(),
  })
);
