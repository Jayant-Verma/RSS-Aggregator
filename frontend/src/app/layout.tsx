import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";

  if (!session && !isLoginPage) {
    redirect("/login");
  }

  return <>{children}</>;
}