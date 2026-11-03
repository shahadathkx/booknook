import { MongoClient, Db } from "mongodb";

function extractDbName(mongoUri: string): string {
  try {
    const url = new URL(mongoUri);
    const name = url.pathname.replace(/^\//, "").trim();
    if (name && name.length > 0) return name;
  } catch {
    const match = mongoUri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1] && match[1].length > 0) return match[1];
  }
  return process.env.MONGODB_DB_NAME || "booknook";
}

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClient(): MongoClient {
  if (global._mongoClient) return global._mongoClient;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI must be configured.");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  global._mongoClient = client;
  return client;
}

export async function connectToMongo(): Promise<MongoClient> {
  const client = getClient();
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect().catch((error: unknown) => {
      global._mongoClientPromise = undefined;
      throw error;
    });
  }
  return global._mongoClientPromise;
}

export function getMongoDatabase(): Db {
  const client = getClient();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI must be configured.");
  }
  return client.db(extractDbName(uri));
}
