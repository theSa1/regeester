import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import db from "@/lib/db";

export const getPublicForm = os
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const form = await db.form.findFirst({
      where: {
        id: input.id,
        isPublished: true,
        isActive: true,
      },
      include: {
        fields: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!form) {
      throw new ORPCError("NOT_FOUND");
    }

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
    };
  });
