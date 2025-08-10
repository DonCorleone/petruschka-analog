import { defineEventHandler, createError } from 'h3';
import { Album, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract CD albums from optimized MongoDB Gigs view
function extractCDAlbumsFromView(gigsViewData: any[]): Album[] {
  const albums: Album[] = [];

  gigsViewData.forEach((doc: any, docIndex: number) => {
    // Generate unique numeric ID
    let albumId: number;
    if (typeof doc._id === 'number') {
      albumId = doc._id;
    } else if (typeof doc._id === 'string') {
      // Convert string ID to numeric hash
      albumId = doc._id.split('').reduce((hash: number, char: string) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
      }, 0);
      albumId = Math.abs(albumId) % 1000000; // Keep it manageable
    } else {
      albumId = docIndex + 1000; // Fallback to index-based ID
    }

    // Check if this gig has CD tickets in the pre-processed ticket details
    const cdTicket = doc.ticketDetails?.find((ticket: any) => 
      ticket.name && ticket.name.toLowerCase().includes('cd')
    );

    if (cdTicket) {
      // Process image URL for consistent sizing
      let imageUrl = doc.flyerImagePath || doc.bannerImagePath || doc.imageUrl;
      if (imageUrl) {
        imageUrl = `https://petruschka.netlify.app/.netlify/images?url=${imageUrl}&nf_resize=fit&w=235`;
      }

      albums.push({
        id: albumId,
        title: doc.name,
        coverImage: imageUrl || '',
        status: 'available' as const,
        price: cdTicket.price || 22, // Use actual price or default
        purchaseUrl: doc.url || '#',
      });
    }
  });

  // Sort by newest first (assuming higher IDs are newer)
  return albums.sort((a, b) => b.id - a.id);
}

// Helper function to extract CD albums from MongoDB event data
function extractCDAlbums(eventDocuments: any[]): Album[] {
  const albums: Album[] = [];

  eventDocuments.forEach((doc: any, docIndex: number) => {
    // Get event name (use languageId 0 for German)
    const eventName =
      doc.eventInfos?.find((info: any) => info.languageId === 0)?.name ||
      'Unknown Show';

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
      const cdTicketInfo = ticketType.ticketTypeInfos?.find(
        (info: any) =>
          info.name === 'CD' && info.languageId === 0 && info.imageUrl
      );

      // Process image URL for consistent sizing
      let imageUrl = `https://petruschka.netlify.app/.netlify/images?url=${cdTicketInfo?.imageUrl}&nf_resize=fit&w=235`;

      if (cdTicketInfo) {
        albums.push({
          id: albumId,
          title: eventName,
          coverImage: imageUrl,
          status: 'available' as const,
          price: 22, // Default price for CDs
          purchaseUrl: '#', // You can update this with real purchase URLs
        });
      }
    });
  });

  // Sort by newest first (assuming higher IDs are newer)
  return albums.sort((a, b) => b.id - a.id);
}

export default defineEventHandler(
  async (event): Promise<ApiResponse<Album[]>> => {
    try {
      // Get CD data from optimized MongoDB Gigs view (filtered for Music section)
      // Use regex to match "CD" anywhere in the googleAnalyticsTracker field
      const query = { 'googleAnalyticsTracker': { $regex: "CD", $options: "i" } };

      const gigsData = await getMongoData(
        query,
        'eventDb',
        'Gigs'
      );

      let albums: Album[] = [];

      if (gigsData && gigsData.length > 0) {
        console.log('✅ Using optimized MongoDB Gigs view for albums');
        albums = extractCDAlbumsFromView(gigsData);
      } else {
        console.log('⚠️ No CD data found in Gigs view, using empty albums array');
      }

      return {
        success: true,
        data: albums,
        timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);
