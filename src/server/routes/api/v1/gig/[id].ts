import { defineEventHandler, createError, getRouterParam } from 'h3';
import { Gig, ApiResponse } from '../../../../../shared/types';
import { getMongoData } from '../../../../lib/simple-mongo';

// Helper function to extract detailed gig from MongoDB data
function extractDetailedGig(doc: any): Gig | null {
  if (!doc.eventInfos || doc.eventInfos.length === 0) return null;
  if (!doc.start) return null;
  
  // Get event info (use languageId 0 for German)
  const eventInfo = doc.eventInfos.find((info: any) => info.languageId === 0);
  if (!eventInfo || !eventInfo.name) return null;
  
  // Parse event date
  let eventDate: Date | null = null;
  if (doc.start instanceof Date) {
    eventDate = doc.start;
  } else if (doc.start.$date) {
    eventDate = new Date(doc.start.$date);
  } else if (typeof doc.start === 'string') {
    eventDate = new Date(doc.start);
  }
  
  if (!eventDate || isNaN(eventDate.getTime())) return null;
  
  // Extract pricing information
  let ticketUrl = eventInfo.url || '#';
  if (ticketUrl && !ticketUrl.startsWith('http')) {
    ticketUrl = 'https://' + ticketUrl;
  }
  
  // Format date components
  const dayOfWeek = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  // Build basic description for fallback
  let description = eventInfo.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
  
  // Extract ticket types with detailed information
  const ticketTypes = doc.ticketTypes?.map((tt: any) => {
    const typeInfo = tt.ticketTypeInfos?.find((info: any) => info.name);
    return {
      name: typeInfo?.name || 'Ticket',
      price: tt.price || 0,
      currency: tt.currency || 'CHF',
      description: typeInfo?.description || ''
    };
  }) || [];

  // Extract duration from event times
  let duration = '';
  if (doc.begin && doc.end) {
    const beginTime = new Date(doc.begin);
    const endTime = new Date(doc.end);
    const durationMs = endTime.getTime() - beginTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (durationHours > 0) {
      duration = `ca. ${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
    } else if (durationMinutes > 0) {
      duration = `ca. ${durationMinutes}min`;
    }
  }
  
  return {
    id: doc._id,
    date: { day, month, year },
    title: eventInfo.name,
    venue: eventInfo.location || 'Venue TBA',
    location: eventInfo.location || 'Location TBA', 
    time: time,
    dayOfWeek: dayOfWeek,
    description: description,
    ticketUrl: ticketUrl,
    // Enhanced fields from legacy data
    longDescription: eventInfo.longDescription || '',
    shortDescription: eventInfo.shortDescription || '',
    artists: eventInfo.artists || eventInfo.artist || '',
    flyerImagePath: eventInfo.flyerImagePath || '',
    bannerImagePath: eventInfo.bannerImagePath || '',
    eventDateString: doc.eventDateString || eventDate.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ticketTypes: ticketTypes,
    duration: duration,
    ageRecommendation: eventInfo.shortDescription?.match(/ab (\d+) Jahr/)?.[0] || '',
    importantNotes: eventInfo.importantNotes || ''
  };
}

// Helper function to extract detailed gig from optimized MongoDB view
function extractDetailedGigFromView(doc: any, targetTimestamp?: number | null): Gig | null {
  // Skip if no basic info
  if (!doc.name || !doc.eventDates || doc.eventDates.length === 0) return null;
  
  // Find the specific event date if timestamp provided, otherwise use first upcoming
  let selectedEventDate: any = null;
  
  if (targetTimestamp) {
    // Find event date matching the timestamp
    selectedEventDate = doc.eventDates.find((eventDate: any) => {
      const eventTime = eventDate.start instanceof Date 
        ? eventDate.start.getTime()
        : eventDate.start?.$date 
          ? new Date(eventDate.start.$date).getTime()
          : new Date(eventDate.start).getTime();
      return Math.abs(eventTime - targetTimestamp) < 1000; // Allow 1 second tolerance
    });
  }
  
  // If no specific date found, use first upcoming event
  if (!selectedEventDate) {
    const now = new Date();
    selectedEventDate = doc.eventDates.find((eventDate: any) => {
      const eventTime = eventDate.start instanceof Date 
        ? eventDate.start
        : eventDate.start?.$date 
          ? new Date(eventDate.start.$date)
          : new Date(eventDate.start);
      return eventTime > now;
    }) || doc.eventDates[0]; // Fallback to first if none upcoming
  }
  
  if (!selectedEventDate) return null;
  
  // Parse event date
  let eventDate: Date | null = null;
  if (selectedEventDate.start instanceof Date) {
    eventDate = selectedEventDate.start;
  } else if (selectedEventDate.start?.$date) {
    eventDate = new Date(selectedEventDate.start.$date);
  } else if (typeof selectedEventDate.start === 'string') {
    eventDate = new Date(selectedEventDate.start);
  }
  
  if (!eventDate || isNaN(eventDate.getTime())) return null;
  
  // Extract pricing information from pre-processed ticket details
  let ticketUrl = doc.url || '#';
  if (ticketUrl && !ticketUrl.startsWith('http')) {
    ticketUrl = 'https://' + ticketUrl;
  }
  
  // Format date components
  const dayOfWeek = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  // Build enhanced description from pre-processed ticket details
  let description = doc.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
  
  // Extract ticket types with detailed information from view data
  const ticketTypes = doc.ticketDetails?.map((ticket: any) => ({
    name: ticket.name || 'Ticket',
    price: ticket.price || 0,
    currency: ticket.currency || 'CHF',
    description: ''
  })) || [];

  // Calculate duration if end time is available
  let duration = '';
  if (selectedEventDate.end) {
    let endDate: Date | null = null;
    if (selectedEventDate.end instanceof Date) {
      endDate = selectedEventDate.end;
    } else if (selectedEventDate.end?.$date) {
      endDate = new Date(selectedEventDate.end.$date);
    } else if (typeof selectedEventDate.end === 'string') {
      endDate = new Date(selectedEventDate.end);
    }
    
    if (endDate && !isNaN(endDate.getTime())) {
      const durationMs = endDate.getTime() - eventDate.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (durationHours > 0) {
        duration = `ca. ${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
      } else if (durationMinutes > 0) {
        duration = `ca. ${durationMinutes}min`;
      }
    }
  }
  
  // Generate numeric ID for this specific event
  let eventId: number;
  if (typeof doc._id === 'number') {
    eventId = doc._id;
  } else if (typeof doc._id === 'string') {
    const hash = doc._id.split('').reduce((hash: number, char: string) => {
      return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
    }, 0);
    const timeComponent = Math.floor(eventDate.getTime() / 1000) % 10000;
    eventId = Math.abs(hash) % 100000 + timeComponent;
  } else {
    eventId = Math.floor(Math.random() * 1000000);
  }
  
  return {
    id: eventId,
    date: { day, month, year },
    title: doc.name,
    venue: doc.location || 'Venue TBA',
    location: doc.location || 'Location TBA', 
    time: time,
    dayOfWeek: dayOfWeek,
    description: description,
    ticketUrl: ticketUrl,
    // Enhanced fields from optimized view data
    longDescription: doc.longDescription || '',
    shortDescription: doc.shortDescription || '',
    artists: doc.artists || '',
    flyerImagePath: doc.flyerImagePath || '',
    bannerImagePath: doc.bannerImagePath || '',
    eventDateString: selectedEventDate.eventDateString || eventDate.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ticketTypes: ticketTypes,
    duration: duration,
    ageRecommendation: doc.shortDescription?.match(/ab (\d+) Jahr/)?.[0] || '',
    importantNotes: doc.importantNotes || ''
  };
}

export default defineEventHandler(async (event): Promise<ApiResponse<Gig>> => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gig ID is required'
      });
    }

    // Parse composite ID (format: "templateId_timestamp" or just templateId)
    let templateId: string | number;
    let targetTimestamp: number | null = null;
    
    if (id.includes('_')) {
      const parts = id.split('_');
      templateId = parts[0];
      targetTimestamp = parseInt(parts[1]);
    } else {
      // Legacy numeric ID or simple template ID
      const numericId = parseInt(id);
      templateId = isNaN(numericId) ? id : numericId;
    }
    
    // Get gig template data from optimized MongoDB Gigs view
    // Filter by ID and ensure it's from ticketable sections (CD or Tournee)
    const query = { 
      _id: templateId,
      'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" }
    };
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    if (!gigsData || gigsData.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Gig not found'
      });
    }

    console.log(`✅ Loading detailed gig data for template ID: ${templateId}`);
    
    const detailedGig = extractDetailedGigFromView(gigsData[0], targetTimestamp);
    
    console.log(`✅ gig ${JSON.stringify(detailedGig)}`);

    if (!detailedGig) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Gig data could not be processed'
      });
    }

    return {
      success: true,
      data: detailedGig,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching gig details:', error);
    
    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    // Return generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch gig details',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
