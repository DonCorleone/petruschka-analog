import { defineEventHandler, createError } from 'h3';
import { BandMember, ApiResponse } from '../../../../shared/types';
import { getDatabase } from '../../../config/mongodb';

export default defineEventHandler(async (event): Promise<ApiResponse<BandMember[]>> => {
  try {
    // Get MongoDB database instance
    const db = await getDatabase();
    
    // Get the staff collection
    const staffCollection = db.collection('staff');
    
    // Fetch all band members from MongoDB, sorted by sortOrder
    const documents = await staffCollection.find({ "active": true }).sort({ "sortOrder": 1 }).toArray();
    
    // Helper function to truncate HTML content and add ellipsis
    const truncateHtml = (html: string, maxLength: number = 120): string => {
      if (!html) return 'No description available.';
      
      // Remove HTML tags and clean up whitespace
      const textOnly = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      if (textOnly.length <= maxLength) {
        return textOnly;
      }
      
      // Truncate and add ellipsis
      return textOnly.substring(0, maxLength).trim() + '...';
    };

    // Transform MongoDB documents to BandMember format
    const bandMembers: BandMember[] = documents.map((doc: any, index: number) => {
      // Use actual member photos from petruschka.ch with URL-encoded names
      const imagePath = `https://www.petruschka.ch/assets/images/staff/${encodeURIComponent(doc.name || 'Unknown Member')}.jpg?nf_resize=fit&h=240`;
      
      return {
        id: index + 1,
        name: doc.name || 'Unknown Member',
        instrument: doc.topic || 'Unknown Topic',
        image: imagePath,
        description: truncateHtml(doc.bio)
      };
    });

    return {
      success: true,
      data: bandMembers,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching band members from MongoDB:', error);
    
    // During build time or when MongoDB is unavailable, return mock data
    const mockBandMembers: BandMember[] = [
      {
        id: 1,
        name: 'Alex Thunder',
        instrument: 'Lead Guitar',
        image: '/images/members/member-1.png',
        description: 'Shredding strings since 2010, Alex brings the lightning to every performance.'
      },
      {
        id: 2,
        name: 'Sam Rhythm',
        instrument: 'Drums',
        image: '/images/members/member-2.png',
        description: 'The heartbeat of the band, keeping everyone in perfect time.'
      },
      {
        id: 3,
        name: 'Jordan Bass',
        instrument: 'Bass Guitar',
        image: '/images/members/member-3.png',
        description: 'Laying down the foundation with deep, resonant grooves.'
      },
      {
        id: 4,
        name: 'Casey Vocals',
        instrument: 'Lead Vocals',
        image: '/images/members/member-4.png',
        description: 'The voice that carries our message to the world.'
      }
    ];
    
    return {
      success: true,
      data: mockBandMembers,
      timestamp: new Date().toISOString()
    };
  }
});
