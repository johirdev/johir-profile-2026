/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

/**
 * The URI is read lazily rather than at module load. Throwing at import time
 * takes down anything that merely imports a model — including `next build`,
 * which evaluates sitemap.ts and feed.xml/route.ts without a database.
 */
const getUri = () => {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL missing in .env");
  return uri;
};

// Cached across hot reloads and serverless invocations so we open one pool.
let cached = (global as any).mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getUri(), {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m)
      .catch((err) => {
        // Clear the cached promise so the next request can retry instead of
        // permanently resolving to a rejected connection.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
