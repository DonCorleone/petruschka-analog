/**
 * MongoDB Native Driver Connection Utility
 * Simple connection approach compatible with Render.com
 */

import { MongoClient, Db } from 'mongodb';

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

export async function getDatabase(): Promise<Db> {
  try {
    const config = getMongoConfig();
    
    // Create a simple client connection
    const client = new MongoClient(config.connectionString, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    // Connect and return database
    await client.connect();
    const db = client.db(config.database);

    console.log('✅ Connected to MongoDB successfully');
    return db;

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
