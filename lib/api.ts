import type { App } from "@/server";
import { treaty } from "@elysiajs/eden";

export const getHostForWS = () => {
  if (typeof window !== "undefined") {
    if (window.location.host.startsWith("localhost")) {
      return `ws://localhost:${3001}`;
    } else {
      return "wss://" + window.location.host;
    }
  }
  return `ws://localhost:${3001}`;
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const api = treaty<App>(getBaseUrl()).api;
