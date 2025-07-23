/**
 * MongoDB Native Driver Connection Utility
 * This file handles the connection to MongoDB using the native driver
 */

import { MongoClient, Db } from 'mongodb';

// Global connection instance (singleton pattern)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface MongoConfig {
  connectionString: string;
  database: string;
}

function getMongoConfig(): MongoConfig {
  const connectionString = process.env['MONGODB_CONNECTION_STRING'];
  const database = process.env['MONGODB_DATABASE'] || 'staticDb';

  if (!connectionString) {
    throw new Error('MONGODB_CONNECTION_STRING environment variable is required');
  }

  return {
    connectionString,
    database
  };
}

export async function connectToDatabase(): Promise<Db> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    const config = getMongoConfig();
    
    // Create new MongoDB client
    const client = new MongoClient(config.connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Connect to MongoDB
    await client.connect();
    
    // Get database instance
    const db = client.db(config.database);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    console.log('✅ Connected to MongoDB successfully');
    return db;

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Graceful shutdown function
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('🔌 MongoDB connection closed');
  }
}
