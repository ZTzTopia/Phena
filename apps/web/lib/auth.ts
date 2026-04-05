import { AUTH_COOKIE_NAME } from "@phena/schema";

export const auth = {
  getToken: () => {
    const match = document.cookie.match(new RegExp(`(^| )${AUTH_COOKIE_NAME}=([^;]+)`));
    return match?.[2] ?? null;
  },
  clear: () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
  logout: () => {
    auth.clear();
    window.location.href = "/";
  },
};
