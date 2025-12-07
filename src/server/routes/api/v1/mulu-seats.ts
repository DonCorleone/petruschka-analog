import { defineEventHandler, createError } from 'h3';
import type { ApiResponse, MuluSeat } from '../../../../shared/types';

export default defineEventHandler(async (): Promise<ApiResponse<MuluSeat[]>> => {
  try {
    console.log('🔄 Fetching MULU seat availability...');

    const response = await fetch(
      'https://mulu.visitate.net/service/web/infofeed/public/tourAvasShort?guided_tour_id=34'
    );

    if (!response.ok) {
      throw new Error(`MULU API returned status ${response.status}`);
    }

    const data = await response.json() as MuluSeat[];

    console.log(`✅ Fetched ${data.length} MULU seat records`);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to fetch MULU seats:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch seat availability',
    });
  }
});
