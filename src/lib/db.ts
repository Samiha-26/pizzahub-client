import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URL as string);
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(process.env.DB_NAME || "pizzahub");
  return cachedDb;
}
