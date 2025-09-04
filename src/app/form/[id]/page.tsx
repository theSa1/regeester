"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { orpc } from "@/lib/orpc";
import { client } from "@/lib/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { use } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { proseClasses } from "@/lib/utils";

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string | null;
  required: boolean;
  description?: string | null;
  options?: string | null;
}

const PublicFormPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formQuery = useQuery(
    orpc.form.getPublicForm.queryOptions({
      input: { id },
    })
  );

  const submitMutation = useMutation({
    mutationFn: async (formData: {
      formId: string;
      responses: Record<string, string>;
    }) => {
      return client.form.submitFormResponse({
        formId: formData.formId,
        responses: formData.responses,
        submitterInfo: {
          userAgent: navigator.userAgent,
        },
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Form submitted successfully!");
    },
    onError: (error) => {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form. Please try again.");
    },
  });

  const handleInputChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formQuery.data) return;

    // Validate required fields
    const requiredFields = formQuery.data.fields.filter(
      (field) => field.required
    );
    const missingFields = requiredFields.filter(
      (field) => !responses[field.id] || responses[field.id].trim() === ""
    );

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        formId: id,
        responses,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder || undefined}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-secondary-background"
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || undefined}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-secondary-background min-h-24"
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleInputChange(field.id, checked ? "true" : "false")
              }
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.placeholder || "Check this box"}
            </Label>
          </div>
        );

      case "select":
        const options = field.options
          ? field.options.split(",").map((opt) => opt.trim())
          : [];
        return (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(field.id, val)}
          >
            <SelectTrigger className="bg-secondary-background">
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder || undefined}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="bg-secondary-background"
          />
        );
    }
  };

  if (formQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (formQuery.error || !formQuery.data) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-secondary-background">
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Form Not Found</h3>
              <p className="text-foreground/60 mb-6">
                This form doesn&apos;t exist, has been disabled, or is no longer
                accepting responses.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-secondary-background">
            <CardContent className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-black uppercase mb-2">Thank You!</h3>
              <p className="text-foreground/70 mb-6">
                Your response has been submitted successfully.
              </p>
              <p className="text-sm text-foreground/60">
                You can safely close this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const form = formQuery.data;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase">
            {form.title}
          </h1>
        </div>

        {form.description && form.description.trim() !== "<p></p>" && (
          <Card className="bg-secondary-background">
            <CardContent
              className={proseClasses}
              dangerouslySetInnerHTML={{ __html: form.description }}
            />
          </Card>
        )}

        {/* Form Fields */}
        <Card className="bg-secondary-background">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>

                  {renderField(field)}

                  {field.description && (
                    <p className="text-xs text-foreground/60">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-6 border-t border-border">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-main-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Form
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicFormPage;
