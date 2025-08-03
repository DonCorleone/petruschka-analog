import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // Get only active staff from MongoDB native driver (filtered at DB level)
    const mongoDocuments = await getMongoData({ 
      $or: [
        { active: { $ne: false } }, // active is not false
        { active: { $exists: false } } // active field doesn't exist (assume active)
      ]
    }, 'staticDb', 'staff');
    
    if (!mongoDocuments || mongoDocuments.length === 0) {
      throw new Error('No active staff found in MongoDB or connection failed');
    }
    
    console.log('✅ Using MongoDB native driver data (active staff only)');
    
    // Transform MongoDB documents to BandMember format
    const bandMembers: BandMember[] = mongoDocuments
      .sort((a: any, b: any) => (a.sortOrder || 999) - (b.sortOrder || 999)) // Sort by sortOrder
      .map((doc: any, index: number) => ({
        id: doc._id?.toString() || index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.topic || 'Unknown Topic', // MongoDB 'topic' maps to 'instrument'
        image: doc.image || `https://www.petruschka.ch/assets/images/staff/${encodeURIComponent(doc.name || 'Unknown Member')}.jpg?nf_resize=fit&h=240`,
        description: doc.bio || 'No description available.' // MongoDB 'bio' - full text, no truncation
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
