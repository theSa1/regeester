"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { client } from "@/lib/orpc";
import { formSchema } from "@/lib/shared-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Select" },
  { value: "textarea", label: "Textarea" },
] as const;

type FormValues = z.infer<typeof formSchema>;

interface FormBuilderProps {
  initialData?: Partial<FormValues>;
  isEditing?: boolean;
  submitButtonText?: string;
  formId?: string;
}

export const FormBuilder = ({
  initialData,
  isEditing = false,
  submitButtonText,
  formId,
}: FormBuilderProps) => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      bannerUrl: initialData?.bannerUrl || "",
      isPublished: initialData?.isPublished || false,
      isActive: initialData?.isActive ?? true,
      acceptResponsesUntil: initialData?.acceptResponsesUntil || "",
      maxResponses: initialData?.maxResponses || undefined,
      requireAuthentication: initialData?.requireAuthentication || false,
      allowMultipleSubmissions: initialData?.allowMultipleSubmissions ?? true,
      // Event details
      eventName: initialData?.eventName || "",
      eventDate: initialData?.eventDate || "",
      eventTime: initialData?.eventTime || "",
      venueAddress: initialData?.venueAddress || "",
      venueName: initialData?.venueName || "",
      contactEmail: initialData?.contactEmail || "",
      contactPhone: initialData?.contactPhone || "",
      nameFieldPlaceholder:
        initialData?.nameFieldPlaceholder || "Enter your full name",
      nameFieldHelpText:
        initialData?.nameFieldHelpText || "Please provide your full name.",
      emailFieldPlaceholder:
        initialData?.emailFieldPlaceholder || "Enter your email",
      emailFieldHelpText:
        initialData?.emailFieldHelpText || "Please provide your email.",

      fields: initialData?.fields || [
        {
          id: crypto.randomUUID(),
          label: "",
          type: "text",
          placeholder: "",
          required: false,
          description: "",
          options: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fields",
  });

  const addField = () => {
    append({
      id: crypto.randomUUID(),
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      description: "",
      options: "",
    });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEditing && formId) {
        const res = await client.form.updateForm({
          id: formId,
          formData: values,
        });
        if (res.success) {
          toast.success("Form updated successfully!");
          router.push(`/app/form/${formId}`);
        } else {
          toast.error("Failed to update form.");
        }
      } else {
        const res = await client.form.createForm(values);
        if (res.success) {
          toast.success("Form created successfully!");
          router.push(`/app/form/${res.formId}`);
        } else {
          toast.error("Failed to create form.");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while saving the form.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Form Information */}
        <div>
          <h3 className="text-lg font-black uppercase mb-3">Form Details</h3>

          <div className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Event Registration" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be displayed as the main heading of your form.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Description (Optional)</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional context about the form for users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file.name);
                        } else {
                          field.onChange("");
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a banner image for the form header.
                    <br />
                    Recommended size: 1080x432 pixels (10:4 ratio).
                    <br />
                    Supported formats: JPG, PNG, WebP.
                  </FormDescription>
                  <FormMessage />
                  {field.value && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Selected file: {field.value}
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Form Settings */}
        <div>
          <h3 className="text-lg font-black uppercase mb-3">Form Settings</h3>

          <Card className="p-6 bg-secondary-background">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Form</FormLabel>
                      <FormDescription>
                        Make this form publicly accessible. Unpublished forms
                        are only visible to you.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Accept Responses</FormLabel>
                      <FormDescription>
                        Whether this form is currently accepting new responses.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptResponsesUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accept Responses Until (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Set a deadline for when this form should stop accepting
                      responses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxResponses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Responses (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Limit the number of responses this form can receive.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requireAuthentication"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Authentication</FormLabel>
                      <FormDescription>
                        Only authenticated users can submit responses to this
                        form.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowMultipleSubmissions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Allow Multiple Submissions</FormLabel>
                      <FormDescription>
                        Allow users to submit multiple responses to this form.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </div>

        {/* Event Details */}
        <div>
          <h3 className="text-lg font-black uppercase mb-4">Event Details</h3>

          <Card className="p-6 bg-secondary-background">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Annual Conference 2024"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of the event this form is for.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Convention Center"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The name of the venue where the event will be held.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="venueAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 123 Main St, City, State 12345"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The full address of the event venue.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        The date when the event will take place.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        The time when the event will start.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g., contact@event.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Email for event-related inquiries.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="e.g., (555) 123-4567"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Phone number for event-related inquiries.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Form Fields Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase">Form Fields</h3>
            <Button
              type="button"
              onClick={addField}
              variant="neutral"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-secondary-background">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-medium">Name</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Field Label</FormLabel>
                    <FormControl>
                      <Input defaultValue="Name" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <FormControl>
                      <Select disabled>
                        <SelectTrigger className="bg-secondary-background">
                          <SelectValue placeholder="Text" />
                        </SelectTrigger>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="nameFieldPlaceholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 h-full pt-5 pl-1">
                    <FormControl>
                      <Checkbox checked={true} disabled />
                    </FormControl>
                    <FormLabel>Required field</FormLabel>
                    <FormMessage />
                  </FormItem>
                </div>

                <FormField
                  control={form.control}
                  name="nameFieldHelpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Help Text (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Please provide your full name."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-4 bg-secondary-background">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Label className="font-medium">Email</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Field Label</FormLabel>
                    <FormControl>
                      <Input defaultValue="Email" disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <FormControl>
                      <Select disabled>
                        <SelectTrigger className="bg-secondary-background">
                          <SelectValue placeholder="Email" />
                        </SelectTrigger>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="emailFieldPlaceholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem className="flex flex-row items-center space-x-1 space-y-0 h-full pt-5 pl-1">
                    <FormControl>
                      <Checkbox checked={true} disabled />
                    </FormControl>
                    <FormLabel>Required field</FormLabel>
                    <FormMessage />
                  </FormItem>
                </div>

                <FormField
                  control={form.control}
                  name="emailFieldHelpText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Help Text (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Please provide your email."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {fields.map((field, index) => (
              <Card key={field.id} className="p-4 bg-secondary-background">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Label className="font-medium">Field {index + 1}</Label>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="neutral"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`fields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Type</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="bg-secondary-background">
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.placeholder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placeholder (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fields.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-1 space-y-0 h-full pt-5 pl-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Required field</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`fields.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Help Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Additional instructions for this field"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch(`fields.${index}.type`) === "select" && (
                    <FormField
                      control={form.control}
                      name={`fields.${index}.options`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Options (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Option 1, Option 2, Option 3"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter options separated by commas for select
                            dropdown.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button type="button" variant="neutral" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            {submitButtonText || (isEditing ? "Update Form" : "Create Form")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
