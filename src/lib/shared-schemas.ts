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
  bannerUrl: z.string().optional(), // Changed from URL validation to string for file handling
  isPublished: z.boolean(),
  isActive: z.boolean(),
  acceptResponsesUntil: z.string().optional(), // Using string for datetime-local input
  maxResponses: z.number().min(1).optional(),
  requireAuthentication: z.boolean(),
  allowMultipleSubmissions: z.boolean(),
  // Event details
  eventName: z.string().optional(),
  eventDate: z.string().optional(), // Using string for date input
  eventTime: z.string().optional(),
  venueAddress: z.string().optional(),
  venueName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),

  nameFieldPlaceholder: z.string().optional(),
  nameFieldHelpText: z.string().optional(),
  emailFieldPlaceholder: z.string().optional(),
  emailFieldHelpText: z.string().optional(),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});
