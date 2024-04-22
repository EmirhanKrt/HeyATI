import Elysia from "elysia";
import cors from "@elysiajs/cors";

export const corsPlugin = (app: Elysia) => {
  return app.use(cors());
};
