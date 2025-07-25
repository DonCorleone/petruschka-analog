import { defineEventHandler, createError } from 'h3';
import { Album, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract CD albums from MongoDB event data
function extractCDAlbums(eventDocuments: any[]): Album[] {
  const albums: Album[] = [];
  
  eventDocuments.forEach((doc: any, docIndex: number) => {
    // Get event name (use languageId 0 for German)
    const eventName = doc.eventInfos?.find((info: any) => info.languageId === 0)?.name || 'Unknown Show';
    
    // Generate unique numeric ID
    let albumId: number;
    if (doc._id?.$numberLong) {
      albumId = parseInt(doc._id.$numberLong.toString().slice(-8)); // Use last 8 digits
    } else if (typeof doc._id === 'number') {
      albumId = doc._id;
    } else {
      albumId = docIndex + 1000; // Fallback to index-based ID
    }
    
    // Find CD ticket types
    doc.ticketTypes?.forEach((ticketType: any) => {
      const cdTicketInfo = ticketType.ticketTypeInfos?.find((info: any) => 
        info.name === 'CD' && info.languageId === 0 && info.imageUrl
      );
      
      if (cdTicketInfo) {
        albums.push({
          id: albumId,
          title: eventName,
          coverImage: cdTicketInfo.imageUrl,
          status: 'available' as const,
          price: 22, // Default price for CDs
          purchaseUrl: '#' // You can update this with real purchase URLs
        });
      }
    });
  });
  
  // Sort by newest first (assuming higher IDs are newer)
  return albums.sort((a, b) => b.id - a.id);
}

export default defineEventHandler(async (event): Promise<ApiResponse<Album[]>> => {
  try {
    // Get CD data from MongoDB native driver (optimized query)
    const query = { "ticketTypes.ticketTypeInfos.name": { $in: ["CD"] } };

    const eventDocuments = await getMongoData(query, 'eventDb', 'EventDetailsTaggedUsage');
    
    let albums: Album[] = [];
    
    if (eventDocuments && eventDocuments.length > 0) {
      console.log('✅ Using MongoDB CD data for albums');
      albums = extractCDAlbums(eventDocuments);
    } else {
      console.log('⚠️ No event data found, using empty albums array');
    }

    return {
      success: true,
      data: albums,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching albums data from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch albums',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
