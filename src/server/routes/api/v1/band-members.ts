import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getEnv } from '../../../config/environment';
import { getMongoData } from '../../../lib/simple-mongo';

interface MongoDBResponse {
  documents: any[];
}

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // Try MongoDB native driver first (simple approach)
    const mongoDocuments = await getMongoData();
    
    if (mongoDocuments && mongoDocuments.length > 0) {
      console.log('✅ Using MongoDB native driver data');
      
      // Transform MongoDB documents to BandMember format
      const bandMembers: BandMember[] = mongoDocuments.map((doc: any, index: number) => ({
        id: doc._id?.toString() || index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.instrument || 'Unknown Instrument',
        image: doc.image || `/images/members/member-${(index % 4) + 1}.png`,
        description: doc.description || 'No description available.'
      }));

      return {
        success: true,
        data: bandMembers,
        timestamp: new Date().toISOString(),
        source: 'mongodb-native-driver'
      };
    }
    
    // Fallback to Data API if MongoDB native fails
    console.log('⚠️ Falling back to MongoDB Data API');
    const config = getEnv();
    
    // MongoDB Data API request configuration
    const mongoRequest = {
      collection: "staff",
      database: config.mongodb.database,
      dataSource: config.mongodb.dataSource
    };

    // Fetch data from MongoDB Data API
    const response = await $fetch<MongoDBResponse>('https://data.mongodb-api.com/app/data-pcuoo/endpoint/data/v1/action/find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': config.mongodb.apiKey,
      },
      body: mongoRequest
    });

    // Transform MongoDB documents to BandMember format
    const bandMembers: BandMember[] = response.documents.map((doc: any, index: number) => ({
      id: doc._id || index + 1,
      name: doc.name || 'Unknown Member',
      instrument: doc.instrument || 'Unknown Instrument',
      image: doc.image || `/images/members/member-${(index % 4) + 1}.png`,
      description: doc.description || 'No description available.'
    }));

    return {
      success: true,
      data: bandMembers,
      timestamp: new Date().toISOString(),
      source: 'mongodb-data-api'
    };

  } catch (error) {
    console.error('Error fetching band members from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch band members',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
