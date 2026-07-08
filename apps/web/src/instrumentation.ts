export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runMigrations } = await import("@gracera/db");
  try {
    // Bundling rewrites __dirname/import.meta.url, so the migrations
    // folder can't be found relative to the (now-inlined) source — the
    // Dockerfile copies it to a known path and points us at it explicitly.
    await runMigrations(undefined, process.env.DB_MIGRATIONS_DIR);
    console.log("[instrumentation] Database migrations applied.");
  } catch (err) {
    console.error("[instrumentation] Migration failed:", err);
  }
}
