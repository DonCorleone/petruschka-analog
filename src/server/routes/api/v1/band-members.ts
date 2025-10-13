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
      // During prerendering/build, MongoDB might not be available - provide fallback
      console.warn('⚠️ No MongoDB data available, using fallback band members');
      
      const fallbackMembers: BandMember[] = [
        {
          id: 1,
          name: 'Linus Wieland',
          instrument: 'Musik',
          image: 'https://www.petruschka.ch/assets/images/staff/Linus%20Wieland.jpg?nf_resize=fit&h=240',
          description: 'Musiker und Komponist'
        }
      ];
      
      return {
        success: true,
        data: fallbackMembers,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('✅ Using MongoDB native driver data (active staff only)');
    
    // Transform MongoDB documents to BandMember format
    const bandMembers: BandMember[] = mongoDocuments
      .sort((a: any, b: any) => (a.sortOrder || 999) - (b.sortOrder || 999)) // Sort by sortOrder
      .map((doc: any, index: number) => ({
        id: doc._id?.toString() || index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.topic || 'Unknown Topic', // MongoDB 'topic' maps to 'instrument'
        image: doc.image || `https://petruschka.netlify.app/.netlify/images?url=https://petruschka-analog-mongo.onrender.com/images/members/${encodeURIComponent(doc.name || 'Unknown Member')}.jpg&nf_resize=fill&w=380`,
        description: doc.bio || 'No description available.' // MongoDB 'bio' - full text, no truncation
      }));

    return {
      success: true,
      data: bandMembers,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching band members from MongoDB:', error);
    
    // During prerendering, provide fallback instead of throwing error
    if (process.env['NODE_ENV'] === 'production' || !process.env['MONGODB_CONNECTION_STRING']) {
      console.warn('⚠️ MongoDB unavailable during build, using fallback band members');
      
      const fallbackMembers: BandMember[] = [
        {
          id: 1,
          name: 'Petruschka Theater',
          instrument: 'Ensemble',
          image: 'https://www.petruschka.ch/assets/images/staff/default.jpg?nf_resize=fit&w=380',
          description: 'Figurentheater Petruschka Ensemble'
        }
      ];
      
      return {
        success: true,
        data: fallbackMembers,
        timestamp: new Date().toISOString()
      };
    }
    
    // Return error response for development/runtime errors
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
