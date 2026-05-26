#!/usr/bin/env node
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const dir = dirname(fileURLToPath(import.meta.url));
const entry = join(dir, "src", "index.ts");

const result = spawnSync(
  process.execPath,
  ["--import", "tsx/esm", entry],
  { stdio: "inherit", env: process.env }
);

process.exit(result.status ?? 0);
