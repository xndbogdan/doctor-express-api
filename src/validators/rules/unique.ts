import { Prisma, PrismaClient } from "@prisma/client";
import vine from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/build/src/types";

type PrismaModels = Prisma.ModelName;

type Options = {
  model: PrismaModels;
  column: string;
};

async function unique(value: unknown, options: Options, field: FieldContext) {
  const prisma = new PrismaClient();

  if (typeof value !== "string") {
    return;
  }

  try {
    const model = options.model.toLowerCase();
    const where = { [options.column]: value };

    // @ts-ignore - Dynamic model access needs to be ignored
    const row = await prisma[model].findFirst({ where });

    if (row) {
      field.report(`The ${field.name} field must be unique`, "unique", field);
    }
  } finally {
    await prisma.$disconnect();
  }
}

export const uniqueRule = vine.createRule(unique);
