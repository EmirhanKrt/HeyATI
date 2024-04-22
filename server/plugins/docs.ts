import Elysia from "elysia";
import swagger from "@elysiajs/swagger";

const swaggerConfig = {
  path: "/docs",
  exclude: ["/api/docs", "/api/docs/json"],
  documentation: {
    info: {
      title: "HeyATI API Docs",
      version: "1",
    },
  },
};

export const docsPlugin = (app: Elysia) => {
  const ENVIRONMENT = process.env.ENVIRONMENT || "DEVELOPMENT";

  return ENVIRONMENT === "DEVELOPMENT" ? app.use(swagger(swaggerConfig)) : app;
};
