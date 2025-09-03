import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import db from "@/lib/db";

const submitFormSchema = z.object({
  formId: z.string(),
  responses: z.record(z.string(), z.string()), // fieldId -> response value
  submitterInfo: z
    .object({
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export const submitFormResponse = os
  .input(submitFormSchema)
  .handler(async ({ input }) => {
    const { formId, responses, submitterInfo } = input;

    // Verify form exists and is active
    const form = await db.form.findFirst({
      where: {
        id: formId,
        isPublished: true,
        isActive: true,
      },
      include: {
        fields: true,
      },
    });

    if (!form) {
      throw new ORPCError("NOT_FOUND");
    }

    // Validate required fields
    const requiredFields = form.fields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !responses[field.id] || responses[field.id].trim() === ""
    );

    if (missingFields.length > 0) {
      throw new ORPCError("BAD_REQUEST");
    }

    // Create submission with responses
    const submission = await db.$transaction(async (tx) => {
      // Create the submission
      const newSubmission = await tx.formSubmission.create({
        data: {
          formId,
          data: responses, // Store all responses as JSON
          ipAddress: submitterInfo?.ipAddress,
          userAgent: submitterInfo?.userAgent,
        },
      });

      // Create individual field responses
      const fieldResponses = Object.entries(responses)
        .filter(([fieldId, value]) => value && value.trim() !== "")
        .map(([fieldId, value]) => ({
          submissionId: newSubmission.id,
          fieldId,
          value: value.trim(),
        }));

      if (fieldResponses.length > 0) {
        await tx.formFieldResponse.createMany({
          data: fieldResponses,
        });
      }

      return newSubmission;
    });

    return {
      success: true,
      submissionId: submission.id,
    };
  });
