import { validateJWT } from "@/server/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();

  if (cookieStore.has("token")) {
    const token = cookieStore.get("token");
    const { valid } = validateJWT(token?.value || "");

    if (valid) {
      redirect("/app");
    }
  }

  return children;
};

export default Layout;
