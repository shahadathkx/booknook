import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI must be configured.");
}

function extractDbName(mongoUri: string): string {



  try {
    const url = new URL(mongoUri);
    const pathname = url.pathname;
    const name = pathname.replace(/^\//, "").split("?")[0].trim();
    if (name && name.length > 0) return name;
  } catch {

    const match = mongoUri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1] && match[1].length > 0) return match[1];
  }
  return process.env.MONGODB_DB_NAME || "booknook";
}

const DB_NAME = extractDbName(uri);

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

const client: MongoClient =
  global._mongoClient ?? new MongoClient(uri, mongoOptions);

global._mongoClient = client;

export async function connectToMongo(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect().catch((error: unknown) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }

  return global._mongoClientPromise;
}

export const clientInstance = client;

export const db: Db = client.db(DB_NAME);
