import { redirect } from "next/navigation";
import { AdminLogin } from "@/app/admin/_components/admin-login";
import { verifySession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await verifySession();
  if (session) {
    if (session.role === "admin") {
      redirect("/admin/dashboard");
    }

    if (session.role === "team") {
      redirect("/contest");
    }
  }

  return <AdminLogin />;
}
