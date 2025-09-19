import { defineEventHandler, createError } from 'h3';
import { ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<any[]>> => {
  try {
    // Get raw gig template data from optimized MongoDB Gigs view
    // This includes all the template-level data needed for client-side detail extraction
    const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee|Premiere", $options: "i" } };
    console.log('🔍 Gig templates query:', JSON.stringify(query));
    const gigsTemplateData = await getMongoData(query, 'eventDb', 'Gigs');
    
    console.log('🔍 Raw gig templates count:', gigsTemplateData?.length || 0);
    
    if (!gigsTemplateData || gigsTemplateData.length === 0) {
      console.log('⚠️ No gig template data found in view');
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    }

    console.log('✅ Using optimized MongoDB Gigs view for template data');

    return {
      success: true,
      data: gigsTemplateData,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching gig templates from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch gig templates',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
