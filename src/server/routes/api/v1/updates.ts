import { defineEventHandler, createError } from 'h3';
import { Update, ApiResponse } from '../../../../shared/types';
import { getMongoData } from '../../../lib/simple-mongo';

// Helper function to extract updates from optimized MongoDB Gigs view
function extractUpdatesFromView(gigsViewData: any[]): Update[] {
  const updatesWithDates: Array<Update & { sortDate: Date }> = [];
  
  gigsViewData.forEach((doc: any) => {
    // Only show items that have a premiere date (indicating they're in Promo/History sections)
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
    
    // Only include recent/upcoming events (within last 2 years or future)
    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
    
    if (premiereDate < twoYearsAgo) return;
    
    // Process image URL for media thumb
    let imageUrl = 'https://petruschka.netlify.app/.netlify/images?url=';
    let mediaThumb = '';
    
    if (doc.flyerImagePath) {
      mediaThumb = doc.flyerImagePath.includes('?') 
        ? `${imageUrl}${doc.flyerImagePath}&nf_resize=fit&w=105`
        : `${imageUrl}${doc.flyerImagePath}?nf_resize=fit&w=105`;
    } else if (doc.bannerImagePath) {
      mediaThumb = doc.bannerImagePath.includes('?') 
        ? `${imageUrl}${doc.bannerImagePath}&nf_resize=fit&w=105`
        : `${imageUrl}${doc.bannerImagePath}?nf_resize=fit&w=105`;
    }
    
    // Determine if this is a future event (for countdown)
    const isFuture = premiereDate > now;
    
    // Create update content
    let title = `Premiere: "${doc.name}"`;
    let description = doc.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
    let ctaText = 'Mehr erfahren';
    
    // Extract ticket URL or use event URL
    let ctaUrl = doc.url || '#';
    if (ctaUrl && !ctaUrl.startsWith('http')) {
      ctaUrl = 'https://' + ctaUrl;
    }
    
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
      countdownDate: isFuture ? premiereDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : undefined,
      sortDate: premiereDate
    });
  });
  
  // Sort by date (upcoming events first, then recent ones)
  return updatesWithDates
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 3) // Limit to 3 most relevant updates
    .map(({ sortDate, ...update }) => update);
}

// Helper function to extract updates from MongoDB data
function extractUpdates(premiereDocuments: any[]): Update[] {
  const updatesWithDates: Array<Update & { sortDate: Date }> = [];
  
  premiereDocuments.forEach((doc: any) => {
    const eventDetail = doc.eventDetail;
    if (!eventDetail) return;
    
    // Get event info (use languageId 0 for German)
    const eventInfo = eventDetail.eventInfos?.find((info: any) => info.languageId === 0);
    if (!eventInfo) return;
    
    // Parse event date
    let eventDate: Date | null = null;
    if (eventDetail.start instanceof Date) {
      eventDate = eventDetail.start;
    } else if (eventDetail.start?.$date) {
      eventDate = new Date(eventDetail.start.$date);
    }
    
    if (!eventDate) return;
    
    // Only include recent events (within last 2 years for demonstration)
    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
    
    if (eventDate < twoYearsAgo) return;
    
    // Process banner image for media thumb
        // Process image URL for consistent sizing
    let imageUrl = 'https://petruschka.netlify.app/.netlify/images?url=';

    let mediaThumb = '';
    if (eventInfo.flyerImagePath) {
      mediaThumb = eventInfo.flyerImagePath.includes('?') 
        ? `${imageUrl}${eventInfo.flyerImagePath}&nf_resize=fit&w=105`
        : `${imageUrl}${eventInfo.flyerImagePath}?nf_resize=fit&w=105`;
    } else if (eventInfo.bannerImagePath) {
      mediaThumb = eventInfo.bannerImagePath.includes('?') 
        ? `${imageUrl}${eventInfo.bannerImagePath}&nf_resize=fit&w=105`
        : `${imageUrl}${eventInfo.bannerImagePath}?nf_resize=fit&w=105`;
    } 
    
    // Determine if this is a future event (for countdown)
    const isFuture = eventDate > now;
    
    // Create update based on whether it's upcoming or recent (all will be recent for demo data)
    let title, description, ctaText;
    
    title = `Premiere: "${eventInfo.name}"`;
    description = eventInfo.shortDescription || 'Ein musikalisches Märchen vom Figurentheater PETRUSCHKA';
    ctaText = 'Mehr erfahren';
    
    // Extract ticket URL or use event URL
    let ctaUrl = eventInfo.url || '#';
    if (ctaUrl && !ctaUrl.startsWith('http')) {
      ctaUrl = 'https://' + ctaUrl;
    }
    
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
      countdownDate: isFuture ? eventDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : undefined,
      sortDate: eventDate
    });
  });
  
  // Sort by date (upcoming events first, then recent ones)
  return updatesWithDates
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 3) // Limit to 3 most relevant updates
    .map(({ sortDate, ...update }) => update);
}

export default defineEventHandler(async (event): Promise<ApiResponse<Update[]>> => {
  try {
    // Get upcoming premieres data from optimized MongoDB Gigs view
    // Filter for promo-worthy content (CD or Tournee sections)
    const query = { 'googleAnalyticsTracker': { $regex: "CD|Tournee", $options: "i" } };
    const gigsData = await getMongoData(query, 'eventDb', 'Gigs');
    
    let updates: Update[] = [];
    
    if (gigsData && gigsData.length > 0) {
      console.log('✅ Using optimized MongoDB Gigs view for updates');
      updates = extractUpdatesFromView(gigsData);
    } else {
      console.log('⚠️ No gigs data found in view, using fallback update');
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
