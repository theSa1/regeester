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
import {
  ArrowLeft,
  Download,
  Search,
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import { use, useState } from "react";
import { Input } from "@/components/ui/input";

const ResponsesPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [searchTerm, setSearchTerm] = useState("");

  const formResponses = useQuery(
    orpc.form.getFormResponses.queryOptions({
      input: { id },
    })
  );

  if (formResponses.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (formResponses.error || !formResponses.data) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Responses not found
        </h3>
        <p className="text-gray-500 mb-4">
          Unable to load responses for this form.
        </p>
        <Link href="/app/forms">
          <Button>Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const { form, submissions } = formResponses.data;

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search in responses
    const responseMatch = submission.responses.some((response) =>
      response.value.toLowerCase().includes(searchLower)
    );

    // Search in submitter info
    const submitterMatch =
      submission.submitter &&
      (submission.submitter.name.toLowerCase().includes(searchLower) ||
        (submission.submitter.email &&
          submission.submitter.email.toLowerCase().includes(searchLower)));

    return responseMatch || submitterMatch;
  });

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
            Form Responses
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-secondary-background">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{submissions.length}</div>
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
              Latest Response
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm font-medium">
              {submissions.length > 0
                ? new Date(submissions[0].submittedAt).toLocaleDateString()
                : "No responses yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Search */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="neutral" size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Responses List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="bg-secondary-background">
          <CardContent className="text-center py-12">
            {searchTerm ? (
              <>
                <Search className="mx-auto h-12 w-12 text-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No matching responses
                </h3>
                <p className="text-foreground/60 mb-6">
                  No responses match your search criteria. Try adjusting your
                  search term.
                </p>
                <Button variant="neutral" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Users className="mx-auto h-12 w-12 text-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-foreground/60 mb-6">
                  This form hasn&apos;t received any responses yet. Share your
                  form to start collecting responses.
                </p>
                <Link href={`/app/form/${id}`}>
                  <Button>Back to Form</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results count */}
          <div className="text-sm text-foreground/60">
            Showing {filteredSubmissions.length} of {submissions.length}{" "}
            responses
            {searchTerm && ` for "${searchTerm}"`}
          </div>

          {/* Response cards */}
          {filteredSubmissions.map((submission, index) => (
            <Card key={submission.id} className="bg-secondary-background">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-main text-main-foreground shadow-shadow rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {submissions.length - index}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Response #{submission.id.slice(-8)}
                      </CardTitle>
                      {submission.submitter && (
                        <CardDescription>
                          By{" "}
                          {submission.submitter.name ||
                            submission.submitter.email}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-foreground/60">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {form.fields.map((field) => {
                    const response = submission.responses.find(
                      (r) => r.fieldId === field.id
                    );
                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-2"
                      >
                        <div className="font-medium md:col-span-1 flex items-center h-full">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>
                        <div className="md:col-span-3 text-sm">
                          <div className="px-3 py-2 border-2 border-border shadow-shadow rounded-base">
                            {response?.value ? response.value : "No response"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsesPage;
