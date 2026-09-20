import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const built = JSON.parse(readFileSync("dist/server/wrangler.json", "utf8"));
mkdirSync(".sites-runtime", { recursive: true });
writeFileSync(
  ".sites-runtime/migrations.json",
  JSON.stringify({
    name: "nexo-local-migrations",
    compatibility_date: built.compatibility_date,
    d1_databases: built.d1_databases.map((db) => ({
      ...db,
      migrations_dir: path.resolve("drizzle"),
    })),
  }),
);
const result = spawnSync(
  process.execPath,
  [
    "--import",
    "./scripts/sites-env.mjs",
    "./node_modules/wrangler/bin/wrangler.js",
    "d1",
    "migrations",
    "apply",
    "DB",
    "--local",
    "--config",
    ".sites-runtime/migrations.json",
    "--persist-to",
    ".wrangler/state",
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
