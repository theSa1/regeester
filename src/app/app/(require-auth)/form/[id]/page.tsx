"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  FileText,
  Settings,
  Users,
  Calendar,
  ExternalLink,
  BarChart3,
  Check,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDescription } from "@/components/ui/form";

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const formDetails = useQuery(
    orpc.form.getFormDetails.queryOptions({
      input: { id },
    })
  );

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/form/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Form link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (formDetails.isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
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
          The form you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Link href="/app/forms">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const form = formDetails.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/app/forms`}>
            <Button variant="neutral" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase">
              {form.title}
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/app/form/${id}/edit`}>
            <Button variant="neutral" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit Form
            </Button>
          </Link>
        </div>
      </div>
      {/* Unpublished Form Warning */}
      {!form.isPublished && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Form Not Published
            </CardTitle>
            <CardDescription className="text-amber-700">
              This form is currently unpublished and not accessible to the
              public. Edit the form to publish it and make it available for
              responses.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-secondary-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{form._count.submissions}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Form Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{form.fields.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Created
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-base font-bold">
              {new Date(form.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link href={`/app/form/${id}/responses`}>
          <Card className="bg-secondary-background">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Responses
              </CardTitle>
              <CardDescription>
                View and analyze {form._count.submissions} response
                {form._count.submissions !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card
          className="bg-secondary-background transition-shadow cursor-pointer hover:shadow-lg"
          onClick={copyToClipboard}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Share Form
            </CardTitle>
            <CardDescription>
              Get the public link to share your form
            </CardDescription>
          </CardHeader>
        </Card>
      </div>{" "}
      {/* Form Fields */}
      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
          <CardDescription>
            {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}{" "}
            configured
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {form.fields.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">
              No fields have been added to this form yet.
            </p>
          ) : (
            form.fields.map((field, index) => (
              <div key={field.id}>
                <Label>
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  placeholder={field.placeholder || undefined}
                  className="pointer-events-none"
                />
                {field.description && (
                  <p className="text-sm font-base text-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      {/* Share Form */}
      <Card className="bg-secondary-background">
        <CardHeader>
          <CardTitle>Share Form</CardTitle>
          <CardDescription>
            Share this form with others to collect responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full px-3 py-2 shadow-shadow bg-background border-2 border-border rounded-base font-mono text-sm break-all">
              {typeof window !== "undefined"
                ? `${window.location.origin}/form/${id}`
                : `[URL]/form/${id}`}
            </div>
            <Button
              size="sm"
              variant="neutral"
              onClick={copyToClipboard}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
