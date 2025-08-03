import { defineEventHandler, createError, getRouterParam } from 'h3';
import { Location, ApiResponse } from '../../../../../shared/types';
import { getMongoData } from '../../../../lib/simple-mongo';

export default defineEventHandler(async (event): Promise<ApiResponse<Location>> => {
  try {
    const locationName = getRouterParam(event, 'name');
    
    if (!locationName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Location name is required'
      });
    }

    // Decode the URL-encoded location name
    const decodedLocationName = decodeURIComponent(locationName);
    
    console.log(`🔄 Fetching location data for: ${decodedLocationName}`);
    
    // Get location from MongoDB by name
    const mongoDocuments = await getMongoData({ 
      name: { $regex: new RegExp(`^${decodedLocationName}$`, 'i') } // Case-insensitive exact match
    }, 'staticDb', 'locations');
    
    if (!mongoDocuments || mongoDocuments.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Location '${decodedLocationName}' not found`
      });
    }
    
    const locationDoc = mongoDocuments[0];
    console.log(`✅ Found location: ${locationDoc['name']}`);
    
    // Transform MongoDB document to Location format
    const location: Location = {
      _id: { $oid: locationDoc['_id']?.toString() || '' },
      name: locationDoc['name'] || 'Unknown Location',
      street: locationDoc['street'] || '',
      postalCode: locationDoc['postalCode'] || '',
      city: locationDoc['city'] || '',
      directions: locationDoc['directions'] || '',
      info: locationDoc['info'] || '',
      ef_id: locationDoc['ef_id']
    };

    return {
      success: true,
      data: location,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching location:', error);
    
    // Check if it's already an HTTP error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error; // Re-throw HTTP errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch location data',
      data: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    });
  }
});
