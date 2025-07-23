import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getEnv } from '../../../config/environment';
import { connectToDatabase } from '../../../config/mongodb';

interface MongoDBResponse {
  documents: any[];
}

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // During build time, return mock data to prevent timeouts
    const isBuildTime = process.env['BUILD_TIME'] === 'true';
    if (isBuildTime) {
      console.log('🔧 Build time detected, returning mock data');
      const mockMembers: BandMember[] = [
        {
          id: 1,
          name: 'Build Time Mock',
          instrument: 'Build',
          image: '/images/members/member-1.png',
          description: 'Mock data for build time'
        }
      ];
      
      return {
        success: true,
        data: mockMembers,
        timestamp: new Date().toISOString(),
        source: 'build-time-mock'
      };
    }

    // Try MongoDB Native Driver first
    try {
      console.log('🔄 Attempting MongoDB Native Driver connection...');
      const db = await connectToDatabase();
      const collection = db.collection('staff');
      
      const documents = await collection.find({}).toArray();
      console.log('✅ MongoDB Native Driver successful, found', documents.length, 'documents');
      
      // Transform MongoDB documents to BandMember format
      const bandMembers: BandMember[] = documents.map((doc: any, index: number) => ({
        id: doc._id?.toString() || index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.instrument || 'Unknown Instrument', 
        image: doc.image || `/images/members/member-${(index % 4) + 1}.png`, // Cycle through 1-4
        description: doc.description || 'No description available.'
      }));

      return {
        success: true,
        data: bandMembers,
        timestamp: new Date().toISOString(),
        source: 'mongodb-native-driver'
      };
      
    } catch (nativeError) {
      console.warn('⚠️ MongoDB Native Driver failed, falling back to Data API:', nativeError);
      
      // Fallback to MongoDB Data API
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
        image: doc.image || `/images/members/member-${(index % 4) + 1}.png`, // Cycle through 1-4
        description: doc.description || 'No description available.'
      }));

      return {
        success: true,
        data: bandMembers,
        timestamp: new Date().toISOString(),
        source: 'mongodb-data-api-fallback'
      };
    }

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
