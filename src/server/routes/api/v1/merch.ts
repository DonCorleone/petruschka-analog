import { defineEventHandler, createError } from 'h3';
import { MerchItem, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

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
      // Process image URL for consistent sizing
      let imageUrl = doc.flyerImagePath || doc.bannerImagePath || doc.imageUrl;
      if (imageUrl) {
        imageUrl = `https://petruschka.netlify.app/.netlify/images?url=${imageUrl}&nf_resize=fit&w=235`;
      }

      merchItems.push({
        id: merchId,
        title: `${doc.name} - Tournee Ticket`,
        price: tourneeTicket.price || 25, // Use actual price or default
        image: imageUrl || '',
        description: doc.shortDescription || 'Tournee-Ticket für das musikalische Märchen',
        purchaseUrl: doc.url || '#'
      });
    }
  });

  // Sort by newest first (assuming higher IDs are newer)
  return merchItems.sort((a, b) => b.id - a.id);
}

// Helper function to extract Tournee items from MongoDB event data
function extractTourneeMerch(eventDocuments: any[]): MerchItem[] {
  const merchItems: MerchItem[] = [];
  
  eventDocuments.forEach((doc: any, docIndex: number) => {
    // Get event name (use languageId 0 for German)
    const eventName = doc.eventInfos?.find((info: any) => info.languageId === 0)?.name || 'Unknown Show';
    
    // Generate unique numeric ID
    let itemId: number;
    if (doc._id?.$numberLong) {
      itemId = parseInt(doc._id.$numberLong.toString().slice(-8)); // Use last 8 digits
    } else if (typeof doc._id === 'number') {
      itemId = doc._id;
    } else {
      itemId = docIndex + 2000; // Fallback to index-based ID (different range from albums)
    }
    
    // Find Tournee ticket types
    doc.ticketTypes?.forEach((ticketType: any) => {
      const tourneeTicketInfo = ticketType.ticketTypeInfos?.find((info: any) => 
        info.name === 'Tournee' && info.languageId === 0 && info.imageUrl
      );
      
      if (tourneeTicketInfo) {
        // Add netlify image resizing parameters for consistent 300x300 square images
        const resizedImageUrl = tourneeTicketInfo.imageUrl.includes('?') 
          ? `${tourneeTicketInfo.imageUrl}&nf_resize=smartcrop&w=300&h=300`
          : `${tourneeTicketInfo.imageUrl}?nf_resize=smartcrop&w=300&h=300`;
          
        merchItems.push({
          id: itemId,
          title: `${eventName} - Tournee`,
          price: 25, // Default price for tour merchandise
          image: resizedImageUrl,
          description: `"${eventName}" kann gebucht werden!`,
          purchaseUrl: '#' // You can update this with real purchase URLs
        });
      }
    });
  });
  
  // Sort by newest first (assuming higher IDs are newer)
  return merchItems.sort((a, b) => b.id - a.id);
}

export default defineEventHandler(async (event): Promise<ApiResponse<MerchItem[]>> => {
  try {
    // Get Tournee data from optimized MongoDB Gigs view (filtered for Merch section)
    // Use regex to match "Tournee" anywhere in the googleAnalyticsTracker field
    const query = { "googleAnalyticsTracker": { $regex: "Tournee", $options: "i" } };

    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    let merchandise: MerchItem[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using optimized MongoDB Gigs view for merch');
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
