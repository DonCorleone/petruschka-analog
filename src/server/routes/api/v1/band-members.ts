import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getDatabase } from '../../../config/mongodb';

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // Get MongoDB database instance
    const db = await getDatabase();
    
    // Get the staff collection
    const staffCollection = db.collection('staff');
    
    // Fetch all band members from MongoDB
    const documents = await staffCollection.find({ "active": true }).toArray();
    
    // Transform MongoDB documents to BandMember format
    const bandMembers: BandMember[] = documents.map((doc: any, index: number) => {
      // Ensure we only use valid image paths (1-4)
      let imagePath = `/images/members/member-${(index % 4) + 1}.png`;
      
      // If doc has a valid image path, use it, otherwise use fallback
      if (doc.image && doc.image.includes('member-') && doc.image.match(/member-[1-4]\.png/)) {
        imagePath = doc.image;
      }
      
      return {
        id: doc._id?.toString() || index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.instrument || 'Unknown Instrument',
        image: imagePath,
        description: doc.description || 'No description available.'
      };
    });

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
