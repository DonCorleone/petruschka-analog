import { defineEventHandler, createError } from 'h3';
import { Gig, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<Gig[]>> => {
  try {
    // Get all gigs data from optimized MongoDB Gigs view
    // No filter on googleAnalyticsTracker so we include theater events too
    const query = {}; // Empty query to match all documents
    console.log('🔍 Gigs query:', JSON.stringify(query));
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    console.log('🔍 Raw gigs data count:', gigsData?.length || 0);
    if (gigsData && gigsData.length > 0) {
      console.log('🔍 First gig sample:', gigsData[0]._id);
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
      
      // Debug upcoming events
      const now = new Date();
      const isUpcoming = parsedDate > now;
      console.log(`DEBUG: Event date: ${parsedDate.toISOString()}, Now: ${now.toISOString()}, Is upcoming: ${isUpcoming}`);
      
      // Filter out past events for the regular gigs view
      // This only applies to the /api/v1/gigs endpoint
      // Other endpoints (music, merch, history) will handle their own filtering
      if (!isUpcoming) {
        console.log(`DEBUG: Skipping past event: ${doc.name} at ${parsedDate.toISOString()}`);
        return;
      }
      
      // Extract ticket URL from event date if available, fall back to template URL
      let ticketUrl = eventDate.ticketUrl || doc.url || '#';
      if (ticketUrl && !ticketUrl.startsWith('http')) {
        ticketUrl = 'https://' + ticketUrl;
      }
      
      // Format date components
      const dayOfWeek = parsedDate.toLocaleDateString('de-DE', { weekday: 'long' });
      const day = parsedDate.getDate();
      const month = parsedDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
      const year = parsedDate.getFullYear();
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
      
      // Create a properly formatted date string for the detail view
      const eventDateString = parsedDate.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }) + ', ' + time + ' Uhr';
      
      gigsWithDates.push({
        id: eventId,
        date: { day, month, year },
        title: doc.name,
        venue: doc.location || 'Venue TBA',
        location: doc.location || 'Location TBA',
        time: time,
        dayOfWeek: dayOfWeek,
        description: description,
        ticketUrl: ticketUrl,
        eventDate: parsedDate,
        eventDateString: eventDateString, // Add the formatted event date string
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
  
  // Debug the final results
  console.log(`DEBUG: Found ${gigsWithDates.length} upcoming gigs after filtering`);
  if (gigsWithDates.length > 0) {
    console.log(`DEBUG: First upcoming gig: "${gigsWithDates[0].title}" on ${gigsWithDates[0].eventDate.toISOString()}`);
  } else {
    console.log(`DEBUG: No upcoming gigs found!`);
  }
  
  // Remove the eventDate property and return only upcoming events
  return sortedGigs.map(({ eventDate, ...gig }) => gig);
}
