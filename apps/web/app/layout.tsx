import "@phena/ui/components/8bit/styles/retro.css";
import type { Metadata } from "next";
import "@phena/ui/globals.css";
import { TooltipProvider } from "@phena/ui/components/tooltip";
import { cn } from "@phena/ui/lib/utils";
import { Geist, Lora, Press_Start_2P, VT323, Geist_Mono } from "next/font/google";
import { verifySession } from "@/lib/auth";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { SSEProvider } from "./sse-provider";

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

const loraHeading = Lora({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-heading",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-retro-body",
});

export const metadata: Metadata = {
  title: "Phena CTF",
  description: "Attack & Defense CTF Platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const team = await verifySession();

  return (
    <html
      lang="en"
      className={cn("dark", loraHeading.variable, geist.variable, "font-mono", geistMono.variable)}
    >
      <body
        className={`flex min-h-svh flex-col antialiased ${pressStart2P.variable} ${vt323.variable}`}
      >
        <QueryProvider>
          <AuthProvider initialTeam={team}>
            <SSEProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </SSEProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
