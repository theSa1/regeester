"use client";

import { FormBuilder } from "@/app/app/(require-auth)/_components/form-builder";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { use } from "react";
import type { FormField } from "@/generated/prisma";

const EditFormPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const formDetails = useQuery(
    orpc.form.getFormDetails.queryOptions({
      input: { id },
    })
  );

  if (formDetails.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <Skeleton className="h-6 w-24" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formDetails.error || !formDetails.data) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Form not found
        </h3>
        <p className="text-gray-500 mb-4">
          The form you're trying to edit doesn't exist or you don't have access
          to it.
        </p>
        <Link href="/app/forms">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const form = formDetails.data;

  // Transform the form data to match the FormBuilder expected format
  const initialFormData = {
    title: form.title,
    description: form.description || "",
    isPublished: form.isPublished,
    fields: form.fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type as any,
      placeholder: field.placeholder || "",
      required: field.required,
      description: field.description || "",
      options: field.options || "",
    })),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/app/form/${id}`}>
          <Button variant="neutral" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase">
            Edit Form
          </h1>
        </div>
      </div>

      {/* Form Builder */}
      <FormBuilder
        initialData={initialFormData}
        isEditing={true}
        formId={id}
        submitButtonText="Update Form"
      />
    </div>
  );
};

export default EditFormPage;
