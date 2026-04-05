export type Role = "admin" | "team";

export type JWTPayload = {
  id: string;
  role: Role;
  iat: number;
  exp: number;
};
