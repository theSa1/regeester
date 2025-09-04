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
      isPublished: initialData?.isPublished || false,
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
          <h3 className="text-lg font-black uppercase mb-4">Form Details</h3>

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
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-base border-2 border-border p-3 shadow-shadow bg-secondary-background">
                  <div className="space-y-0.5">
                    <FormLabel>Publish Form</FormLabel>
                    <FormDescription>
                      Make this form publicly accessible. Unpublished forms are
                      only visible to you.
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
        </div>

        {/* Form Fields Configuration */}
        <div className="space-y-4">
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

          <div className="space-y-6">
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
