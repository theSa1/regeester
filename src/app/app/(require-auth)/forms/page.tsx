"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const forms = useQuery(orpc.form.listForms.queryOptions());

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black uppercase">Forms</h1>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {forms.isLoading ? (
          new Array(3).fill(0).map((_, idx) => (
            <Card className="bg-secondary-background" key={idx}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
            </Card>
          ))
        ) : forms.data && forms.data.length > 0 ? (
          <>
            {forms.data.map((form) => (
              <Link href={`/app/form/${form.id}`} key={form.id}>
                <Card className="bg-secondary-background relative">
                  <div className="absolute top-0 right-0 h-8 w-8 bg-main text-primary-foreground flex items-center justify-center rounded-bl-lg font-bold">
                    {form._count.submissions}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex-1 font-black uppercase">
                      {form.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.isPublished ? (
                      <Badge variant="default">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="neutral">
                        <XCircle className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </>
        ) : (
          <p>No forms found.</p>
        )}
      </div>
    </>
  );
};

export default Page;
