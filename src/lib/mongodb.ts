import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/booknook";

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

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  global._mongoClient = client;
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn("MongoDB connection notice (dev):", err.message);
      return client;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect().catch((err) => {
    console.warn("MongoDB connection notice (build/prod):", err.message);
    return client;
  });
}

export { clientPromise };
export const clientInstance = client;
export const db: Db = client.db();
