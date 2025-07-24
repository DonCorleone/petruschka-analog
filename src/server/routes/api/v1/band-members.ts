import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // Get data from MongoDB native driver
    const mongoDocuments = await getMongoData();
    
    if (!mongoDocuments || mongoDocuments.length === 0) {
      throw new Error('No data found in MongoDB or connection failed');
    }
    
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
      timestamp: new Date().toISOString()
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
