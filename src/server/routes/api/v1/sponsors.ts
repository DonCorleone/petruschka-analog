import { defineEventHandler, createError } from 'h3';
import { Sponsor, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<Sponsor[]>> => {
  try {
    // Get sponsors data from MongoDB
    const sponsorsData = await getMongoData({}, 'sponsorsDb', 'sponsors');
    
    if (!sponsorsData || sponsorsData.length === 0) {
      console.warn('⚠️ No sponsors data available (expected during local builds)');
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('✅ Using MongoDB sponsors data');
    
    // Transform MongoDB documents to Sponsor format
    const sponsors: Sponsor[] = sponsorsData.map((doc: any) => {
      // Calculate average sponsorship (total shares divided by number of events)
      const totalShare = doc.events?.reduce((sum: number, event: any) => sum + (event.share || 0), 0) || 0;
      const eventCount = doc.events?.length || 1;
      const averageShare = totalShare / eventCount;
      
      // Process image URL
      let imageUrl = '';
      if (doc.image && doc.image.trim() !== '') {
        imageUrl = `https://www.petruschka.ch/assets/images/sponsoren/sponsors_${doc.image}?nf_resize=fit&w=200`;
      } else {
        // Use placeholder identifier for sponsors without images
        imageUrl = 'PLACEHOLDER';
      }
      
      return {
        id: doc._id?.toString() || doc.name,
        name: doc.name,
        url: doc.url || '#',
        image: imageUrl,
        events: doc.events || [],
        totalShare: averageShare, // Now represents average share
        // Calculate size class based on average sponsorship
        sizeClass: getSizeClass(averageShare)
      };
    });
    
    // Sort by average share (biggest average sponsors first)
    sponsors.sort((a, b) => b.totalShare - a.totalShare);

    return {
      success: true,
      data: sponsors,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.warn('⚠️ Sponsors data unavailable (expected during local builds):', error);
    
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString()
    };
  }
});

// Helper function to determine size class based on average sponsorship amount
function getSizeClass(averageShare: number): string {
  if (averageShare >= 0.3) return 'sponsor-xl';      // 30%+ average sponsorship
  if (averageShare >= 0.2) return 'sponsor-lg';      // 20-29% average sponsorship  
  if (averageShare >= 0.15) return 'sponsor-md';     // 15-19% average sponsorship
  if (averageShare >= 0.1) return 'sponsor-sm';      // 10-14% average sponsorship
  return 'sponsor-xs';                                // < 10% average sponsorship
}
