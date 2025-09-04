"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Users } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const { data: stats, isLoading } = useQuery(
    orpc.other.getDashboardData.queryOptions()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black uppercase">Dashboard</h1>

        <div className="flex gap-3">
          <Link href="/app/form/create">
            <Button variant="neutral" size="sm" className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Card className="bg-secondary-background p-5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </Card>
            <Card className="bg-secondary-background p-5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-secondary-background">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Forms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.stats.totalForms}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary-background">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.stats.totalResponses}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
