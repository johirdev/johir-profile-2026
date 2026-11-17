import "server-only";
import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __pfMongo?: Cache };
const cache: Cache = g.__pfMongo ?? (g.__pfMongo = { conn: null, promise: null });

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

/** One pool per server instance, reused across hot reloads and requests. */
export async function connectDB() {
  if (cache.conn) return cache.conn;
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL is not set");
  cache.promise ??= mongoose
    .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
    .catch((err) => {
      cache.promise = null;
      throw err;
    });
  cache.conn = await cache.promise;
  return cache.conn;
}
