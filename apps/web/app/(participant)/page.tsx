import { redirect } from "next/navigation";
import { HomeLogin } from "@/app/_components/participant-login";
import { verifySession } from "@/lib/auth";

export default async function Home() {
  const session = await verifySession();
  if (session) {
    if (session.role === "team") {
      redirect("/contest");
    }

    if (session.role === "admin") {
      redirect("/admin/dashboard");
    }
  }

  return <HomeLogin />;
}
