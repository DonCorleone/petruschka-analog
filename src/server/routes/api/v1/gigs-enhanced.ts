import { defineEventHandler } from 'h3';
import { getMongoData } from '../../../lib/simple-mongo';
import type { Gig } from '../../../../shared/types';

export default defineEventHandler(async (event) => {
  try {
    // Fetch all gigs and locations in parallel
    const [gigsData, locationsData] = await Promise.all([
      getMongoData({}, 'staticDb', 'gigs'),
      getMongoData({}, 'staticDb', 'locations')
    ]);

    if (!gigsData || !locationsData) {
      return {
        success: false,
        data: [],
        timestamp: new Date().toISOString()
      };
    }

    // Create a location lookup map for O(1) access
    const locationMap = new Map();
    locationsData.forEach(location => {
      // Use both _id and ef_id as keys for flexibility
      locationMap.set(location['_id'].toString(), location);
      if (location['ef_id']) {
        locationMap.set(location['ef_id'], location);
      }
    });

    // Transform gigs and enrich with location data
    const enrichedGigs: Gig[] = gigsData.map(item => {
      // Find location data
      const locationData = locationMap.get(item['location']) || 
                          locationMap.get(item['locationId']) || 
                          locationMap.get(item['venue']) || 
                          null;

      return {
        id: parseInt(item['id']) || parseInt(item['_id'].toString().slice(-8), 16),
        date: {
          day: item['day'] || new Date(item['date']).getDate(),
          month: item['month'] || new Date(item['date']).toLocaleDateString('de-DE', { month: 'long' })
        },
        title: item['title'],
        venue: item['venue'],
        location: item['location'],
        time: item['time'],
        dayOfWeek: item['dayOfWeek'] || new Date(item['date']).toLocaleDateString('de-DE', { weekday: 'long' }),
        description: item['description'],
        ticketUrl: item['ticketUrl'],
        // Enhanced fields from legacy data
        longDescription: item['longDescription'],
        shortDescription: item['shortDescription'],
        artists: item['artists'],
        flyerImagePath: item['flyerImagePath'],
        bannerImagePath: item['bannerImagePath'],
        eventDateString: item['eventDateString'],
        ticketTypes: item['ticketTypes'],
        duration: item['duration'],
        ageRecommendation: item['ageRecommendation'],
        importantNotes: item['importantNotes'],
        // Pre-loaded location data
        locationData: locationData ? {
          name: locationData['name'] || '',
          street: locationData['street'] || '',
          postalCode: locationData['postalCode'] || '',
          city: locationData['city'] || '',
          directions: locationData['directions'] || '',
          info: locationData['info'] || ''
        } : undefined
      };
    });

    return {
      success: true,
      data: enrichedGigs,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading enhanced gigs data:', error);
    return {
      success: false,
      data: [],
      timestamp: new Date().toISOString()
    };
  }
});
