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
    date: { day, month },
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

export default defineEventHandler(async (event): Promise<ApiResponse<Gig>> => {
  try {
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gig ID is required'
      });
    }

    // Convert string ID to number if needed
    const numericId = parseInt(id);
    const searchId = isNaN(numericId) ? id : numericId;
    
    // Get specific gig data from MongoDB GigsFull collection
    const eventDocuments = await getMongoData({ _id: searchId }, 'eventDb', 'EventDetails');
    
    if (!eventDocuments || eventDocuments.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Gig not found'
      });
    }

    console.log(`✅ Loading detailed gig data for ID: ${id}`);
    
    const detailedGig = extractDetailedGig(eventDocuments[0]);
    
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
