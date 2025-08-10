import { defineEventHandler, createError } from 'h3';
import { Gig, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract gigs from optimized MongoDB view
function extractGigsFromView(gigsViewData: any[]): Gig[] {
  const gigsWithDates: Array<Gig & { eventDate: Date }> = [];
  
  gigsViewData.forEach((doc: any) => {
    // Skip if no event dates
    if (!doc.eventDates || doc.eventDates.length === 0) return;
    
    // Process each event date for this gig template
    doc.eventDates.forEach((eventDate: any) => {
      // Parse event date
      let parsedDate: Date | null = null;
      if (eventDate.start instanceof Date) {
        parsedDate = eventDate.start;
      } else if (eventDate.start?.$date) {
        parsedDate = new Date(eventDate.start.$date);
      } else if (typeof eventDate.start === 'string') {
        parsedDate = new Date(eventDate.start);
      }
      
      if (!parsedDate || isNaN(parsedDate.getTime())) return;
      
      // TEMPORARY: Include ALL events for testing (remove date filtering)
      // TODO: Re-enable date filtering for production
      // const now = new Date();
      // const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      // if (parsedDate < oneYearAgo) return;
      
      // Extract pricing information from pre-processed ticket details
      let ticketUrl = doc.url || '#';
      if (ticketUrl && !ticketUrl.startsWith('http')) {
        ticketUrl = 'https://' + ticketUrl;
      }
      
      // Format date components
      const dayOfWeek = parsedDate.toLocaleDateString('de-DE', { weekday: 'long' });
      const day = parsedDate.getDate();
      const month = parsedDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
      const time = parsedDate.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Build simple description from pre-processed ticket details
      let description = '';
      if (doc.ticketDetails && doc.ticketDetails.length > 0) {
        const prices = doc.ticketDetails
          .filter((ticket: any) => ticket.price && ticket.currency)
          .map((ticket: any) => `${ticket.name}: ${ticket.currency} ${ticket.price}`);
        
        if (prices.length > 0) {
          description = `Tickets: ${prices.join(', ')}`;
        }
      }
      
      if (!description) {
        description = doc.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
      }
      
      // Generate unique numeric ID for this specific event date
      let eventId: number;
      if (typeof doc._id === 'number') {
        eventId = doc._id;
      } else if (typeof doc._id === 'string') {
        // Convert string ID to numeric hash combined with timestamp
        const hash = doc._id.split('').reduce((hash: number, char: string) => {
          return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
        }, 0);
        const timeComponent = Math.floor(parsedDate.getTime() / 1000) % 10000; // Use last 4 digits of timestamp
        eventId = Math.abs(hash) % 100000 + timeComponent; // Combine hash and time
      } else {
        eventId = Math.floor(Math.random() * 1000000);
      }
      
      gigsWithDates.push({
        id: eventId,
        date: { day, month },
        title: doc.name,
        venue: doc.location || 'Venue TBA',
        location: doc.location || 'Location TBA',
        time: time,
        dayOfWeek: dayOfWeek,
        description: description,
        ticketUrl: ticketUrl,
        eventDate: parsedDate,
        // Only include minimal data for list view - detailed data loaded on demand
        shortDescription: doc.shortDescription || '',
        flyerImagePath: doc.flyerImagePath || ''
      });
    });
  });
  
  // Sort by date (earliest upcoming first)
  const sortedGigs = gigsWithDates.sort((a, b) => {
    return a.eventDate.getTime() - b.eventDate.getTime();
  });
  
  // Remove the eventDate property and return only upcoming events
  return sortedGigs.map(({ eventDate, ...gig }) => gig);
}

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
    // Get current gigs data from optimized MongoDB Gigs view
    // Filter for items that have ticketable content (CD or Tournee)
    const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" } };
    console.log('🔍 Gigs query:', JSON.stringify(query));
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    console.log('🔍 Raw gigs data count:', gigsData?.length || 0);
    if (gigsData && gigsData.length > 0) {
      console.log('🔍 First gig sample:', JSON.stringify(gigsData[0], null, 2));
    }
    
    let gigs: Gig[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using optimized MongoDB Gigs view');
      gigs = extractGigsFromView(gigsData);
    } else {
      console.log('⚠️ No gigs data found in view');
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
