import type { App } from "@/server";
import { treaty } from "@elysiajs/eden";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const api = treaty<App>(getBaseUrl()).api;
