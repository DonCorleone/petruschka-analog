import { defineEventHandler, createError } from 'h3';
import { PastEvent, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract past events from optimized MongoDB Gigs view
function extractPastEventsFromView(gigsViewData: any[]): PastEvent[] {
  const pastEvents: PastEvent[] = [];
  
  gigsViewData.forEach((doc: any) => {
    if (!doc.premiereDate) return;
    
    // Parse premiere date
    let startDate: Date | null = null;
    if (doc.premiereDate instanceof Date) {
      startDate = doc.premiereDate;
    } else if (doc.premiereDate?.$date) {
      startDate = new Date(doc.premiereDate.$date);
    } else if (typeof doc.premiereDate === 'string') {
      startDate = new Date(doc.premiereDate);
    }
    
    if (!startDate) return;
    
    // Only include events that are actually in the past
    const now = new Date();
    if (startDate >= now) return;
    
    const formattedDate = startDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
    });
    
    // Extract year and season from template ID (e.g., "2024s" -> 2024, summer)
    const idMatch = doc._id.toString().match(/(\d{4})([swfh])/);
    const year = idMatch ? idMatch[1] : startDate.getFullYear().toString();
    const seasonLetter = idMatch ? idMatch[2] : '';
    
    const seasonNames: {[key: string]: string} = {
      's': 'Sommer',
      'w': 'Winter', 
      'h': 'Herbst',
      'f': 'Frühling'
    };
    
    // Process image URL for consistent sizing
    let imageUrl = '';
    if (doc.flyerImagePath) {
      imageUrl = `https://petruschka.netlify.app/.netlify/images?url=${doc.flyerImagePath}&nf_resize=fit&w=145`;
    }
    
    pastEvents.push({
      id: doc._id.toString(),
      title: doc.name,
      image: imageUrl,
      description: doc.shortDescription || 'Keine Beschreibung verfügbar.',
      date: formattedDate,
      year: year,
      season: seasonNames[seasonLetter] || seasonLetter
    });
  });
  
  // Sort by year descending (newest first), then by season
  return pastEvents.sort((a, b) => {
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;
    
    // Season order: Frühling, Sommer, Herbst, Winter
    const seasonOrder = { 'Frühling': 1, 'Sommer': 2, 'Herbst': 3, 'Winter': 4 };
    const aOrder = seasonOrder[a.season as keyof typeof seasonOrder] || 999;
    const bOrder = seasonOrder[b.season as keyof typeof seasonOrder] || 999;
    return bOrder - aOrder;
  });
}

// Helper function to extract past events from MongoDB data
function extractPastEvents(eventDocuments: any[]): PastEvent[] {
  const pastEvents: PastEvent[] = [];
  
  eventDocuments.forEach((doc: any) => {
    const eventDetail = doc.eventDetail;
    if (!eventDetail) return;
    
    // Get event info (use languageId 0 for German)
    const eventInfo = eventDetail.eventInfos?.find((info: any) => info.languageId === 0);
    if (!eventInfo) return;
    
    // Extract date information - handle both MongoDB Date objects and extended JSON format
    let startDate: Date | null = null;
    
    if (eventDetail.start) {
      if (eventDetail.start instanceof Date) {
        // Direct Date object from MongoDB driver
        startDate = eventDetail.start;
      } else if (eventDetail.start.$date) {
        // Extended JSON format: {"$date": "2024-09-15T13:00:00.000Z"}
        startDate = new Date(eventDetail.start.$date);
      } else if (typeof eventDetail.start === 'string') {
        // ISO string format
        startDate = new Date(eventDetail.start);
      } else if (typeof eventDetail.start === 'number') {
        // Unix timestamp
        startDate = new Date(eventDetail.start);
      }
    }
    
    const formattedDate = startDate ? startDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
    }) : 'Datum unbekannt';
    
    // Extract year and season from ID (e.g., "2024s" -> 2024, summer)
    const idMatch = doc._id.match(/(\d{4})([swfh])/);
    const year = idMatch ? idMatch[1] : 'Unknown';
    const seasonLetter = idMatch ? idMatch[2] : '';
    
    const seasonNames: {[key: string]: string} = {
      's': 'Sommer',
      'w': 'Winter', 
      'h': 'Herbst',
      'f': 'Frühling'
    };
    
    // Process image URL for consistent sizing
    let imageUrl = `https://petruschka.netlify.app/.netlify/images?url=${eventInfo.flyerImagePath}&nf_resize=fit&w=145`

    
    pastEvents.push({
      id: eventDetail._id,
      title: eventInfo.name,
      image: imageUrl,
      description: eventInfo.shortDescription || 'Keine Beschreibung verfügbar.',
      date: formattedDate,
      year: year,
      season: seasonNames[seasonLetter] || seasonLetter
    });
  });
  
  // Sort by year descending (newest first), then by season
  return pastEvents.sort((a, b) => {
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;
    
    // Season order: Frühling, Sommer, Herbst, Winter
    const seasonOrder = { 'Frühling': 1, 'Sommer': 2, 'Herbst': 3, 'Winter': 4 };
    const aOrder = seasonOrder[a.season as keyof typeof seasonOrder] || 999;
    const bOrder = seasonOrder[b.season as keyof typeof seasonOrder] || 999;
    return bOrder - aOrder;
  });
}

export default defineEventHandler(async (event): Promise<ApiResponse<PastEvent[]>> => {
  try {
    // Get past events data from optimized MongoDB Gigs view
    // Filter for items from any section (CD, Tournee, Premiere) that have premiere dates (History section)
    const query = { 
      'premiereDate': { $exists: true },
      'googleAnalyticsTracker': { $regex: "CD|Tournee|Premiere", $options: "i" }
    };
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    let pastEvents: PastEvent[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using optimized MongoDB Gigs view for past events');
      pastEvents = extractPastEventsFromView(gigsData);
    } else {
      console.log('⚠️ No past events data found in Gigs view');
    }

    return {
      success: true,
      data: pastEvents,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching past events from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch past events',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
