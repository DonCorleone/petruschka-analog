import { defineEventHandler, createError } from 'h3';
import { MerchItem, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<MerchItem[]>> => {
  try {
    // Get Tournee data from optimized MongoDB Gigs view (filtered for Merch section)
    // Use regex to match "Tournee" anywhere in the googleAnalyticsTracker field
    const query = { "googleAnalyticsTracker": { $regex: "Tournee", $options: "i" } };

    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    let merchandise: MerchItem[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using optimized MongoDB Gigs view for merch with simplified imageUrl handling');
      merchandise = extractTourneeMerchFromView(gigsData);
    } else {
      console.log('⚠️ No Tournee data found in Gigs view');
    }

    return {
      success: true,
      data: merchandise,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching merch data from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch merchandise',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Helper function to extract Tournee items from optimized MongoDB Gigs view
function extractTourneeMerchFromView(gigsViewData: any[]): MerchItem[] {
  const merchItems: MerchItem[] = [];

  gigsViewData.forEach((doc: any, docIndex: number) => {
    // Generate unique numeric ID
    let merchId: number;
    if (typeof doc._id === 'number') {
      merchId = doc._id;
    } else if (typeof doc._id === 'string') {
      // Convert string ID to numeric hash
      merchId = doc._id.split('').reduce((hash: number, char: string) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
      }, 0);
      merchId = Math.abs(merchId) % 1000000; // Keep it manageable
    } else {
      merchId = docIndex + 2000; // Different base than albums
    }

    // Check if this gig has Tournee tickets in the pre-processed ticket details
    const tourneeTicket = doc.ticketDetails?.find((ticket: any) => 
      ticket.name && ticket.name.toLowerCase().includes('tournee')
    );

    if (tourneeTicket) {
      // Use Tournee-specific image from ticketDetails array (now includes imageUrl)
      let imageUrl = tourneeTicket.imageUrl || 
                     doc.flyerImagePath || 
                     doc.bannerImagePath || 
                     doc.imageUrl;
      
      if (imageUrl) {
        // Add netlify image resizing parameters for consistent 300x300 square images
        imageUrl = imageUrl.includes('?') 
          ? `https://petruschka.netlify.app/.netlify/images?url=${imageUrl}&nf_resize=smartcrop&w=300&h=300`
          : `https://petruschka.netlify.app/.netlify/images?url=${imageUrl}?nf_resize=smartcrop&w=300&h=300`;
      }


      merchItems.push({
        id: merchId,
        title: `${doc.name} - Tournee`,
        price: tourneeTicket.price || 25, // Use actual price or default
        image: imageUrl || '',
        description: `Kann gebucht werden!`,
        purchaseUrl: doc.url || '#'
      });
    }
  });

  // Sort by newest first (assuming higher IDs are newer)
  return merchItems.sort((a, b) => b.id - a.id);
}

