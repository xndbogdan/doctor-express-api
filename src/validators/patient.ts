import vine from "@vinejs/vine";
import { uniqueRule } from "@/validators/rules/unique.js";

export const createPatientValidator = vine.compile(
  vine.object({
    first_name: vine.string(),
    last_name: vine.string(),
    email: vine
      .string()
      .email()
      .use(
        uniqueRule({
          model: "Patient",
          column: "email",
        })
      ),
    phone: vine.string().optional(),
  })
);
