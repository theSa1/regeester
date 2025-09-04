import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";

export const getFormResponses = os
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

    // First verify the user owns this form
    const form = await db.form.findFirst({
      where: {
        id: input.id,
        createdBy: context.user.id,
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

    // Get all submissions for this form
    const submissions = await db.formSubmission.findMany({
      where: {
        formId: input.id,
      },
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        responses: {
          include: {
            field: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return {
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields,
      },
      submissions,
    };
  });
