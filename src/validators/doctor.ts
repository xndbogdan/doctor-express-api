import vine from "@vinejs/vine";
import { uniqueRule } from "@/validators/rules/unique.js";

export const createDoctorValidator = vine.compile(
  vine.object({
    username: vine.string().use(
      uniqueRule({
        model: "Doctor",
        column: "username",
      })
    ),
    first_name: vine.string(),
    last_name: vine.string(),
    email: vine
      .string()
      .email()
      .use(
        uniqueRule({
          model: "Doctor",
          column: "email",
        })
      ),
  })
);
