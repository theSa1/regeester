"use client";

import { FileText, Home, LogOut, Plus } from "lucide-react";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const router = useRouter();

  const currentUser = useQuery(
    orpc.auth.getCurrentUser.queryOptions({
      input: undefined,
    })
  );

  // Extract initials from username or displayName
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="hidden md:block">
        <h1 className="text-2xl font-black text-center">REGEESTER</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/app">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/app/forms">
                  <FileText />
                  <span>Forms</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/app/form/create">
                  <Plus />
                  <span>Create Form</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="" alt={currentUser.data?.name || "User"} />
              <AvatarFallback>
                {getInitials(currentUser.data?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">
                {currentUser.data?.name || "Loading..."}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentUser.data?.email || ""}
              </span>
            </div>
          </div>
          <Button
            size="icon"
            variant="neutral"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => {
              // remove token cookie
              document.cookie =
                "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              router.replace("/app/sign-in");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
