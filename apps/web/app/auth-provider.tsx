"use client";

import { parseResponse } from "hono/client";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { client } from "@/lib/api-client";

type Team = {
  id: string;
  name: string;
  role: "admin" | "team" | string;
};

interface AuthContextType {
  team: Team | null;
  token: string | null;
  login: (user: Team) => void;
  logout: () => void;
  isLoading: boolean;
  setTeam: (user: Team | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const PUBLIC_PATHS = ["/", "/admin"];

  useMountEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    parseResponse(client.api.auth.me.$get())
      .then((res) => {
        setTeam({
          id: res.team.id,
          name: res.team.name,
          role: res.team.role,
        });
      })
      .catch(() => {
        setTeam(null);
      })
      .finally(() => setIsLoading(false));
  });

  const login = (team: Team) => {
    setTeam(team);
  };

  const logout = () => {
    parseResponse(client.api.auth.logout.$post())
      .then(() => {
        setTeam(null);
      })
      .catch(() => {
        // silent fail - team stays logged out
      });
  };

  return (
    <AuthContext.Provider value={{ team, token: null, login, logout, isLoading, setTeam }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }

  return context;
}
