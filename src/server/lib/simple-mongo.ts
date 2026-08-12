import { MongoClient } from 'mongodb';

// Simple in-memory cache
const cache = new Map<string, { data: any; expires: number }>();
const DEFAULT_TTL = 12 * 60 * 60 * 1000; // 12 Stunden

export async function getMongoData(
  filter: object = {},
  dbName = '',
  collectionName = '',
  ttl = DEFAULT_TTL
) {
  const connectionString = process.env['MONGODB_CONNECTION_STRING'];
  if (!connectionString) {
    console.log('❌ No MongoDB connection string found');
    return null;
  }

  // Cache key aus Collection + Filter
  const cacheKey = `${dbName}.${collectionName}:${JSON.stringify(filter)}`;
  
  // Cache hit?
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    console.log(`✅ Cache hit for ${collectionName}`);
    return cached.data;
  }

  let client: MongoClient | null = null;
  try {
    console.log('🔄 Connecting to MongoDB...');
    client = new MongoClient(connectionString);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const documents = await collection.find(filter).toArray();
    console.log(`✅ Found ${documents.length} documents with filter:`, filter);

    // Cache speichern
    cache.set(cacheKey, { data: documents, expires: Date.now() + ttl });

    return documents;
  } catch (error) {
    console.error('❌ MongoDB error:', error);
    return null;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}