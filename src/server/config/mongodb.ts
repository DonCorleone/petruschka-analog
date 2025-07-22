import { MongoClient, Db } from 'mongodb';
import { getEnv } from './environment';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Get MongoDB database instance
 * Uses connection pooling and singleton pattern for optimal performance
 */
export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    const config = getEnv();
    
    console.log('Attempting to connect to MongoDB...');
    
    // Create new client if it doesn't exist
    if (!client) {
      client = new MongoClient(config.mongodb.connectionString, {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });
    }

    // Connect to MongoDB
    await client.connect();
    
    // Test the connection
    await client.db("admin").command({ ismaster: true });
    
    // Get database instance
    db = client.db(config.mongodb.database);
    
    console.log(`✅ Connected to MongoDB database: ${config.mongodb.database}`);
    return db;
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    // Reset client and db on error
    client = null;
    db = null;
    throw error;
  }
}

/**
 * Close MongoDB connection
 * Should be called when the application shuts down
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});