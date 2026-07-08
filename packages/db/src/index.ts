export * from "./schema";
export * from "./client";
export * from "./completeness";
export * from "./matching";
export * from "./prohibited-goods";
export { runMigrations } from "./migrate";

// Re-exported so consumers never import drizzle-orm directly — pnpm can
// otherwise resolve a second physical copy with an incompatible peer-dep
// hash, breaking type identity (SQL<unknown> from copy A != copy B).
export { and, eq, inArray, or } from "drizzle-orm";
