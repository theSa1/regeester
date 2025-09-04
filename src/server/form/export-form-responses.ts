import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";

export const exportFormResponses = os
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
            name: true,
            email: true,
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

    // Create CSV headers
    const headers = [
      "Response ID",
      "Submitted At",
      "Submitter",
      ...form.fields.map((field) => field.label),
    ];

    // Create CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...submissions.map((submission) => {
        const row = [
          submission.id,
          submission.submittedAt.toISOString(),
          submission.submitter?.name || "Anonymous",
          ...form.fields.map((field) => {
            const response = submission.responses.find(
              (r) => r.fieldId === field.id
            );
            // Escape commas and quotes in CSV
            const value = response?.value || "";
            return `"${value.replace(/"/g, '""')}"`;
          }),
        ];
        return row.join(",");
      }),
    ];

    return {
      filename: `${form.title.replace(/[^a-zA-Z0-9]/g, "_")}_responses.csv`,
      content: csvRows.join("\n"),
      mimeType: "text/csv",
    };
  });
