import { defineEventHandler, createError } from 'h3';
import { Update, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

export default defineEventHandler(async (): Promise<ApiResponse<Update[]>> => {
  try {
    // Get upcoming premieres data from optimized MongoDB Gigs view
    // Get ALL premieres regardless of googleAnalyticsTracker value
    const query = { 'premiereDate': { $exists: true } };
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    let updates: Update[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using MongoDB Gigs view for updates - showing upcoming premieres');
      updates = extractUpdatesFromView(gigsData);
    } else {
      console.log('⚠️ No upcoming premieres found in the database, using fallback update');
      // Fallback update based on ID 3 mock structure
      updates = [
        {
          id: 1001,
          title: 'Neue Stücke in Vorbereitung',
          description: 'Das Figurentheater PETRUSCHKA arbeitet an neuen musikalischen Märchen für die kommende Saison.',
          ctaText: 'Mehr erfahren',
          ctaUrl: 'https://www.petruschka.ch',
          mediaType: 'image',
          mediaThumb: '/images/image-thumb-1.jpg'
        }
      ];
    }

    return {
      success: true,
      data: updates,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching updates from MongoDB:', error);
    
    // Return error response while maintaining API contract
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch updates',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});


// Helper function to extract updates from optimized MongoDB Gigs view
function extractUpdatesFromView(gigsViewData: any[]): Update[] {
  const updatesWithDates: Array<Update & { sortDate: Date }> = [];
  
  gigsViewData.forEach((doc: any) => {
    // Only show items that have a premiere date
    if (!doc.premiereDate || !doc.eventDates || doc.eventDates.length === 0) return;
    
    // Parse premiere date
    let premiereDate: Date | null = null;
    if (doc.premiereDate instanceof Date) {
      premiereDate = doc.premiereDate;
    } else if (doc.premiereDate?.$date) {
      premiereDate = new Date(doc.premiereDate.$date);
    } else if (typeof doc.premiereDate === 'string') {
      premiereDate = new Date(doc.premiereDate);
    }
    
    if (!premiereDate) return;
    
    // Check if event has any upcoming dates (even if premiere was in the past)
    const now = new Date();
    let hasUpcomingDate = false;
    
    // Check if any event date is upcoming
    for (const eventDate of doc.eventDates) {
      let parsedDate: Date | null = null;
      if (eventDate.start instanceof Date) {
        parsedDate = eventDate.start;
      } else if (eventDate.start?.$date) {
        parsedDate = new Date(eventDate.start.$date);
      } else if (typeof eventDate.start === 'string') {
        parsedDate = new Date(eventDate.start);
      }
      
      if (parsedDate && parsedDate > now) {
        hasUpcomingDate = true;
        break;
      }
    }
    
    // Only include upcoming events
    if (!hasUpcomingDate) return;
    
    // Process image URL for media thumb
    let imageUrl = 'https://petruschka.netlify.app/.netlify/images?url=';
    let mediaThumb = '';
    
    if (doc.flyerImagePath) {
      mediaThumb = doc.flyerImagePath.includes('?') 
        ? `${imageUrl}${doc.flyerImagePath}&nf_resize=fit&w=180`
        : `${imageUrl}${doc.flyerImagePath}?nf_resize=fit&w=180`;
    } else if (doc.bannerImagePath) {
      mediaThumb = doc.bannerImagePath.includes('?') 
        ? `${imageUrl}${doc.bannerImagePath}&nf_resize=fit&w=180`
        : `${imageUrl}${doc.bannerImagePath}?nf_resize=fit&w=180`;
    }
    
    // Determine if this is a future event (for countdown)
    const isFuture = premiereDate > now;
    const isCurrentlyRunning = !isFuture && hasUpcomingDate;

    // Create update content
    let title = `Premiere: "${doc.name}"`;
    let description = doc.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
    let ctaText = 'Mehr erfahren';

    // Link to gigs section instead of external ticketing URL
    let ctaUrl = '#gigs';
    
    // Generate numeric ID from doc._id
    let numericId: number;
    if (typeof doc._id === 'string') {
      // Convert string ID to numeric hash
      numericId = doc._id.split('').reduce((hash: number, char: string) => {
        return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
      }, 0);
      numericId = Math.abs(numericId) % 1000000; // Keep it manageable
    } else {
      numericId = doc._id || Math.floor(Math.random() * 1000000);
    }
    
    updatesWithDates.push({
      id: numericId,
      title: title,
      description: description,
      ctaText: ctaText,
      ctaUrl: ctaUrl,
      mediaType: 'image',
      mediaThumb: mediaThumb,
      isCountdown: isFuture,
      countdownDate: isFuture ? premiereDate : undefined,
      isCurrentlyRunning: isCurrentlyRunning,
      sortDate: premiereDate
    });
  });
  
  // Sort by date (upcoming events first, then recent ones)
  return updatesWithDates
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 3) // Limit to 3 most relevant updates
    .map(({ sortDate, ...update }) => update);
}
