import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";

export const getFormDetails = os
  .use(authMiddleware)
  .input(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const form = await db.form.findFirst({
      where: {
        id: input.id,
        createdBy: context.user.userId,
      },
      include: {
        fields: {
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      throw new ORPCError("NOT_FOUND");
    }

    return form;
  });
