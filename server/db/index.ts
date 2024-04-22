import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_CONNECTION_URL;
if (!connectionString) throw Error("DATABASE CONNECTION ERROR");

const queryClient = postgres(connectionString, { prepare: false });
const db = drizzle(queryClient, { schema });

export default db;
