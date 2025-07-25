/**
 * Simple MongoDB connection for Events/Merch data
 * Connects to eventDb.EventDetailsTaggedUsage collection
 */

import { MongoClient } from 'mongodb';

export async function getEventData() {
  // Bail out immediately if no connection string
  const connectionString = process.env['MONGODB_CONNECTION_STRING'];
  if (!connectionString) {
    console.log('❌ No MongoDB connection string found');
    return null;
  }

  let client: MongoClient | null = null;
  
  try {
    console.log('🔄 Connecting to MongoDB for events...');
    
    // Create the simplest possible client
    client = new MongoClient(connectionString);
    
    // Connect with short timeout
    await client.connect();
    console.log('✅ Connected to MongoDB events');
    
    // Get database and collection
    const db = client.db('eventDb');
    const collection = db.collection('EventDetailsTaggedUsage');
    
    // Query only documents that have CD ticket types
    // Use MongoDB aggregation to filter documents that contain "CD" in ticket type names
    const documents = await collection.find({
      "ticketTypes.ticketTypeInfos.name": "CD"
    }).toArray();
    
    console.log(`✅ Found ${documents.length} CD documents`);
    
    return documents;
    
  } catch (error) {
    console.error('❌ MongoDB events error:', error);
    return null;
  } finally {
    // Always disconnect
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB events');
    }
  }
}
