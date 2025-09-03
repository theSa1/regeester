import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { validateJWT } from "@/server/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/sidebar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();

  if (!cookieStore.has("token")) {
    redirect("/app/sign-in");
  } else {
    const token = cookieStore.get("token");
    const { valid } = validateJWT(token?.value || "");

    if (!valid) {
      redirect("/app/sign-in");
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header with sidebar trigger */}
        <header className="flex items-center gap-2 p-4 border-b-2 md:hidden bg-secondary-background">
          <SidebarTrigger />
          <h1 className="text-xl font-bold">REGEESTER</h1>
        </header>

        <div className="flex-1 p-4 md:p-6">
          <main className="container mx-auto max-w-4xl">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
