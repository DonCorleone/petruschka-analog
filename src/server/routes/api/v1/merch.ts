import { defineEventHandler, createError } from 'h3';
import { MerchItem, Update, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

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

const MOCK_UPDATES: Update[] = [
  {
    id: 1,
    title: "Decibel's EP is out July 18th 2024",
    description: 'Our forthcoming EP is available for pre-order via pledgemusic.com now',
    ctaText: 'Pre-order Now',
    ctaUrl: '#',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/embed/mCHUw7ACS8o',
    mediaThumb: '/images/video-thumb-1.jpg',
    isCountdown: true,
    countdownDate: 'July 18, 2025'
  },
  {
    id: 2,
    title: 'We are performing at The Fleece, London this Saturday night 9:00pm',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.',
    ctaText: 'Buy Tickets',
    ctaUrl: '#'
  },
  {
    id: 3,
    title: 'Help to fund our new album via KickStarter',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes.',
    ctaText: 'Support Us',
    ctaUrl: '#',
    mediaType: 'image',
    mediaThumb: '/images/image-thumb-1.jpg'
  }
];

export default defineEventHandler(async (event): Promise<ApiResponse<{ merchandise: MerchItem[], updates: Update[] }>> => {
  try {
    // Get Tournee data from MongoDB native driver (optimized query)

    const query = { "ticketTypes.ticketTypeInfos.name": { $in: ["Tournee"] } };

    const eventDocuments = await getMongoData(query, 'eventDb', 'EventDetailsTaggedUsage');
    
    let merchandise: MerchItem[] = [];
    
    if (eventDocuments && eventDocuments.length > 0) {
      console.log('✅ Using MongoDB Tournee data for merch');
      merchandise = extractTourneeMerch(eventDocuments);
    } else {
      console.log('⚠️ No event data found, using empty merch array');
    }

    return {
      success: true,
      data: {
        merchandise,
        updates: MOCK_UPDATES
      },
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
