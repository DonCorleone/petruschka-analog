/**
 * Simplest possible MongoDB connection for Render.com
 * No pooling, no caching, just connect -> query -> disconnect
 */

import { MongoClient } from 'mongodb';

export async function getMongoData(filter: object = {}, dbName= '', collectionName = '') {
  // Bail out immediately if no connection string
  const connectionString = process.env['MONGODB_CONNECTION_STRING'];
  if (!connectionString) {
    console.log('❌ No MongoDB connection string found');
    return null;
  }

  let client: MongoClient | null = null;
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Create the simplest possible client
    client = new MongoClient(connectionString);
    
    // Connect with short timeout
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Get database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Query with filter
    const documents = await collection.find(filter).toArray();
    console.log(`✅ Found ${documents.length} documents with filter:`, filter);
    
    return documents;
    
  } catch (error) {
    console.error('❌ MongoDB error:', error);
    return null;
  } finally {
    // Always disconnect
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}
