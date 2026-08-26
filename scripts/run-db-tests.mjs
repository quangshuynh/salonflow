// Runs the SQL suites in supabase/tests against a real PostgreSQL.
//
// The point of these tests is the database boundary itself — RLS policies and
// foreign keys — so they are never run against a mock. Two modes:
//
//   npm run test:db                   throwaway Docker container, torn down after
//   DATABASE_URL=... npm run test:db  an existing database, via local psql (CI)
//
// Order is: the test-only Supabase shim, then every migration in filename
// order, then every *_test.sql. Query output is discarded; assertions report
// themselves through NOTICE on stderr, and a failure aborts psql with
// ON_ERROR_STOP so the exit code is meaningful.

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const IMAGE = process.env.SALONFLOW_TEST_PG_IMAGE ?? "postgres:17-alpine";
const CONTAINER = "salonflow-db-test";
const READY_TIMEOUT_MS = 90_000;

class SuiteError extends Error {}

function filesIn(dir, predicate) {
  const absolute = join(root, "supabase", dir);
  return readdirSync(absolute)
    .filter((name) => name.endsWith(".sql") && predicate(name))
    .sort()
    .map((name) => ({ label: `${dir}/${name}`, path: join(absolute, name) }));
}

const suite = [
  ...filesIn("tests", (name) => !name.endsWith("_test.sql")),
  ...filesIn("migrations", () => true),
  ...filesIn("tests", (name) => name.endsWith("_test.sql")),
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function docker(args, options = {}) {
  return spawnSync("docker", args, { encoding: "utf8", ...options });
}

/** psql against a database reachable from this machine. */
function psqlDirect(sql) {
  return spawnSync(
    "psql",
    [process.env.DATABASE_URL, "-v", "ON_ERROR_STOP=1", "-f", "-"],
    { input: sql, stdio: ["pipe", "ignore", "inherit"] }
  );
}

/** psql inside the throwaway container — no local client needed. */
function psqlInContainer(sql) {
  return spawnSync(
    "docker",
    [
      "exec", "-i", CONTAINER,
      "psql", "-U", "postgres", "-d", "postgres",
      "-v", "ON_ERROR_STOP=1", "-f", "-",
    ],
    { input: sql, stdio: ["pipe", "ignore", "inherit"] }
  );
}

function runSuite(psql) {
  for (const { label, path } of suite) {
    console.error(`\n── ${label} ${"─".repeat(Math.max(0, 58 - label.length))}`);
    const result = psql(readFileSync(path, "utf8"));
    if (result.error) {
      throw new SuiteError(`Could not run psql: ${result.error.message}`);
    }
    if (result.status !== 0) throw new SuiteError(`FAILED in ${label}`);
  }
  console.error("\nAll database suites passed.\n");
}

function startContainer() {
  if (docker(["info"]).status !== 0) {
    throw new SuiteError(
      "Docker is not available.\n" +
        "Start Docker Desktop and retry, or point the suite at an existing\n" +
        "PostgreSQL instead:  DATABASE_URL=postgres://... npm run test:db"
    );
  }

  docker(["rm", "-f", CONTAINER], { stdio: "ignore" });

  console.error(`Starting ${IMAGE} as ${CONTAINER}...`);
  // No password, and none needed: the container publishes no port, psql runs
  // inside it over the local socket, and `--rm` plus the teardown below means
  // it never outlives the run. A fixed password here would be a credential
  // literal in the repository for no security benefit.
  const started = docker([
    "run", "--rm", "-d",
    "--name", CONTAINER,
    "-e", "POSTGRES_HOST_AUTH_METHOD=trust",
    IMAGE,
  ]);
  if (started.status !== 0) {
    throw new SuiteError(`Could not start container:\n${started.stderr}`);
  }

  // Probe over TCP, not the socket. The image's entrypoint runs a temporary
  // server on the socket while it initialises the cluster, then stops it and
  // starts the real one — so a socket probe reports ready during init and the
  // first query can land in the restart gap ("no such file or directory").
  // The temporary server sets listen_addresses='', so TCP only answers once
  // the real server is up. Still no published port: this runs inside.
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const ready = docker([
      "exec", CONTAINER,
      "pg_isready", "-h", "127.0.0.1", "-U", "postgres", "-q",
    ]);
    if (ready.status === 0) return;
    sleep(1000);
  }
  throw new SuiteError("PostgreSQL did not become ready in time.");
}

try {
  if (process.env.DATABASE_URL) {
    console.error("Using DATABASE_URL via local psql.");
    runSuite(psqlDirect);
  } else {
    startContainer();
    try {
      runSuite(psqlInContainer);
    } finally {
      docker(["rm", "-f", CONTAINER], { stdio: "ignore" });
    }
  }
} catch (error) {
  console.error(
    `\n${error instanceof SuiteError ? error.message : (error?.stack ?? error)}\n`
  );
  process.exitCode = 1;
}
