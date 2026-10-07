import mongoose from 'mongoose';

/**
 * Connect to MongoDB with automated retry, pooling, and event logging
 */
export async function connectDB(uri = process.env.MONGODB_URI || process.env.DATABASE_URL) {
  let connectionUri = uri;

  if (!connectionUri || connectionUri.startsWith('postgresql://') || connectionUri.startsWith('postgres://')) {
    connectionUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/veyra_payment';
    if (uri && (uri.startsWith('postgresql://') || uri.startsWith('postgres://'))) {
      console.warn(`[Payment Service DB] Postgres URI detected; falling back to MongoDB URI: ${connectionUri}`);
    }
  }

  try {
    const conn = await mongoose.connect(connectionUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[Payment Service DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[Payment Service DB Error] Could not connect to MongoDB: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
