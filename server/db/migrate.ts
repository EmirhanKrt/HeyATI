import { migrate } from "drizzle-orm/postgres-js/migrator";
import db from ".";

const main = async () => {
  let processStatus = 0;

  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrate completed!");
  } catch (error) {
    console.error("Error during migration:", error);
    processStatus = 1;
  } finally {
    process.exit(processStatus);
  }
};

main();
