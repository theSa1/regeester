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
        isPublished: input.isPublished || false,
        isActive: true,
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
