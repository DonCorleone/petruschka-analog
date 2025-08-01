import { defineEventHandler, createError } from 'h3';
import { Gig, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract gigs from MongoDB data
function extractGigs(eventDocuments: any[]): Gig[] {
  const gigsWithDates: Array<Gig & { eventDate: Date }> = [];
  
  eventDocuments.forEach((doc: any) => {
    // Skip events without basic info
    if (!doc.eventInfos || doc.eventInfos.length === 0) return;
    if (!doc.start) return;
    
    // Get event info (use languageId 0 for German)
    const eventInfo = doc.eventInfos.find((info: any) => info.languageId === 0);
    if (!eventInfo || !eventInfo.name) return;
    
    // Parse event date
    let eventDate: Date | null = null;
    if (doc.start instanceof Date) {
      eventDate = doc.start;
    } else if (doc.start.$date) {
      eventDate = new Date(doc.start.$date);
    } else if (typeof doc.start === 'string') {
      eventDate = new Date(doc.start);
    }
    
    if (!eventDate || isNaN(eventDate.getTime())) return;
    
    // Extract pricing information
    let ticketUrl = eventInfo.url || '#';
    if (ticketUrl && !ticketUrl.startsWith('http')) {
      ticketUrl = 'https://' + ticketUrl;
    }
    
    // Format date components
    const dayOfWeek = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    const time = eventDate.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Build simple description for list view
    let description = '';
    if (doc.ticketTypes && doc.ticketTypes.length > 0) {
      const prices = doc.ticketTypes
        .filter((tt: any) => tt.price && tt.currency)
        .map((tt: any) => {
          const typeInfo = tt.ticketTypeInfos?.find((info: any) => info.name);
          const typeName = typeInfo?.name || 'Ticket';
          return `${typeName}: ${tt.currency} ${tt.price}`;
        });
      
      if (prices.length > 0) {
        description = `Tickets: ${prices.join(', ')}`;
      }
    }

    if (!description) {
      description = eventInfo.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
    }
    
    gigsWithDates.push({
      id: doc._id,
      date: { day, month },
      title: eventInfo.name,
      venue: eventInfo.location || 'Venue TBA',
      location: eventInfo.location || 'Location TBA',
      time: time,
      dayOfWeek: dayOfWeek,
      description: description,
      ticketUrl: eventInfo.url || '#',
      eventDate: eventDate,
      // Only include minimal data for list view - detailed data loaded on demand
      shortDescription: eventInfo.shortDescription || '',
      flyerImagePath: eventInfo.flyerImagePath || ''
    });
  });
  
  // Sort by date (newest first for demonstration)
  const sortedGigs = gigsWithDates.sort((a, b) => {
    return b.eventDate.getTime() - a.eventDate.getTime();
  });
  
  // Remove the eventDate property and return all events
  return sortedGigs.map(({ eventDate, ...gig }) => gig);
}

export default defineEventHandler(async (event): Promise<ApiResponse<Gig[]>> => {
  try {
    // Get current gigs data from MongoDB GigsFull collection
    const eventDocuments = await getMongoData({}, 'eventDb', 'GigsFull');
    
    let gigs: Gig[] = [];
    
    if (eventDocuments && eventDocuments.length > 0) {
      console.log('✅ Using MongoDB GigsFull data');
      gigs = extractGigs(eventDocuments);
    } else {
      console.log('⚠️ No gigs data found');
    }

    return {
      success: true,
      data: gigs,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching gigs from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch gigs',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
