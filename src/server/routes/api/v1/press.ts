import { defineEventHandler } from 'h3';
import { getMongoData } from '../../../lib/simple-mongo';
import type { Press } from '../../../../shared/types';

export default defineEventHandler(async (event) => {
  try {
    // Fetch press data from MongoDB using the shared utility
    const pressData = await getMongoData({}, 'staticDb', 'press_view');

    if (!pressData) {
      console.error('Failed to fetch press data from MongoDB');
      return {
        success: false,
        data: [],
        timestamp: new Date().toISOString()
      };
    }

    // Transform the data to match our Press interface
    const transformedData: Press[] = pressData.map(item => ({
      id: item['_id'].toString(),
      nr: item['nr'],
      desc: item['desc'],
      source: item['source'],
      date: item['date'] instanceof Date ? item['date'].toISOString() : item['date'],
      author: item['author'],
      fileExtension: item['fileExtension'],
      link: item['link'],
      quote: item['quote']
    }));

    // Sort by date (newest first)
    transformedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      data: transformedData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading press data:', error);
    return {
      success: false,
      data: [],
      timestamp: new Date().toISOString()
    };
  }
});
