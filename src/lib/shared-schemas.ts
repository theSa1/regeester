import { z } from "zod";

export const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Field label is required"),
  type: z.enum([
    "text",
    "email",
    "number",
    "date",
    "checkbox",
    "select",
    "textarea",
    "richtext",
  ]),
  placeholder: z.string().optional(),
  required: z.boolean(),
  description: z.string().optional(),
  options: z.string().optional(),
});

export const formSchema = z.object({
  title: z.string().min(1, "Form title is required"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});
