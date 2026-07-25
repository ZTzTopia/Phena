"use client";

import type { TeamResponse } from "@phena/schema";
import { parseResponse } from "hono/client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { client } from "@/lib/api-client";

interface AuthContextType {
  team: TeamResponse | null;
  setTeam: (team: TeamResponse | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialTeam,
}: {
  children: ReactNode;
  initialTeam: TeamResponse | null;
}) {
  const [team, setTeam] = useState<TeamResponse | null>(initialTeam);

  const logout = async () => {
    try {
      await parseResponse(client.api.auth.logout.$post());
    } catch {
      // Cookie may already be gone
    } finally {
      setTeam(null);
    }
  };

  return <AuthContext.Provider value={{ team, setTeam, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
