import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";
import { formSchema } from "@/lib/shared-schemas";

export const updateForm = os
  .use(authMiddleware)
  .input(
    z.object({
      id: z.string(),
      formData: formSchema,
    })
  )
  .handler(async ({ input, context }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const { id, formData } = input;

    // First verify the user owns this form
    const existingForm = await db.form.findFirst({
      where: {
        id,
        createdBy: context.user.userId,
      },
    });

    if (!existingForm) {
      throw new ORPCError("NOT_FOUND");
    }

    // Update form and replace all fields
    const updatedForm = await db.$transaction(async (tx) => {
      // Update form details
      const form = await tx.form.update({
        where: { id },
        data: {
          title: formData.title,
          description: formData.description,
          bannerUrl: formData.bannerUrl,
          isPublished: formData.isPublished || false,
          isActive: formData.isActive ?? true,
          acceptResponsesUntil: formData.acceptResponsesUntil
            ? new Date(formData.acceptResponsesUntil)
            : null,
          maxResponses: formData.maxResponses,
          requireAuthentication: formData.requireAuthentication || false,
          allowMultipleSubmissions: formData.allowMultipleSubmissions ?? true,
          // Event details
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          venueAddress: formData.venueAddress,
          venueName: formData.venueName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,

          nameFieldPlaceholder: formData.nameFieldPlaceholder,
          nameFieldHelpText: formData.nameFieldHelpText,
          emailFieldPlaceholder: formData.emailFieldPlaceholder,
          emailFieldHelpText: formData.emailFieldHelpText,
        },
      });

      // Delete existing fields
      await tx.formField.deleteMany({
        where: { formId: id },
      });

      // Create new fields
      await tx.formField.createMany({
        data: formData.fields.map((field) => ({
          formId: id,
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          required: field.required,
          description: field.description,
          options: field.options,
        })),
      });

      return form;
    });

    return {
      success: true,
      formId: updatedForm.id,
    };
  });
