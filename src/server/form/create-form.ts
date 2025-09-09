import db from "@/lib/db";
import { formSchema } from "@/lib/shared-schemas";
import { ORPCError, os } from "@orpc/server";
import { authMiddleware } from "../auth-middleware";

export const createForm = os
  .use(authMiddleware)
  .input(formSchema)
  .handler(async ({ input, context }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    const form = await db.form.create({
      data: {
        title: input.title,
        createdBy: context.user.userId,
        description: input.description,
        bannerUrl: input.bannerUrl,
        isPublished: input.isPublished || false,
        isActive: input.isActive ?? true,
        acceptResponsesUntil: input.acceptResponsesUntil
          ? new Date(input.acceptResponsesUntil)
          : null,
        maxResponses: input.maxResponses,
        requireAuthentication: input.requireAuthentication || false,
        allowMultipleSubmissions: input.allowMultipleSubmissions ?? true,
        // Event details
        eventName: input.eventName,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        venueAddress: input.venueAddress,
        venueName: input.venueName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,

        nameFieldPlaceholder: input.nameFieldPlaceholder,
        nameFieldHelpText: input.nameFieldHelpText,
        emailFieldPlaceholder: input.emailFieldPlaceholder,
        emailFieldHelpText: input.emailFieldHelpText,

        fields: {
          create: input.fields.map((field) => ({
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            required: field.required,
            description: field.description,
            options: field.options,
          })),
        },
      },
    });

    return {
      success: true,
      formId: form.id,
    };
  });
